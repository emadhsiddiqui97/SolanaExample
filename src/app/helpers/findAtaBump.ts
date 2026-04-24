import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "../constants";

export const findAtaBump = async () => {
  return await PublicKey.findProgramAddressSync(
    [Buffer.from("transfer")],
    PROGRAM_ID
  );
};
