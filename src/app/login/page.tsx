"use client";

import Image from "next/image";
import { useLocalStorage } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Account, OpenIdProvider } from "@/types";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { ZKLOGIN_ACCONTS } from "@/config";
import { useLottie } from "@/utils/useLottie";
import { lalezar } from "@/app/fonts";

export default function Page() {
  const router = useRouter();
  const [account, setAccount] = useLocalStorage<Account | null>(
    ZKLOGIN_ACCONTS,
    null
  );
  const zkLoginSetup = useZkLoginSetup();

  useEffect(() => {
    if (account) {
      zkLoginSetup.completeZkLogin(account);
    }
  }, []);

  // https://docs.sui.io/build/zk_login#set-up-oauth-flow
  const beginZkLogin = async (provider: OpenIdProvider) => {
    await zkLoginSetup.beginZkLogin(provider);
    console.log(zkLoginSetup.account());
    setAccount(zkLoginSetup.account());
    console.log(zkLoginSetup.userAddr);
    const loginUrl = zkLoginSetup.loginUrl();
    window.location.replace(loginUrl);
  };

  const openIdProviders: OpenIdProvider[] = [
    "Google",
    // "Twitch",
    // "Facebook",
  ];

  return (
    <div className="grid place-items-center h-screen">
      <div className="pb-32">
        <p
          className={`text-center text-black text-3xl mb-20 ${lalezar.className}`}
        >
          ウォレットを生成
        </p>
        <div className="flex items-center justify-center">
          <Image
            src="/mercari.png"
            alt="Mercari Logo"
            width={150}
            height={150}
          />
        </div>
        <div
          id="login-buttons"
          className="section flex items-center justify-center mt-10"
        >
          {openIdProviders.map((provider) => (
            <button
              className="border-2 border-red-500 bg-white text-red-400 rounded-lg px-10 py-1 sm:py-2 mt-2 sm:mt-4 hover:bg-red-500 hover:text-white"
              onClick={() => {
                beginZkLogin(provider);
              }}
              key={provider}
            >
              <div className="flex items-center gap-2">
                <div className="text-lg">ログインする</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
