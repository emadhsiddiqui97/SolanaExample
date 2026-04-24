import {
  AnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
// import { Wallet } from "@coral-xyz/anchor";
import { solConfig } from "config/solana";
import { getMintAddress } from "helpers/mintAddress";
import { createAta } from "helpers/createAta";
import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { notify } from "utils/notifications";

export const sendToken = async (
  wallet: AnchorWallet,
  connection,
  publicKey
) => {
  console.log(connection, publicKey);
  // const { connection } = useConnection();
  // const { publicKey } = useWallet();
  const idlFile: any = solConfig.idl;
  const [tokenAddress] = await getMintAddress();
  const depositAddress = publicKey;
  const amount = 1;
  // const adminWallet = new anchor.Wallet(solConfig.adminWallet);
  //   const anchorWallet = new anchor.Wallet(publicKey);
  let transactions = new Transaction();
  const provider = new anchor.AnchorProvider(connection, publicKey, {});
  const program = new anchor.Program(idlFile, solConfig.programId, provider);
  // const senderAtaInstruction = await createAta(
  //   tokenAddress,
  //   adminWallet.publicKey,
  //   adminWallet.publicKey
  // );
  // !senderAtaInstruction.init && senderAtaInstruction.instruction !== undefined
  //   ? transactions.add(senderAtaInstruction.instruction)
  //   : null;
  // const depositAtaInstruction = await createAta(
  //   tokenAddress,
  //   depositAddress,
  //   adminWallet.publicKey
  // );
  // !depositAtaInstruction.init && depositAtaInstruction.instruction !== undefined
  //   ? transactions.add(depositAtaInstruction.instruction)
  //   : null;
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
    let signedTx;
    let confirmedTx;
    const amountBN = new anchor.BN(JSON.stringify(amount * LAMPORTS_PER_SOL));
    const tx = await program.methods
      .transferToken(amountBN)
      .accounts(context)
      .signers([solConfig.adminWallet])
      .rpc();
    notify({
      type: "success",
      message: "Token Deposited!",
      txid: confirmedTx,
    });
  } catch (error: any) {
    if (error.message && error.message.includes("User rejected the request")) {
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
};
