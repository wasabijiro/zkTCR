"use client";

import WalletConnect from "@/components/WalletConnect";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed WalletConnect" style={{ top: 0, left: 0 }}>
          <WalletConnect />
        </div>
        {children}
      </body>
    </html>
  );
}
