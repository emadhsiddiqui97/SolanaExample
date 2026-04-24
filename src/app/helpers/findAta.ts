import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { connection } from "../constants";
// import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

export const findAta = async (tokenAddress: PublicKey, wallet: PublicKey) => {
  const ata = await getAssociatedTokenAddress(tokenAddress, wallet, true);
  // console.log(wallet.toBase58());

  try {
    const accountInfo = await getAccount(connection, ata);
    // console.log(accountInfo.address.toBase58(), " ata exist");
    return { ataExist: true, ata: ata };
  } catch (error) {
    return { ataExist: false, ata: ata };
  }
  //       console.log(accountInfo);
  //       if (!accountInfo) {
  //         } else {
  //   }
};
