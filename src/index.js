import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

var zencashjs = require('zencashjs')

var priv = zencashjs.address.mkPrivKey('sea brown please gold erosion utility table thumb social')

var privWIF = zencashjs.address.privKeyToWIF(priv)

var pubKey = zencashjs.address.privKeyToPubKey(priv, true) // generate compressed pubKey

var zAddr = zencashjs.address.pubKeyToAddr(pubKey)
console.log(zAddr)

const blockHeight = 600030 // Example of current BLOCKHEIGHT
const bip115BlockHeight = blockHeight - 150 // Chaintip - 150 blocks, the block used for the replay protection needs a sufficient number of confirmations
const bip115BlockHash = '00070550a34f04c49568969efdadb5676655420ec1a2a8325390b922d309144d' // Blockhash of block 450000

var txobj = zencashjs.transaction.createRawTx(
  [{
      txid: '2ad340b94c11e61f12db01b24f81ce2aca1f600ec44377243bdd2993cebcd382', vout: 0,
      scriptPubKey: '76a914fa1e82f226b4a53fccd6b8e63412d97c789f298e88ac'
  }],
  [{address: 'ztZuyD5MaPSNdEyDKCZFc6vjyHVshWPWrLg', satoshis: 100000}],
  bip115BlockHeight,
  bip115BlockHash
)
console.log(txobj)
console.log( zencashjs.transaction.serializeTx(txobj));

var tx0 = zencashjs.transaction.signTx(txobj, 0, 'ac53d976e649bd9c20d8305507701c54201bf66e946998b1a834ffa78f242dec', false) // The final argument sets the `compressPubKey` boolean. It is `false` by default.
console.log(zencashjs.transaction.serializeTx(tx0))