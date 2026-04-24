import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { buffer } from "stream/consumers";
import {
  METADATA_SEED,
  PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
} from "../constants";
import { PublicKey } from "@solana/web3.js";

export const getMetaAddress = async (mint: PublicKey) => {
  return findProgramAddressSync(
    [
      Buffer.from(METADATA_SEED),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
};
