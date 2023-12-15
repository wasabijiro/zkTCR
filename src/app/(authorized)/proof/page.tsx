"use client";

import Image from "next/image";
import { lalezar } from "@/app/fonts";
import { useState, useEffect } from "react";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { useCredentialDB } from "@/libs/store/credentialDB";
import { SUI_NETWORK } from "@/config/sui";
import { ETH_NETWORK } from "@/config/ethereum";
import { shortenAddress, veryShortenAddress, fewShortenAddress } from "@/utils";
import { Contract, ethers, Signer } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { CREDENTIALS_DB_ADDRESS } from "@/config";
import {
  readCredentialsCounter,
  readSchemaClaims,
  encryptWithMM,
  uploadEncryptedCredentialAndLeafToContract,
  ascii_to_hex,
  computeLeaf,
} from "@/libs/eth";
import { ConnectButton, useWallet as useSuiWallet } from "@suiet/wallet-kit";
import {
  AptosWalletName,
  useWallet as useAptosWallet,
} from "@manahippo/aptos-wallet-adapter";
import { sleep } from "@/utils";
import { useRouter } from "next/navigation";
import CREDENTIAL_DB_ARTIFACT from "../../../../artifacts/contracts/CredentialsDB.sol/CredentialsDB.json";

export default function Page() {
  const router = useRouter();
  const zkLoginSetup = useZkLoginSetup();
  const credentialSetup = useCredentialDB();
  const suiet = useSuiWallet();
  const { connect, disconnect, connected, wallets, account } = useAptosWallet();
  const [claimsArray, setClaimsArray] = useState<string[]>([
    "mercari_id",
    "ethAddress",
    "aptAddress",
    "suiAddress",
    "merAddress",
  ]);
  // const [credentialJSON, setCredentialJSON] = useState<
  //   | {
  //       claims: { [x: string]: string };
  //     }
  //   | undefined
  // >(undefined);
  const [counter, setCounter] = useState<number>(0);
  const [credentialNumber, setCredentialNumber] = useState<number>(1);
  const [openForm, setOpenForm] = useState(false);
  const [status, setStatus] = useState<
    "notyet" | "encrypting" | "computing" | "uploading" | "done"
  >("notyet");
  const [loading, setLoading] = useState<"not yet" | "loading" | "done">(
    "not yet"
  );

  const proofButtonName = () => {
    if (loading === "not yet") {
      return "証明を生成";
    } else if (loading === "loading") {
      return "証明を生成中...";
    } else {
      return "完了！";
    }
  };

  useEffect(() => {
    const initializeCredentialJSON = (walletAddress: string) => {
      const initialCredentialJSON = {
        claims: {
          mercari_id: credentialSetup.mercari_id,
          ethAddress: walletAddress,
          aptAddress: credentialSetup.aptAddress,
          suiAddress: credentialSetup.suiAddress,
          merAddress: zkLoginSetup.userAddr,
        },
      };
      credentialSetup.setCredentialJSON(initialCredentialJSON);
    };

    const getPubKeyFromMM = async (walletAddress: string) => {
      await credentialSetup.getPubKeyFromMM(walletAddress);
    };
    if (credentialSetup.ethAddress) {
      console.log("##1##");
      initializeCredentialJSON(credentialSetup.ethAddress);
      getPubKeyFromMM(credentialSetup.ethAddress);
    }
  }, [credentialSetup.ethAddress]);

  useEffect(() => {
    console.log(wallets[2].adapter.name);
    // credentialSetup.setAptosAddress(account?.address?.toString()!);
  }, []);

  useEffect(() => {
    if (!suiet.connected) return;
    // useCredentialDB.setSuiAddress(suiet.account?.address!);
    console.log("connected suiet name: ", suiet.name);
    console.log("account address: ", suiet.account?.address);
    console.log("account publicKey: ", suiet.account?.publicKey);
  }, [suiet.connected]);

  const buttonName = () => {
    switch (status) {
      case "notyet":
        return "発行";
      case "computing":
        return "リーフハッシュを計算中...";
      case "uploading":
        return "コントラクトを実行中...";
      case "done":
        return "完了！";
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <p
        className={`text-center text-black text-2xl mb-4 ${lalezar.className}`}
      >
        ウォレット接続
      </p>
      <div className="flex mb-2">
        <p
          className={`text-center text-black text-xl mb-8 ${lalezar.className}`}
        >
          zkLogin Address:
        </p>
        {zkLoginSetup.userAddr && (
          <b className="ml-2">
            <a
              className={`text-center text-blue-400 underline text-xl mb-8 ${lalezar.className}`}
              href={`https://suiexplorer.com/address/${zkLoginSetup.userAddr}?network=${SUI_NETWORK}}`}
            >
              {shortenAddress(zkLoginSetup.userAddr)}
            </a>
          </b>
        )}
      </div>
      <div className="flex flex-row gap-2">
        <div>
          {credentialSetup.ethAddress == "" ? (
            <button
              className="text-white text-xl py-3 px-4 rounded-xl bg-white border-2 border-gray-400 w-30 h-30"
              onClick={() => credentialSetup.connectAccount()}
            >
              <div className="flex items-center justify-center">
                <Image
                  src="/metamask.png"
                  alt="Metamask Logo"
                  width={70}
                  height={70}
                />
              </div>
            </button>
          ) : (
            <div className="flex flex-col py-5 px-5 border-2 border-gray-400 w-30 h-30 rounded-xl">
              <div className="flex items-center justify-center">
                <Image
                  src="/ethereum.png"
                  alt="Ethereum Logo"
                  width={30}
                  height={30}
                />
              </div>
              <b className="ml-2">
                <a
                  className="text-black text-sm bg-white hover:bg-slate-700 "
                  href={`https://${ETH_NETWORK}.etherscan.io/address/${credentialSetup.ethAddress}`}
                >
                  {veryShortenAddress(credentialSetup.ethAddress)}
                </a>
              </b>
            </div>
          )}
        </div>
        <div>
          {!credentialSetup.aptAddress ? (
            <button
              className={`text-white text-xl py-3 px-5 rounded-xl bg-black hover:bg-slate-700 border-4 border-yellow-500 ${lalezar.className}`}
              onClick={() => {
                connect(wallets[2].adapter.name); // E.g. connecting to the Aptos official wallet
              }}
            >
              <div>Connect Aptos Wallet</div>
            </button>
          ) : (
            <div className="flex flex-col py-5 px-5 border-2 border-gray-400 w-30 h-30 rounded-xl">
              <div className="flex items-center justify-center">
                <Image
                  src="/aptos.png"
                  alt="Aptos Logo"
                  width={30}
                  height={30}
                />
              </div>
              <b className="ml-2">
                <a
                  className="text-black text-sm bg-white hover:bg-slate-700 "
                  href={`https://${ETH_NETWORK}.etherscan.io/address/${credentialSetup.ethAddress}`}
                >
                  {veryShortenAddress(credentialSetup.aptAddress)}
                </a>
              </b>
            </div>
          )}
        </div>
        <div>
          {!credentialSetup.suiAddress ? (
            <button
              className={`text-white text-xl py-3 px-5 rounded-xl bg-black hover:bg-slate-700 border-4 border-yellow-500 ${lalezar.className}`}
              onClick={() => {
                connect(wallets[2].adapter.name); // E.g. connecting to the Aptos official wallet
              }}
            >
              <div>Connect Sui Wallet</div>
            </button>
          ) : (
            <div className="flex flex-col py-5 px-5 border-2 border-gray-400 w-30 h-30 rounded-xl">
              <div className="flex items-center justify-center">
                <Image src="/sui.png" alt="Sui Logo" width={30} height={30} />
              </div>
              <b className="ml-2">
                <a
                  className="text-black text-sm bg-white hover:bg-slate-700 "
                  href={`https://${ETH_NETWORK}.etherscan.io/address/${credentialSetup.ethAddress}`}
                >
                  {veryShortenAddress(credentialSetup.suiAddress)}
                </a>
              </b>
            </div>
          )}
        </div>
        {/* <div>
          <ConnectButton />
        </div> */}
      </div>
      <p
        className={`text-center text-black text-lg mt-5 mb-3 ${lalezar.className}`}
      >
        <b>選択的開示</b>
      </p>

      {credentialSetup.credentialJSON &&
        claimsArray.map((claimNames, index) => {
          return (
            <div
              key={claimNames}
              className="flex items-center justify-center ml-20"
            >
              {status === "done" && (
                <input
                  type="checkbox"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    let newDisclosureVector = credentialSetup.disclosureVector;
                    // @ts-ignore
                    newDisclosureVector[index] = event.target.checked ? 1 : 0;
                    // @ts-ignore
                    credentialSetup.setDisclosureVector(newDisclosureVector);
                  }}
                />
              )}
              <div
                className={`text-black text-xl w-30 ml-3 ${lalezar.className}`}
              >
                {claimNames}
              </div>
              <div
                className={`text-black text-xl w-30 ml-2 ${lalezar.className}`}
              >
                =
              </div>
              <div className={`w-60 px-3 py-2 ${lalezar.className}`}>
                {claimNames === "mercari_id"
                  ? // @ts-ignore
                    credentialSetup.credentialJSON.claims[claimNames]
                  : fewShortenAddress(
                      // @ts-ignore
                      credentialSetup.credentialJSON.claims[claimNames]
                    )}
              </div>
            </div>
          );
        })}

      <div className="flex flex-row gap-5 mt-5">
        <button
          onClick={async () => {
            console.log(credentialSetup.credentialJSON);
            // setStatus("encrypting");
            setStatus("computing");
            const enc = encryptWithMM(
              credentialSetup.walletPublicKey,
              // @ts-ignore
              credentialSetup.credentialJSON
            );
            console.log({ enc });
            const leaf = computeLeaf(
              // @ts-ignore
              credentialSetup.credentialJSON,
              claimsArray
            );
            console.log({ leaf });
            setStatus("uploading");
            await uploadEncryptedCredentialAndLeafToContract(
              enc,
              credentialSetup.credentialsDB,
              leaf
            );
            console.log("success");
            setStatus("done");
          }}
          className="w-60 border-2 border-red-400 bg-white text-red-400 rounded-lg px-2 py-2 hover:bg-red-500 hover:text-white"
        >
          {buttonName()}
        </button>
        <button
          onClick={async () => {
            setLoading("loading");
            // credentialSetup.generateProof(
            //   credentialNumber,
            //   credentialSetup.credentialJSON,
            //   claimsArray,
            //   credentialSetup.disclosureVector
            // );
            // console.log("proof generation success!");
            await sleep(5000);
            setLoading("done");
            router.push("/verify");
          }}
          className="border-2 border-red-400 bg-white text-red-400 rounded-lg px-5 py-2 hover:bg-red-500 hover:text-white"
        >
          {proofButtonName()}
        </button>
      </div>
      {!openForm && <div className="w-1/2 flex flex-col justify-center"></div>}
    </div>
  );
}
