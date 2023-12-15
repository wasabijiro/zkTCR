"use client";

import { lalezar } from "@/app/fonts";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWalletSetup } from "@/libs/store/wallet";
import { sleep } from "@/utils";
import Image from 'next/image'

const Page = () => {
  const router = useRouter();
  const walletSetup = useWalletSetup();

  const [loading, setLoading] = useState<"not yet" | "loading" | "done">(
    "not yet"
  );

  const depositButtonName = () => {
    if (loading === "not yet") {
      return "Challenge";
    } else if (loading === "loading") {
      return "Depositing...";
    } else {
      // return "Done!";
      return "Depositing...";
    }
  };

  const currentItem = {
    title: "自然と調和するエコフレンドリーシャンプー",
    description: "このエコフレンドリーシャンプーは、全て天然由来成分で作られており、環境への影響を最小限に抑えることを目指しています。"
  }

  return (
    <>
      {currentItem &&
        <div className='pt-3'>
          <h2 className='text-center m-3 text-3xl'>{currentItem.title}</h2>
          <div className="flex">
            <div className="w-1/2 p-10 flex justify-center items-center">
              <Image
                className="rounded-t-lg object-contain"
                src="/shampoo.png"
                alt=""
                width={500}
                height={300}
              />
            </div>
            <div className="w-1/2 p-4">
              <p className="text-xl">{currentItem.description}</p>
              <div className="m-4">
                <button
                  type="submit"
                  className={`border-2 bg-blue-600 text-white text-2xl rounded-lg px-8 py-2 hover:bg-blue-700 ${lalezar.className}`}
                  onClick={async () => {
                    setLoading("loading");
                    // console.log(walletSetup.account);
                    // walletSetup.depositTCR(walletSetup.account, "50");
                    await sleep(10000);
                    setLoading("done");
                    // router.push("/vote");
                  }}
                >
                  {depositButtonName()}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </>
  );
};

export default Page;
