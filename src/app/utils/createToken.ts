import { AnchorWallet } from "@solana/wallet-adapter-react";
import { getMintAddress } from "../helpers/mintAddress";
import { getMetaAddress } from "../helpers/getMetaAddress";
import {
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import {
  connection,
  idlFile,
  PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
} from "../constants";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createInitializeTransferFeeConfigInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export const createToken = async (wallet: AnchorWallet) => {
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  const program = new anchor.Program(idlFile, PROGRAM_ID, provider);
  const metadata = {
    name: "First Token",
    symbol: "MRE",
    uri: "https://tomato-capitalist-grasshopper-546.mypinata.cloud/ipfs/Qme56uR7dmggvcSieTNdaXiR1jSgWGdLoh4vpChhTY7fXJ",
    seller_fee_basis_points: 200,
    decimals: 9,
  };
  const [mint] = await getMintAddress();
  // const mintKeypair = Keypair.generate();
  // const mint = mintKeypair.publicKey;
  // const mintWallet = new anchor.Wallet(mintKeypair);
  // console.log(mint.toBase58());
  const [metadataAddress] = await getMetaAddress(mint);
  if (await connection.getAccountInfo(mint)) {
    console.log("token already exists");
  }
  // const mintAta = await getAssociatedTokenAddress(mint, wallet.publicKey);
  const context = {
    metadata: metadataAddress,
    mint: mint,
    payer: wallet.publicKey.toBase58(),
    rent: SYSVAR_RENT_PUBKEY,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    freezeAuthority: wallet.publicKey,
    mintAuthority: wallet.publicKey,
  };
  // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  // associatedTokenAccount: mintAta,
  console.log(context.mintAuthority.toBase58());
  let transactions = new Transaction();
  try {
    let signedTx;
    let confirmedTx;
    const tx = await program.methods
      .initTokens(metadata)
      .accounts(context)
      .instruction();
    transactions.add(tx);
    // .signers([mintKeypair])
    // .rpc();
    // const mintTx = new Transaction();
    // mintTx.add(tx);
    // const signedMint = await mintWallet.signTransaction(mintTx);

    // const feeIx = await createInitializeTransferFeeConfigInstruction(
    //   mint,
    //   wallet.publicKey, //transferFeeConfigAuthority
    //   wallet.publicKey, //withdrawWithheldAuthority
    //   200,
    //   BigInt(500),
    //   TOKEN_2022_PROGRAM_ID
    // );
    // transactions.add(feeIx);
    const { blockhash } = await connection.getLatestBlockhash();
    transactions.recentBlockhash = blockhash;
    transactions.feePayer = wallet.publicKey;
    try {
      signedTx = await wallet.signTransaction(transactions);
      console.log(`${transactions.instructions.length} transactions signed`);
    } catch (error: any) {
      console.log("could not sign tx: ", error.message);
    }
    signedTx
      ? (confirmedTx = await connection.sendRawTransaction(
          signedTx.serialize()
        ))
      : null;
    console.log(
      `Token created: https://explorer.solana.com/tx/${confirmedTx}?cluster='devnet'`
    );
  } catch (error: any) {
    if (error.message && error.message.includes("User rejected the request")) {
      console.log("transaction cancelled");
    } else {
      console.error("Failed to create token: ", error.message);
    }
  }
};
