"use client"; // This is a client component

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, ParsedAccountData } from "@solana/web3.js";
import axios from "axios";
import Image from "next/image";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Main() {
  return (
    <div className="flex flex-col pork-background">
      <div className="flex justify-between h-[80px] mx-[8px]">
        <div className="flex gap-[4px]">
          <Image
            src="/images/buttons/twitter.svg"
            className="hover:cursor-pointer"
            alt="Twitter SVG"
            width={60}
            height={60}
          />
          <Image
            src="/images/buttons/telegram.svg"
            className="hover:cursor-pointer"
            alt="Twitter SVG"
            width={60}
            height={60}
          />
          <Image
            src="/images/buttons/website.svg"
            className="hover:cursor-pointer"
            alt="Twitter SVG"
            width={60}
            height={60}
          />
          <Image
            src="/images/buttons/chart.svg"
            className="hover:cursor-pointer"
            alt="Twitter SVG"
            width={60}
            height={60}
          />
          <div className="relative flex items-center justify-center w-[128px] hover:cursor-pointer">
            <Image
              src="/images/buttons/buy_pork.svg"
              alt="Twitter SVG"
              className="absolute"
              width={128}
              height={60}
            />
            <span className="text-white z-10 font-lilitaone font-black text-[18px]">
              BUY $PORK
            </span>
          </div>
        </div>

        <div className="flex items-center gap-[4px]">
          <div className="relative flex items-center justify-center w-[180px] hover:cursor-pointer">
            <Image
              src="/images/buttons/deposit_pork.svg"
              alt="Twitter SVG"
              className="absolute"
              width={180}
              height={60}
            />
            <span className="text-white z-10 font-lilitaone font-black text-[18px]">
              DEPOSIT $PORK
            </span>
          </div>

          <WalletMultiButtonDynamic />
        </div>
      </div>
    </div>
  );
}
