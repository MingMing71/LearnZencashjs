import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import zencashjs from 'zencashjs'

const priv = zencashjs.address.mkPrivKey('sea brown please gold erosion utility table thumb social')

const privWIF = zencashjs.address.privKeyToWIF(priv)

const pubKey = zencashjs.address.privKeyToPubKey(priv, true) // generate compressed pubKey
// add testnet pubKeyHash
const pubKeyHash = zencashjs.config.testnet.pubKeyHash
const zAddr = zencashjs.address.pubKeyToAddr(pubKey, pubKeyHash)
console.log(zAddr)

const blockHeight = 600030 // Example of current BLOCKHEIGHT
const bip115BlockHeight = blockHeight - 150 // Chaintip - 150 blocks, the block used for the replay protection needs a sufficient number of confirmations
const bip115BlockHash = '00070550a34f04c49568969efdadb5676655420ec1a2a8325390b922d309144d' // Blockhash of block 450000

// current balance (total utxos)
const txobj = zencashjs.transaction.createRawTx(
  [{
      txid: 'f0902d623f45982b07f7c136cd82e2d82e1014d6c38bed26a6a64fa66552c30d', vout: 0,
      scriptPubKey: '76a9149287d2a35f38eda75f6e63e26a83b9db830cf0cd88ac206deeb89e4ead2205e619d70334e7bf9756702a83725cf7edfa7184eb4805080003222709b4'
  }],
  [
    {address: 'ztZuyD5MaPSNdEyDKCZFc6vjyHVshWPWrLg', satoshis: 50000},
    {address: zAddr, satoshis: 49949950}, // this is change address
  ],
  bip115BlockHeight,
  bip115BlockHash
)
console.log(txobj)
console.log( zencashjs.transaction.serializeTx(txobj));

const tx0 = zencashjs.transaction.signTx(txobj, 0, 'ac53d976e649bd9c20d8305507701c54201bf66e946998b1a834ffa78f242dec', true) // The final argument sets the `compressPubKey` boolean. It is `false` by default.
console.log(zencashjs.transaction.serializeTx(tx0))