import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { MINT_SEED, PROGRAM_ID } from "../constants";

export const getMintAddress = async () => {
  return findProgramAddressSync([Buffer.from(MINT_SEED)], PROGRAM_ID);
};
