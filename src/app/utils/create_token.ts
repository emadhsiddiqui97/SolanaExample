import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  connection,
  idlFile,
  METADATA_SEED,
  MINT_SEED,
  PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
} from "../constants";
import * as anchor from "@project-serum/anchor";
import { sendAndConfirmTransaction } from "@solana/web3.js";

export const createToken = async (wallet: AnchorWallet) => {
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  const program = new anchor.Program(idlFile, PROGRAM_ID, provider);
  const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(MINT_SEED)],
    PROGRAM_ID
  );
  const [metadataAddress] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(METADATA_SEED),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const uriString = {
    name: "Token DEF",
    symbol: "CONTRACT TEST",
    description: "Solana test contract",
    image:
      "https://res.cloudinary.com/demo/image/upload/ar_1.0,c_thumb,g_face,w_0.6,z_0.7/r_max/co_black,e_outline/co_dimgrey,e_shadow,x_30,y_40/actor.png",
  };
  const metadata = {
    name: "007",
    symbol: "TEST",
    uri: JSON.stringify(uriString),
    decimals: 9,
  };
  const context = {
    metadata: metadataAddress,
    mint,
    payer: wallet.publicKey,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
  };
  try {
    const tx = await program.methods
      .initTokens(metadata)
      .accounts(context)
      .transaction();

    const signedTx = await wallet.signTransaction(tx);
    const confirmedTransaction = connection.sendRawTransaction(
      signedTx.serialize()
    );
    console.log(
      `Created Token successfully: https://explorer.solana.com/tx/${confirmedTransaction}?cluster=devnet`
    );
  } catch (error: any) {
    console.log("Could not create token: ", error.message);
  }
  console.log("create token ");
};
