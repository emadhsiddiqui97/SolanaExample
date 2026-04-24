import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { connection, idlFile, PROGRAM_ID } from "../constants";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createUiAmountToAmountInstruction,
  getAssociatedTokenAddress,
  isUiamountToAmountInstruction,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  uiAmountToAmount,
} from "@solana/spl-token";
import { getMintAddress } from "../helpers/mintAddress";
import * as anchor from "@project-serum/anchor";
// import { bytes } from "@coral-xyz/anchor/dist/cjs/utils";

export const mintToken = async (wallet: AnchorWallet, amount: number) => {
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  const program = new anchor.Program(idlFile, PROGRAM_ID, provider);
  const [address] = await getMintAddress();
  const destination = await getAssociatedTokenAddress(
    address,
    wallet.publicKey,
    true
  );
  // console.log(amount);
  amount = amount * LAMPORTS_PER_SOL;
  // console.log(JSON.stringify(amount));
  const context = {
    mint: address,
    destination: destination,
    payer: wallet.publicKey,
    rent: SYSVAR_RENT_PUBKEY,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  };
  let transactions = new Transaction();
  try {
    let signedTx;
    let confirmedTx;
    let amountBN;
    // uiAmountToAmount(connection, wallet.publicKey, address, amount)
    // createUiAmountToAmountInstruction(address, JSON.stringify(amount)  )
    try {
      amountBN = new anchor.BN(JSON.stringify(amount), 10);
      console.log(amountBN);
    } catch (error: any) {
      console.log(error.message);
      return;
    }
    const tx = await program.methods
      .mintTokens(amountBN)
      .accounts(context)
      .instruction();
    transactions.add(tx);

    const { blockhash } = await connection.getLatestBlockhash();
    transactions.recentBlockhash = blockhash;
    transactions.feePayer = wallet.publicKey;
    try {
      signedTx = await wallet.signTransaction(transactions);
      console.log(`${transactions.instructions.length} transactions signed`);
    } catch (error: any) {
      console.log("could not sign tx: ", error.message);
    }
    signedTx
      ? (confirmedTx = await connection.sendRawTransaction(
          signedTx.serialize()
        ))
      : null;
    console.log(signedTx);
    console.log(
      `Minted tokens: https://explorer.solana.com/tx/${confirmedTx}?cluster=devnet`
    );
  } catch (error: any) {
    if (error.message && error.message.includes("User rejected the request")) {
      console.log("transaction cancelled");
    } else {
      console.error("Failed to mint tokens: ", error.message);
    }
  }
};
