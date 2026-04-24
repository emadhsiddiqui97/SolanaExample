import { Connection } from "@solana/web3.js";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import idl from "../../idl.json";
import { Keypair } from "@solana/web3.js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import * as dotenv from "dotenv";
dotenv.config();
// const privateKey = bs58.decode(process.env.ADMIN_PRIVATEKEY);

const adminSecretArray = [
  150, 183, 82, 29, 204, 43, 255, 42, 136, 139, 32, 229, 15, 159, 189, 170, 94,
  196, 234, 81, 228, 79, 124, 40, 62, 93, 165, 81, 133, 12, 124, 17, 213, 255,
  9, 215, 73, 53, 67, 156, 12, 134, 148, 168, 35, 236, 133, 132, 255, 213, 170,
  186, 102, 125, 249, 48, 252, 196, 18, 68, 170, 124, 151, 41,
];
// const adminSecretArray = bs58.decode(process.env.NEXT_PUBLIC_ADMIN_SECRET);
console.log(process.env.NEXT_PUBLIC_PROGRAM_ID);
export const solConfig = {
  commitmentLevel: process.env.NEXT_PUBLIC_COMMITMENT_LEVEL,
  // clusterApiUrl("devnet")

  connection: new Connection(
    "https://greatest-delicate-mansion.solana-devnet.quiknode.pro/15a6f5a4ccfe390e7c04917f914b99b3fa6755b7",
    "confirmed"
  ),
  programId: new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID),
  tokenAddress: new PublicKey(process.env.NEXT_PUBLIC_TOKEN_ADDRESS),
  mintSeed: process.env.NEXT_PUBLIC_MINT_SEED,
  idl: idl,
  adminWallet: Keypair.fromSecretKey(Uint8Array.from(adminSecretArray)),
  MAX_TRANSACTION_SIZE: 1232,
};
