// scripts/deploy.ts
import { JsonRpcBatchProvider } from "@ethersproject/providers";
import { ethers } from "hardhat";
import credentialsSchema from "../src/config/credentialschema.json"; //Import custom credentials schema
// @ts-ignore
import { poseidon_gencontract as poseidonContract } from "circomlibjs";

async function main() {
  //deploy libs
  const poseidonT3ABI = poseidonContract.generateABI(2);
  const poseidonT3Bytecode = poseidonContract.createCode(2);

  console.log({ credentialsSchema });

  const [signer] = await ethers.getSigners();

  const PoseidonLibFactory = new ethers.ContractFactory(
    poseidonT3ABI,
    poseidonT3Bytecode,
    signer
  );
  const poseidonT3Lib = await PoseidonLibFactory.deploy();
  await poseidonT3Lib.deployed();

  console.log(
    `Poseidon hash lib deployed in address: ${poseidonT3Lib.address}`
  );

  const IncrementalBinaryTreeLibFactory = await ethers.getContractFactory(
    "IncrementalBinaryTree",
    {
      libraries: {
        PoseidonT3: poseidonT3Lib.address,
      },
    }
  );
  const incrementalBinaryTreeLib =
    await IncrementalBinaryTreeLibFactory.deploy();
  await incrementalBinaryTreeLib.deployed();

  console.log(
    `incrementalBinaryTreeLib deployed in address: ${incrementalBinaryTreeLib.address}`
  );

  // Verifier contract deployment
  const Verifier = await ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();

  console.log(`Verifier contract deployed in address: ${verifier.address}`);

  //credentials DB deployment
  const CredentialsDB = await ethers.getContractFactory("CredentialsDB", {
    libraries: {
      IncrementalBinaryTree: incrementalBinaryTreeLib.address,
    },
  });
  const credentialsDB = await CredentialsDB.deploy(verifier.address);
  await credentialsDB.deployed();
  console.log("success credentialsDB.sol deployment");

  //Add contract address to JSON
  credentialsSchema["schema_json"][
    "schema_location"
  ] = `${credentialsDB.address}:credentialsSchema`;
  const schemaJsonString = JSON.stringify(credentialsSchema);
  console.log({ schemaJsonString });
  const tx = await credentialsDB.setCredentialsSchema(schemaJsonString);

  //check contract variables
  const owner = await credentialsDB.owner();
  const address = await credentialsDB.address;
  const readCredentialsSchema = await credentialsDB.credentialsSchema();
  console.log("Owner: " + owner);
  console.log("Contract address:" + address);
  console.log("Credentials schema: ");
  console.log({ readCredentialsSchema });
  console.log(JSON.parse(readCredentialsSchema));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
