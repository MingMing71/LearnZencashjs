import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import zencashjs from 'zencashjs'
import hdkey from 'hdkey'
const bip39 = require('bip39')
const bip32 = require('bip32')

function sendZen(zen: Number = 0, senderAddr: String, recipientAddr: String) {
  var utxos = null;

  const Http = new XMLHttpRequest();
  const url = 'https://explorer-testnet.zensystem.io/api/addr/' + senderAddr + '/utxo'
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = (e) => {
    if (Http.readyState == 4 && Http.status == 200) {
      var data = JSON.parse(Http.response);
      utxos = data;

      createHexRawTx(utxos, zen, senderAddr, recipientAddr);
      return;
    }
  }
}


function createHexRawTx(utxos, zen: Number = 0, senderAddr: String, recipientAddr: String) {
  const confirmedUTXO = utxos.find(function (transaction) { // using to get the blockheight
    return transaction.height;
  });
  if (!confirmedUTXO || !confirmedUTXO.height) {
    alert("UTXO error");
    return;
  }

  const blockHeight = confirmedUTXO.height
  const bip115BlockHeight = blockHeight - 150
  var bip115BlockHash = null;

  var balance;
  if (utxos.length > 1) {
    balance = utxos.reduce((txA, txB) => txA.satoshis + txB.satoshis);;
  }
  else {
    balance = utxos[0].satoshis;
  }

  const amountToSend = zen * 100000000;
  const totalChange = amountToSend * 1.01; // fee 1%

  const Http = new XMLHttpRequest();
  const url = 'https://explorer-testnet.zensystem.io/api/block-index/' + bip115BlockHeight
  Http.open("GET", url);
  Http.send();

  var inputs = [];
  utxos.forEach(each => {
    const eachTX = {
      txid: each.txid, vout: each.vout,
      scriptPubKey: ''
    };
    inputs.push(eachTX);
  });

  Http.onreadystatechange = (e) => {
    if (Http.readyState == 4 && Http.status == 200) {
      var data = JSON.parse(Http.response);
      bip115BlockHash = data.blockHash;

      const txobj = zencashjs.transaction.createRawTx(
        inputs,
        [
          { address: recipientAddr, satoshis: amountToSend },
          { address: senderAddr, satoshis: balance - totalChange },
        ],
        bip115BlockHeight,
        bip115BlockHash
      )

      var finalTX = null;

      for(var i = 0; i < utxos.length; i++) {
        var sig1 = zencashjs.transaction.multiSign(txobj, i, privKeys[0], redeemScript)
        var sig2 = zencashjs.transaction.multiSign(txobj, i, privKeys[1], redeemScript)
  
        if(finalTX == null) {
          var finalTX = zencashjs.transaction.applyMultiSignatures(txobj, i, [sig1, sig2], redeemScript)
        }
        else {
          var finalTX = zencashjs.transaction.applyMultiSignatures(finalTX, i, [sig1, sig2], redeemScript)
        }
      }
      
      var serializedTx = zencashjs.transaction.serializeTx(finalTX)
      console.log(serializedTx);

      // sendRawTx(serializedTx)
      return serializedTx;
    }
  }
}

function sendRawTx(rawTx: String) {
  var http = new XMLHttpRequest();
  var url = 'https://explorer-testnet.zensystem.io/api/tx/send';
  var params = "rawtx=" + rawTx;

  http.open('POST', url);
  http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      alert(http.responseText);
    }
    else {
      // TODO: fail
    }
  }
  http.send(params);
}

//////// Main::START
var privKeys = [];
var pubKeys;
var redeemScript;
var scriptHash;
var zAddr;

const mnemonic = [
  'capable under wrap episode giant upset brave illness reward chicken useless above',
  'fatal situate measure sound cradle ancient barely resist avoid inform hunt soft',
  'ceiling box blast satoshi door captain soul reveal throw shock blossom match'
];
const seed = mnemonic.map((each) => bip39.mnemonicToSeed(each));

var hdmasternode = [];
Promise.all(seed).then((response) => {
  for (var i = 0; i < response.length; i++) {
    const hdnode = bip32.fromSeed(response[i]);
    const derivedNode = hdnode.derive(0);
    privKeys.push(derivedNode.privateKey.toString('hex'));
  }

  pubKeys = privKeys.map((x) => zencashjs.address.privKeyToPubKey(x, true))
  redeemScript = zencashjs.address.mkMultiSigRedeemScript(pubKeys, 2, 3)
  scriptHash = zencashjs.config.testnet.scriptHash
  zAddr = zencashjs.address.multiSigRSToAddress(redeemScript, scriptHash)
  console.log(zAddr);

  sendZen(0.0001, zAddr, 'ztqxUEzHwpxwSjKHm2AsFAxdbBbLZiYWVqX');
});
//////// Main::END