"use client";
import Button from "./components/Button";
import { createToken } from "./utils/create_token";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { endPoint } from "./constants";
import {
  AnchorWallet,
  ConnectionProvider,
  useAnchorWallet,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import useIsMounted from "./hooks/useIsMounted";
import InputComponent from "./components/Input";
import { useState } from "react";
import SendToken from "./components/SendToken";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";

export default function Home() {
  const phantomWallet: any | unknown = new PhantomWalletAdapter();

  return (
    <ConnectionProvider endpoint={endPoint}>
      <WalletProvider wallets={[phantomWallet]}>
        <WalletModalProvider>
          <HomePage />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
