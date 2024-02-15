"use client"; // This is a client component

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, ParsedAccountData } from "@solana/web3.js";
import axios from "axios";

export default function Main() {

  return (
    <div>
      Hello
    </div>
  );
}
