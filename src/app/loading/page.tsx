"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { useCredentialDB } from "@/libs/store/credentialDB";

export default function Page() {
  const zkLoginSetup = useZkLoginSetup();
  const credentialSetup = useCredentialDB();
  useEffect(() => {
    if (credentialSetup.isVerified) {
    }
  }, []);
  return (
    <div className="flex flex-col justify-end min-h-screen">
      <div className="flex items-center justify-center mb-4">
        {" "}
        {/* 下部に少しマージンを追加 */}
        <Image src="/loading.png" alt="Loading" width={600} height={150} />
      </div>
    </div>
  );
}
