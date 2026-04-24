import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { connection, idlFile, PROGRAM_ID } from "../constants";
import * as anchor from "@project-serum/anchor";
import { createAta } from "../helpers/createAta";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getMintAddress } from "../helpers/mintAddress";

export const sendToken = async (
  wallet: AnchorWallet,
  deposit: string,
  amount: number
) => {
  const [tokenAddress] = await getMintAddress();
  const depositAddress = new PublicKey(deposit);
  let transactions = new Transaction();
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  const program = new anchor.Program(idlFile, PROGRAM_ID, provider);
  const senderAtaInstruction = await createAta(
    tokenAddress,
    wallet.publicKey,
    wallet.publicKey
  );
  !senderAtaInstruction.init && senderAtaInstruction.instruction !== undefined
    ? transactions.add(senderAtaInstruction.instruction)
    : null;

  const depositAtaInstruction = await createAta(
    tokenAddress,
    depositAddress,
    wallet.publicKey
  );
  !depositAtaInstruction.init && depositAtaInstruction.instruction !== undefined
    ? transactions.add(depositAtaInstruction.instruction)
    : null;
  const context = {
    from: wallet.publicKey,
    fromAta: senderAtaInstruction.address,
    toAta: depositAtaInstruction.address,
    tokenProgram: TOKEN_PROGRAM_ID,
  };
  try {
    let signedTx;
    let confirmedTx;
    const amountBN = new anchor.BN(JSON.stringify(amount * LAMPORTS_PER_SOL));
    const tx = await program.methods
      .transferToken(amountBN)
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
      `Tokens sent: https://explorer.solana.com/tx/${confirmedTx}?cluster='devnet'`
    );
  } catch (error: any) {
    if (error.message && error.message.includes("User rejected the request")) {
      console.log("transaction cancelled");
    } else {
      console.error("Failed to send tokens: ", error.message);
    }
  }
};
