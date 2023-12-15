// src/libs/eth.ts
import React, { Component, useState } from "react";
import styles from "../../styles/Home.module.css";
import { Contract, ethers, Signer } from "ethers";
import { decrypt, encrypt } from "@metamask/eth-sig-util";
import { isGeneratorFunction } from "util/types";
// @ts-ignore
import { poseidon } from "circomlibjs";
import { throws } from "assert";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import VERIFIER_ARTIFACT from "../../artifacts/contracts/zkVerifiableCredentialsDBCoreVerifier.sol/Verifier.json";

const groth16 = require("snarkjs").groth16;

//Read credentials counter
export async function readCredentialsCounter(contract: Contract | undefined) {
  if (contract) {
    //get claims array from schema
    const credentialsCounter = await contract.credentialsCounter();
    return credentialsCounter;
  }
}

//read claims array from contract
export async function readSchemaClaims(contract: Contract | undefined) {
  if (contract) {
    //get claims array from schema
    const readCredentialsSchema = await contract.credentialsSchema();
    const readCredentialsSchemaJSON = JSON.parse(readCredentialsSchema);
    const claimsArray = readCredentialsSchemaJSON.schema_json.claims;

    return claimsArray;
  }
}

//asymetric encrytion with MetaMask
export function encryptWithMM(
  publicKey: string,
  credential: { claims: { [x: string]: string } }
): string {
  const enc = encrypt({
    publicKey: publicKey,
    data: JSON.stringify(credential),
    version: "x25519-xsalsa20-poly1305",
  });

  return JSON.stringify(enc);
}

//download encypted data to contract. this function do not goes here, goes in subject portal
export async function downloadEncryptedCredentialFromContract(
  index: number,
  contract: Contract | undefined
) {
  if (contract) {
    const encCredential = await contract.viewArray(index);
    return encCredential;
  }
}

//asymetric decrytion with MetaMask this function do not goes here, goes in subject portal
export async function decryptionWithMM(
  walletAddress: string,
  encCredential: string
) {
  // @ts-ignore
  if (window.ethereum) {
    const dataHexLike = `0x${Buffer.from(encCredential, "utf-8").toString(
      "hex"
    )}`;

    // @ts-ignore
    const decrypt = await window.ethereum.request!({
      method: "eth_decrypt",
      params: [dataHexLike, walletAddress],
    });
    return decrypt;
  }
}

//upload encypted data to contract.
export async function uploadEncryptedCredentialAndLeafToContract(
  encCredential: string,
  contract: Contract | undefined,
  leaf: string
) {
  if (contract) {
    const tx = await contract.saveCredential(encCredential, leaf);
    const txReceip = await tx.wait();
    if (txReceip.status !== 1) {
      alert("error while uploading credential");
      return;
    }
  }
}

//convert ascii to hex
export function ascii_to_hex(str: string) {
  var arr1 = ["0x"];
  for (var n = 0, l = str.length; n < l; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join("");
}

//compute merkle leaf from Credential
export function computeLeaf(
  credentialJSON: { claims: { [x: string]: string } },
  claimsArray: [string] | undefined
) {
  if (credentialJSON.claims.ethAddress) {
    if (claimsArray) {
      const ethAddress = credentialJSON.claims.ethAddress;
      //claim values are type string, has to be converted to ascii bytes like(Address is not converted)
      let convertedArrayHex: string[] = [];

      for (let i in claimsArray) {
        if (claimsArray[i] !== "ethAddress") {
          convertedArrayHex.push(
            ascii_to_hex(credentialJSON.claims[claimsArray[i]])
          );
        } else {
          convertedArrayHex.push(credentialJSON.claims[claimsArray[i]]);
        }
      }

      //compute CredentialHash
      // @ts-ignore
      var hashDigest = poseidon([convertedArrayHex[0], convertedArrayHex[1]]);
      if (claimsArray.length > 2) {
        for (let i = 2; i < claimsArray.length; i++) {
          hashDigest = poseidon([hashDigest, convertedArrayHex[i]]);
        }
      }
      //hash CredentialHash and ethAddress
      const leaf = poseidon([hashDigest, ethAddress]);
      return leaf;
    }
  } else {
    throw "ethAddress not found as atribute in credential JSON";
  }
}

export async function generateMerkleProof(
  contract: Contract | undefined,
  credentialNumber: number
) {
  /*Reproduce Merkle Tree that is in the contract and generatig the proof*/
  if (contract) {
    const depth = await contract.TREE_DEPTH();
    const leavesArray = await contract.getLeavesArray();

    const tree = new IncrementalMerkleTree(poseidon, depth, BigInt(0), 2);
    leavesArray.forEach((element: ethers.BigNumber) => {
      tree.insert(element.toBigInt());
    });

    const proof = tree.createProof(credentialNumber - 1);

    return proof;
  }
}

export async function generateZKProof(
  credentialJSON: { claims: { [x: string]: string } },
  claimsArray: [string] | undefined,
  merkleProof: any,
  disclosureVector: [number]
) {
  const ethAddress = credentialJSON.claims.ethAddress;
  //claim values are string type. ascii bytes like conversion (Address is not converted)
  let convertedArrayHex: string[] = [];
  if (claimsArray) {
    for (let i in claimsArray) {
      if (claimsArray[i] !== "ethAddress") {
        convertedArrayHex.push(
          ascii_to_hex(credentialJSON.claims[claimsArray[i]])
        );
      } else {
        convertedArrayHex.push(credentialJSON.claims[claimsArray[i]]);
      }
    }
  }
  //convertig sibligs form [BigInt] to hexStirng
  var siblings = merkleProof.siblings.map((val: any) => {
    var value = ethers.BigNumber.from(val[0]);
    return value.toHexString();
  });

  var root: any = ethers.BigNumber.from(merkleProof.root);
  root = root.toHexString();

  const inputs = {
    ClaimsVals: convertedArrayHex,
    MerkleProofSiblings: siblings,
    MerkleProofPathIndices: merkleProof.pathIndices,
    MerkleProofRoot: root,
    EthAddress: ethAddress,
    DisclosureVector: disclosureVector,
  };

  console.log({ inputs });

  // const prover_inputs = {
  //   ClaimsVals: [
  //     "0x31",
  //     "0x571dBF2F5AA06781Bc673A3DC5b1c622a8344519",
  //     "0x776173616269",
  //     "0x3232",
  //     "0x31303233",
  //   ],
  //   MerkleProofSiblings: [
  //     "0x29433dbd445abbb9602a9dc5e171a9a9d2ebaf598c43e38af63fcca2684541ed",
  //     "0x2098f5fb9e239eab3ceac3f27b81e481dc3124d55ffed523a839ee8446b64864",
  //     "0x1069673dcdb12263df301a6ff584a7ec261a44cb9dc68df067a4774460b1f1e1",
  //     "0x18f43331537ee2af2e3d758d50f72106467c6eea50371dd528d57eb2b856d238",
  //     "0x07f9d837cb17b0d36320ffe93ba52345f1b728571a568265caac97559dbc952a",
  //     "0x2b94cf5e8746b3f5c9631f4c5df32907a699c58c94b2ad4d7b5cec1639183f55",
  //     "0x2dee93c5a666459646ea7d22cca9e1bcfed71e6951b953611d11dda32ea09d78",
  //     "0x078295e5a22b84e982cf601eb639597b8b0515a88cb5ac7fa8a4aabe3c87349d",
  //     "0x2fa5e5f18f6027a6501bec864564472a616b2e274a41211a444cbe3a99f3cc61",
  //     "0x0e884376d0d8fd21ecb780389e941f66e45e7acce3e228ab3e2156a614fcd747",
  //     "0x1b7201da72494f1e28717ad1a52eb469f95892f957713533de6175e5da190af2",
  //     "0x1f8d8822725e36385200c0b201249819a6e6e1e4650808b5bebc6bface7d7636",
  //     "0x2c5d82f66c914bafb9701589ba8cfcfb6162b0a12acf88a8d0879a0471b5f85a",
  //     "0x14c54148a0940bb820957f5adf3fa1134ef5c4aaa113f4646458f270e0bfbfd0",
  //     "0x190d33b12f986f961e10c0ee44d8b9af11be25588cad89d416118e4bf4ebe80c",
  //     "0x22f98aa9ce704152ac17354914ad73ed1167ae6596af510aa5b3649325e06c92",
  //   ],
  //   MerkleProofPathIndices: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   MerkleProofRoot:
  //     "0x11b144258f30cbda405fc7d8b84768e609facd82e055d34da5ea2f686629b1da",
  //   EthAddress: "0x571dBF2F5AA06781Bc673A3DC5b1c622a8344519",
  //   DisclosureVector: [0, 1, 1, 0, 0],
  // };

  const { proof, publicSignals } = await groth16.fullProve(
    inputs,
    // prover_inputs,
    "/circuits/zkVerifiableCredentialsDBCore.wasm",
    "/circuits/circuit_final.zkey"
    // "zkVerifiableCredentialsDBCore.wasm",
    // "circuit_final.zkey"
  );

  return { proof, publicSignals };
}

export async function verifyProof(
  proofPack: any,
  credentialsDB: Contract | undefined,
  signer: Signer | undefined
) {
  const calldata = await groth16.exportSolidityCallData(
    proofPack.proof,
    proofPack.publicSignals
  );

  const argv = calldata.replace(/[[\]"\s]/g, "").split(",");

  // Building R1CS vectors
  const a = [argv[0], argv[1]];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ];
  const c = [argv[6], argv[7]];

  // Computation result
  const Input = argv.slice(8);

  //connect account to verifier contract
  let verifier: Contract | undefined;
  if (credentialsDB) {
    const verifierAddress = credentialsDB.verifier();
    //get contract object
    const abi = new ethers.utils.Interface(VERIFIER_ARTIFACT.abi);
    verifier = new ethers.Contract(verifierAddress, abi, signer);

    // Sends the poof to verifier smart contract to evalate it
    const result = await verifier.verifyProof(a, b, c, Input);
    return { result, Input };
  }
}
