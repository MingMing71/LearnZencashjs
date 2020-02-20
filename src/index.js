import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import zencashjs from 'zencashjs'
import hdkey from 'hdkey'
const bip39 = require('bip39')

function sendZen(zen: Number = 0, address: String = "null") {
  var utxos = null;

  const Http = new XMLHttpRequest();
  const url = 'https://explorer-testnet.zensystem.io/api/addr/' + zAddr + '/utxo'
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = (e) => {
    if (Http.readyState == 4 && Http.status == 200) {
      var data = JSON.parse(Http.response);
      utxos = data;

      createHexRawTx(utxos, zen, address);
      return;
    }
  }
}


function createHexRawTx(utxos, zen: Number = 0, address: String = "null") {
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
      console.log(bip115BlockHeight, bip115BlockHash, lastUTXO.txid, lastUTXO.vout, zAddr)
      const txobj = zencashjs.transaction.createRawTx(
        [{
          txid: lastUTXO.txid, vout: lastUTXO.vout,
          scriptPubKey: ''
        }],
        [
          { address: address, satoshis: amountToSend },
          { address: zAddr, satoshis: balance - totalChange },
        ],
        bip115BlockHeight,
        bip115BlockHash
      )

      console.log(txobj)

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

var phrase = [
  'sea brown please gold erosion utility table thumb social',
  'immense globe need dawn people labor shy stomach ostrich',
  'capable under wrap episode giant upset brave illness reward'
]
var privKeys = [];

phrase.forEach((phrase) => {
  privKeys.push(zencashjs.address.mkPrivKey(phrase));
});

var pubKeys = privKeys.map((x) => zencashjs.address.privKeyToPubKey(x, true))

var redeemScript = zencashjs.address.mkMultiSigRedeemScript(pubKeys, 2, 3)
var pubKeyHash = zencashjs.config.testnet.pubKeyHash
var zAddr = zencashjs.address.multiSigRSToAddress(redeemScript, pubKeyHash)

sendZen(0.01, 'ztqxUEzHwpxwSjKHm2AsFAxdbBbLZiYWVqX');