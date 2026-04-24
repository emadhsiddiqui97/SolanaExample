import { AnchorWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { AccountMeta } from "@solana/web3.js";
// import {  } from "@coral-xyz/anchor"
import { solConfig } from "config/solana";
import { getMintAddress } from "helpers/mintAddress";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { notify } from "utils/notifications";

// const getAccountMetas = (wallets:PublicKey[]) => {
//     return wallets.map((wallet)=>(
//         return new AccountMeta({
//         wallet,
//         isWritable:true,
//         isSigner: false
//     })
//     ))
// }

export const airdropMultiple = async (
  wallet: AnchorWallet,
  amount: number,
  wallets: PublicKey[]
) => {
  const idlFile: any = solConfig.idl;
  const provider = new anchor.AnchorProvider(solConfig.connection, wallet, {});
  const program = new anchor.Program(idlFile, solConfig.programId, provider);
  const [tokenAddress] = await getMintAddress();
  const senderAtaInstruction = await getOrCreateAssociatedTokenAccount(
    solConfig.connection,
    solConfig.adminWallet,
    tokenAddress,
    solConfig.adminWallet.publicKey,
    true
  );
  let context = {};
  const remainingAccounts: AccountMeta[] = wallets.map((wallet) => ({
    pubkey: wallet,
    isSigner: true,
    isWritable: true,
  }));
  const amountBN = new anchor.BN(JSON.stringify(amount * LAMPORTS_PER_SOL));

  try {
    const tx = await program.methods
      .multipleTransfers(amountBN)
      .accounts(context)
      .remainingAccounts(remainingAccounts)
      .signers([solConfig.adminWallet])
      .rpc();
    notify({
      type: "success",
      message: "Airdrop successful",
      txid: tx,
    });
  } catch (error: any) {
    notify({
      type: "error",
      message: `Airdrop failed!`,
      description: error?.message,
      txid: error.message,
    });
  }
};
