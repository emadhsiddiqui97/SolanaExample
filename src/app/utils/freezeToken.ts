import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { connection, idlFile, PROGRAM_ID } from "../constants";
import { Transaction } from "@solana/web3.js";
import { getMintAddress } from "../helpers/mintAddress";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const freezeToken = async (wallet: AnchorWallet) => {
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  const program = new anchor.Program(idlFile, PROGRAM_ID, provider);
  const [address] = await getMintAddress();
  const destination = await getAssociatedTokenAddress(
    address,
    wallet.publicKey,
    true
  );
  const context = {
    mintToken: address,
    signer: wallet.publicKey,
    tokenAccount: destination,
    tokenProgram: TOKEN_PROGRAM_ID,
  };
  let transactions = new Transaction();
  try {
    let signedTx;
    let confirmedTx;
    const tx = await program.methods
      .freezeTokens()
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
    console.log(
      `Froze Token: https://explorer.solana.com/tx/${confirmedTx}?cluster=devnet`
    );
  } catch (error: any) {
    if (error.message && error.message.includes("User rejected the request")) {
      console.log("transaction cancelled");
    } else {
      console.error("Failed to freeze token: ", error.message);
    }
  }
};
