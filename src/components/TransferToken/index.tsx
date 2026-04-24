import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import React, { useCallback, useState } from "react";
import { sendToken } from "./send";
import { solConfig } from "config/solana";
import * as anchor from "@project-serum/anchor";
import { getMintAddress } from "helpers/mintAddress";
import { notify } from "utils/notifications";
import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import useUserTokenBalanceStore from "stores/useTokenBalanceStore";
import InputComponent from "components/Input";
import { PublicKey } from "@solana/web3.js";

const TransferToken = () => {
  const wallet: any = useAnchorWallet();
  // const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { getUserTokenBalance } = useUserTokenBalanceStore();
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const sendToken = useCallback(
    async (amount: any, address?: string) => {
      const idlFile: any = solConfig.idl;
      const [tokenAddress] = await getMintAddress();
      let depositAddress;
      address
        ? (depositAddress = new PublicKey(address))
        : (depositAddress = publicKey);
      amount = parseInt(amount);
      // amount = amount * LAMPORTS_PER_SOL
      // const amountBN = new anchor.BN(JSON.stringify(amount))
      const provider = new anchor.AnchorProvider(connection, wallet, {});
      const program = new anchor.Program(
        idlFile,
        solConfig.programId,
        provider
      );
      console.log(depositAddress.toBase58());
      const senderAtaInstruction = await getOrCreateAssociatedTokenAccount(
        connection,
        solConfig.adminWallet,
        tokenAddress,
        solConfig.adminWallet.publicKey,
        true
      );
      const depositAtaInstruction = await getOrCreateAssociatedTokenAccount(
        connection,
        solConfig.adminWallet,
        tokenAddress,
        depositAddress,
        true
      );
      const context = {
        from: solConfig.adminWallet.publicKey,
        fromAta: senderAtaInstruction.address,
        toAta: depositAtaInstruction.address,
        tokenProgram: TOKEN_PROGRAM_ID,
      };
      try {
        // let signedTx;
        // let confirmedTx;
        const amountBN = new anchor.BN(
          JSON.stringify(amount * LAMPORTS_PER_SOL)
        );
        const tx = await program.methods
          .transferToken(amountBN)
          .accounts(context)
          .signers([solConfig.adminWallet])
          .transaction();
        console.log(tx);
        const txid = await sendAndConfirmTransaction(connection, tx, [
          solConfig.adminWallet,
        ]);
        notify({
          type: "success",
          message: "Token Deposited!",
          txid: txid,
        });
        getUserTokenBalance(address ? publicKey : depositAddress);
      } catch (error: any) {
        if (
          error.message &&
          error.message.includes("User rejected the request")
        ) {
          // console.log("transaction cancelled");
        } else {
          notify({
            type: "error",
            message: `Deposit failed!`,
            description: error?.message,
            txid: "",
          });
          notify({
            type: "error",
            message: `Deposit failed!`,
            description: error?.message,
            txid: "",
          });
          console.error("Failed to send tokens: ", error.message);
        }
      }
    },
    [publicKey, connection]
  );
  const [amount, setAmount] = useState("");
  const [airdropAmount, setAirdropAmount] = useState("");
  const [address, setAddress] = useState("");

  return (
    <>
      {/* <div className={`flex justify-between mb-4`}>
        <span>Air Drop</span>
        <span>Get it for your self</span>
      </div> */}
      <div className="flex flex-row justify-center">
        <div className="relative group items-center flex space-x-8">
          {/* <div
          className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
        ></div> */}
          <div className="m-1 absolute "></div>
          <div className="flex flex-col justify-around items-center">
            <div className="flex flex-col justify-between space-x-4">
              <InputComponent
                type="text"
                value={address}
                label="Address"
                onChange={setAddress}
              />
              <InputComponent
                type="text"
                value={airdropAmount}
                label="Amount"
                onChange={setAirdropAmount}
              />
            </div>
            <button
              className="group w-60 m-2 btn  bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
              onClick={async () => {
                await sendToken(airdropAmount, address);
              }}
              //   disabled={!publicKey}
            >
              <div className="hidden group-disabled:block ">
                Wallet not connected
              </div>
              <span className="block group-disabled:hidden">
                Air Drop Token
              </span>
            </button>
          </div>
          <div className="flex flex-col justify-center space-x-4 items-center">
            <InputComponent
              type="text"
              value={amount}
              label="Amount"
              onChange={setAmount}
            />
            <button
              className="group w-60 m-2 btn bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
              onClick={async () => {
                await sendToken(amount);
              }}
              //   disabled={!publicKey}
            >
              <div className="hidden group-disabled:block ">
                Wallet not connected
              </div>
              <span className="block group-disabled:hidden">Get Token</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransferToken;
