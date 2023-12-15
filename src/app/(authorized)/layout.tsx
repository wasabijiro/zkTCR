"use client";

import { lalezar } from "@/app/fonts";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import { FooterMenu } from "@/components/FooterMenu";
import { moveCallSponsoredMint } from "@/libs/sponsoredZkLogin";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { useCredentialDB } from "@/libs/store/credentialDB";
import { useLocalStorage } from "usehooks-ts";
import { ZKLOGIN_ACCONTS } from "@/config";
import type { Account } from "@/types";
import { shortenAddress } from "@/utils";

export default function AuthorizedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const zkLoginSetup = useZkLoginSetup();
  const credentialSetup = useCredentialDB();

  const [account, setAccount] = useLocalStorage<Account | null>(
    ZKLOGIN_ACCONTS,
    null
  );

  useEffect(() => {
    if (account) {
      zkLoginSetup.completeZkLogin(account);
      // console.log(zkLoginSetup.account());
      // setAccount(zkLoginSetup.account());
    }
  }, []);

  useEffect(() => {
    const initializeCredentialJSON = (walletAddress: string) => {
      const initialCredentialJSON = {
        claims: {
          vote: "1",
          ethAddress: walletAddress,
          balance: "60",
          weight: "0.6",
          val: "0.6",
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

  const logout = async () => {
    setAccount(null);
    zkLoginSetup.initZkLogin();
    router.push("/login");
  };

  const status = () => {
    if (!zkLoginSetup.userAddr) {
      return "Generating user address...";
    }

    if (!zkLoginSetup.zkProofs && zkLoginSetup.isProofsLoading) {
      return "Generating zk proof...";
    }

    return "Send sponsored tx with zk login";
  };

  const sendTestTx = async () => {
    const txb = new TransactionBlock();
    const account = zkLoginSetup.account();
    console.log("account", account);
    console.log(zkLoginSetup.userAddr);
    const result = await moveCallSponsoredMint(txb, account);
    console.log(result.effects?.status.status);
  };

  return (
    <>
      <div className="flex flex-row justify-center items-center mt-12">
        <p
          className={`text-center text-black text-8xl mb-2 ${lalezar.className}`}
        >
          zkTCR
        </p>
        <header className="absolute top-0 right-0 mr-8 mt-8">
          <div>
            {credentialSetup.ethAddress == "" ? (
              <button
                className={`border-2 bg-blue-500 text-white text-2xl rounded-lg px-8 py-2 hover:bg-blue-700 ${lalezar.className}`}
                onClick={() => credentialSetup.connectAccount()}
              >
                {" "}
                <div>Connect Wallet</div>
              </button>
            ) : (
              <div
                className={`border-2 bg-blue-500 text-white text-2xl rounded-lg px-8 py-2 hover:bg-blue-700 ${lalezar.className}`}
              >
                {shortenAddress(credentialSetup.ethAddress)}
              </div>
            )}
          </div>
        </header>
      </div>

      {children}

      <div className="fixed bottom-0 left-0 w-full">
        <FooterMenu />
      </div>

      {/* <div className="fixed top-0 right-0 p-4 flex flex-col gap-4">
        <button
          onClick={sendTestTx}
          className={`flex items-center justify-center text-white py-3 px-5 rounded-xl w-80 ${
            !zkLoginSetup.zkProofs
              ? "bg-gray-500"
              : "bg-blue-600 hover:bg-slate-700"
          }`}
        >
          {!zkLoginSetup.zkProofs && (
            <div className="animate-spin h-5 w-5 mr-3 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          )}
          {status()}
        </button>

        <button
          className={`text-white py-3 px-5 rounded-xl w-80 ${
            !zkLoginSetup.zkProofs
              ? "bg-gray-500"
              : "bg-blue-600 hover:bg-slate-700"
          }`}
          onClick={logout}
        >
          Log out
        </button>
      </div> */}
    </>
  );
}
