import { AnchorWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { connection, PROGRAM_ID } from "../constants";
import { idlFile } from "../constants";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getMintAddress } from "../helpers/mintAddress";
import { getTokenAta } from "../helpers/tokenAta";

export const burnToken = async (wallet: AnchorWallet, amount: number) => {
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  const program = new anchor.Program(idlFile, PROGRAM_ID, provider);
  amount = amount * LAMPORTS_PER_SOL;
  const [tokenAddress] = await getMintAddress();
  const tokenAta = await getTokenAta(tokenAddress, wallet);
  let signedTx;
  let confirmedTx;
  const context = {
    mint: tokenAddress,
    tokenProgram: TOKEN_PROGRAM_ID,
    from: tokenAta,
    authority: wallet.publicKey,
  };
  // console.log(
  //   "mint: ",
  //   context.mint.toBase58(),
  //   "\ntoken Address: ",
  //   tokenAta.toBase58(),
  //   "\ntoken prog: ",
  //   context.tokenProgram.toBase58(),
  //   "\nfrom: ",
  //   context.from.toBase58(),
  //   "\nauth: ",
  //   context.authority.toBase58()
  // );
  const amountBN = new anchor.BN(JSON.stringify(amount), 10);
  try {
    const txInstruction = await program.methods
      .burnTokens(amountBN)
      .accounts(context)
      .transaction();
    const { blockhash } = await connection.getLatestBlockhash();
    txInstruction.recentBlockhash = blockhash;
    txInstruction.feePayer = wallet.publicKey;
    try {
      signedTx = await wallet.signTransaction(txInstruction);
      console.log(`${txInstruction.instructions.length} transactions signed`);
    } catch (error: any) {
      console.log("could not sign tx: ", error.message);
    }
    signedTx
      ? (confirmedTx = await connection.sendRawTransaction(
          signedTx.serialize()
        ))
      : null;
    console.log(
      `Tokens burned: https://explorer.solana.com/tx/${confirmedTx}?cluster=devnet`
    );
  } catch (error: any) {
    if (error.message && error.message.includes("User rejected the request")) {
      console.log("transaction cancelled");
    } else {
      console.error("Failed to burn tokens: ", error.message);
    }
  }
};
