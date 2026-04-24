import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { solConfig } from "config/solana";

export const getMintAddress = async () => {
  return findProgramAddressSync(
    [Buffer.from(solConfig.mintSeed)],
    solConfig.programId
  );
};
