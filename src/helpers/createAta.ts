import {
  createAssociatedTokenAccountInstruction,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { findAta } from "./findAta";

interface ataType {
  ataExist: boolean;
  ata: PublicKey;
}

export const createAta = async (
  tokenAddress: PublicKey,
  wallet: PublicKey,
  payer: PublicKey
) => {
  const ataAddress: ataType = await findAta(tokenAddress, wallet);
  if (!ataAddress.ataExist) {
    const ataInstruction = createAssociatedTokenAccountInstruction(
      payer,
      ataAddress.ata,
      wallet,
      tokenAddress
    );
    return {
      instruction: ataInstruction,
      address: ataAddress.ata,
      init: false,
    };
  } else {
    return { address: ataAddress.ata, init: true };
  }
};
