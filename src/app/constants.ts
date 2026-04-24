import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import idl from "../../idl.json";
// import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
export const endPoint =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");
export const commitmentLevel = "confirmed";
export const connection = new Connection(
  clusterApiUrl("devnet"),
  commitmentLevel
);
export const idlFile: any = idl;
export const PROGRAM_ID = new PublicKey(
  "3eSAFZui5xaMiLB117W5gBsyt9zAtFN5mXDx4y8ZXUW7"
);
// "2i6jFNaNktS6NJtfn5MHSfbiAAJkTE5qnCjrnW9XwPaY"
export const tokenAddress = new PublicKey(
  "4vG8bJGSbtmkDtLaq2pLzUtAxfh2URfPJJdx7ZehTQLa"
);
export const MINT_SEED = "mint";
export const METADATA_SEED = "metadata";
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// "metaeNDRh2zMt8MUfNxt8qTMbKf5qaVMTxiWGh8amrZ"

export const TOKEN22_ATP = new PublicKey(
  "ATAtokenXnzmmMATT5wvMDUMkR5VYtt4zMKXNDqgn2hA"
);
