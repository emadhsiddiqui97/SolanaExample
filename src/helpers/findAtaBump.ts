import { PublicKey } from "@solana/web3.js";
import { solConfig } from "config/solana";

export const findAtaBump = async () => {
  return await PublicKey.findProgramAddressSync(
    [Buffer.from("transfer")],
    solConfig.programId
  );
};
