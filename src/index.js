import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

var zencashjs = require('zencashjs')

var priv = zencashjs.address.mkPrivKey('sea brown please gold erosion utility table thumb social')

var privWIF = zencashjs.address.privKeyToWIF(priv)

var pubKey = zencashjs.address.privKeyToPubKey(priv, true) // generate compressed pubKey

var zAddr = zencashjs.address.pubKeyToAddr(pubKey)

const bip115BlockHeight = 142091
const bip115BlockHash = '001f72eacd9e94cf7c6b91b878d9426eccc040de8f6042f148f8e5415f702b28'

var txobj = zencashjs.transaction.createRawTx(
  [{
      txid: '4fc87e74d2ee3b776d0df5b6d6f0b6da419f536d237642665e20059fe55cf08b', vout: 0,
      scriptPubKey: ''
  }],
  [{address: 'ztZuyD5MaPSNdEyDKCZFc6vjyHVshWPWrLg', satoshis: 10000}],
  bip115BlockHeight,
  bip115BlockHash
)

console.log( zencashjs.transaction.serializeTx(txobj));

var tx0 = zencashjs.transaction.signTx(txobj, 0, 'ac53d976e649bd9c20d8305507701c54201bf66e946998b1a834ffa78f242dec', true) // The final argument sets the `compressPubKey` boolean. It is `false` by default.
console.log(zencashjs.transaction.serializeTx(tx0))