"use client";

import { lalezar } from "@/app/fonts";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWalletSetup } from "@/libs/store/wallet";
import { sleep } from "@/utils";

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

  return (
    <div>
      <button
        type="submit"
        className={`border-2 bg-blue-600 text-white text-2xl rounded-lg px-8 py-2 hover:bg-blue-700 ${lalezar.className}`}
        onClick={async () => {
          setLoading("loading");
          console.log(walletSetup.account);
          walletSetup.depositTCR(walletSetup.account, "50");
          await sleep(10000);
          setLoading("done");
          // router.push("/vote");
        }}
      >
        {depositButtonName()}
      </button>
    </div>
  );
};

export default Page;
