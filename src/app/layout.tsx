"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { WalletProvider as SuiWalletProvider } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import {
  WalletProvider as AptosWalletProvider,
  HippoWalletAdapter,
  AptosWalletAdapter,
  HippoExtensionWalletAdapter,
  MartianWalletAdapter,
  FewchaWalletAdapter,
  PontemWalletAdapter,
  SpikaWalletAdapter,
  RiseWalletAdapter,
  FletchWalletAdapter,
  TokenPocketWalletAdapter,
  ONTOWalletAdapter,
  BloctoWalletAdapter,
  SafePalWalletAdapter,
  FoxWalletAdapter,
  CloverWalletAdapter,
  SpacecyWalletAdapter,
} from "@manahippo/aptos-wallet-adapter";

const aptosWallets = [
  new HippoWalletAdapter(),
  new MartianWalletAdapter(),
  new AptosWalletAdapter(),
  new FewchaWalletAdapter(),
  new HippoExtensionWalletAdapter(),
  new PontemWalletAdapter(),
  new SpikaWalletAdapter(),
  new RiseWalletAdapter(),
  new FletchWalletAdapter(),
  new TokenPocketWalletAdapter(),
  new ONTOWalletAdapter(),
  new BloctoWalletAdapter({
    bloctoAppId: "6d85f56e-5f2e-46cd-b5f2-5cf9695b4d46",
  }) /** Must provide bloctoAppId **/,
  new SafePalWalletAdapter(),
  new FoxWalletAdapter(),
  new CloverWalletAdapter(),
  new SpacecyWalletAdapter(),
];

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AptosWalletProvider
          wallets={aptosWallets}
          autoConnect={false} /** allow auto wallet connection or not **/
          onError={(error: Error) => {
            console.log("Handle Error Message", error);
          }}
        >
          <SuiWalletProvider>{children}</SuiWalletProvider>
        </AptosWalletProvider>
      </body>
    </html>
  );
}
