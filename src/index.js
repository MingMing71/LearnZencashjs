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
  const lastUTXO = utxos.find(function (transaction) {
    return transaction.height;
  });
  if (!lastUTXO.height) {
    alert("Last transaction was not confirmed");
    return;
  }

  const blockHeight = lastUTXO.height
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

  Http.onreadystatechange = (e) => {
    if (Http.readyState == 4 && Http.status == 200) {
      var data = JSON.parse(Http.response);
      bip115BlockHash = data.blockHash;

      const txobj = zencashjs.transaction.createRawTx(
        [{
          txid: lastUTXO.txid, vout: lastUTXO.vout,
          scriptPubKey: ''
        }],
        [
          { address: recipientAddr, satoshis: amountToSend },
          { address: senderAddr, satoshis: balance - totalChange },
        ],
        bip115BlockHeight,
        bip115BlockHash
      )

      var sig1 = zencashjs.transaction.multiSign(txobj, 0, privKeys[0], redeemScript)

      var sig2 = zencashjs.transaction.multiSign(txobj, 0, privKeys[1], redeemScript)

      var tx0 = zencashjs.transaction.applyMultiSignatures(txobj, 0, [sig1, sig2], redeemScript)

      var serializedTx = zencashjs.transaction.serializeTx(tx0)
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

  http.onreadystatechange = function () {//Call a function when the state changes.
    if (http.readyState == 4 && http.status == 200) {
      alert(http.responseText);
    }
    else {
      // alert(http.responseText);
    }
  }
  http.send(params);
}

var hdnode;
var privKeys = [];
var pubKeys;
var redeemScript;
var pubKeyHash;
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
    // const root = hdkey.fromMasterSeed(response[i]);
    // hdmasternode.push(root);
    // const addrNode = root.derive("m"); //line 1
    // privKeys.push(addrNode._privateKey.toString('hex'));
    const hdnode = bip32.fromSeed(response[i]);
    const derivedNode = hdnode.derive(0);
    privKeys.push(derivedNode.privateKey.toString('hex'));
  }

  pubKeys = privKeys.map((x) => zencashjs.address.privKeyToPubKey(x, true))

  redeemScript = zencashjs.address.mkMultiSigRedeemScript(pubKeys, 2, 3)
  pubKeyHash = zencashjs.config.testnet.pubKeyHash
  zAddr = zencashjs.address.multiSigRSToAddress(redeemScript, pubKeyHash)
  console.log(zAddr);

  sendZen(0.001, zAddr, 'ztqxUEzHwpxwSjKHm2AsFAxdbBbLZiYWVqX');
});
