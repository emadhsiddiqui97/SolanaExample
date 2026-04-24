import React, { useState } from "react";
import { airdropMultiple } from "./airdrop_multiple";
import { PublicKey } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { airdropTest } from "./airdrop_test";
import { wallets } from "data/wallets";
import { airdropWithAta } from "./airdropWithAta";
import InputComponent from "components/Input";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

const AirdropMultiple = () => {
  const getNewWallets = (numberOfWallets: number) => {
    let wallets: PublicKey[] = [];
    for (let index = 0; index < numberOfWallets; index++) {
      const wallet = Keypair.generate().publicKey;
      wallets.push(wallet);
      console.log(wallet.toBase58());
    }
    return wallets;
  };

  const loader = () => {
    return (
      <div className="flex items-center justify-center m-[10px]">
        <div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4"></div>
        <div className="ml-2"> Processing... </div>
      </div>
    );
  };

  const getKeypair = (privateKey: string): Keypair => {
    let userKeypair: Keypair;
    try {
      userKeypair = Keypair.fromSecretKey(
        Uint8Array.from(bs58.decode(privateKey))
      );
      return userKeypair;
    } catch (error) {
      throw error;
    }
  };
  const batchSend = async (
    wallets: PublicKey[],
    wallet: AnchorWallet,
    privateKey: string,
    amount: number
  ) => {
    setLoading(true);
    const userKeypair = getKeypair(privateKey);

    for (let index = 0; index < wallets.length / 5; index++) {
      console.log("start index: ", index * 5, "\nend index: ", index * 5 + 5);
      const walletSlice = wallets.slice(index * 5, index * 5 + 5);
      const isCancelled = await airdropWithAta(
        wallet,
        amount,
        walletSlice,
        userKeypair
      );
      if (isCancelled) {
        break;
      }
      console.log("waiting for 10s");
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log("continuing...");
    }
    setLoading(false);
  };
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const wallet: any = useAnchorWallet();
  return (
    <div>
      <InputComponent
        label="Private key"
        type="text"
        value={privateKey}
        onChange={setPrivateKey}
      />
      <InputComponent
        label="Amount"
        type="number"
        value={amount}
        onChange={setAmount}
      />
      <button
        className="group w-60 m-2 btn  bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
        onClick={async () => {
          await batchSend(
            getNewWallets(50),
            wallet,
            privateKey,
            parseInt(amount)
          );
          // await airdropWithAta(wallet, 2, getNewWallets(10));
          // await airdropTest(wallet, 2, getNewWallets(3));
          // await airdropTest(wallet, 2, wallets);
        }}
        //   disabled={!publicKey}
      >
        <div className="hidden group-disabled:block ">Wallet not connected</div>
        {/* <span className="block group-disabled:hidden">Air Drop Token</span> */}
        <span className="block group-disabled:hidden">
          {loading ? loader() : "Send to new wallets"}
        </span>
      </button>
      <button
        className="group w-60 m-2 btn  bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
        onClick={async () => {
          // await airdropWithAta(wallet, 2, getNewWallets(10));
          // await airdropTest(wallet, 2, getNewWallets(3));
          await airdropWithAta(
            wallet,
            parseInt(amount),
            wallets,
            getKeypair(privateKey)
          );
        }}
        //   disabled={!publicKey}
      >
        <div className="hidden group-disabled:block ">Wallet not connected</div>
        {/* <span className="block group-disabled:hidden">Air Drop Token</span> */}
        <span className="block group-disabled:hidden">
          Send to existing wallets
        </span>
      </button>
    </div>
  );
};

export default AirdropMultiple;
