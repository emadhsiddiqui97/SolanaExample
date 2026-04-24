import {
  AuthorityType,
  createSetAuthorityInstruction,
} from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getMintAddress } from "../helpers/mintAddress";
import { connection } from "../constants";

export const changeAuthority = async (
  mintAuthority: string,
  wallet: AnchorWallet
) => {
  const mintAuthorityPubKey = new PublicKey(mintAuthority);
  let transactions = new Transaction();
  try {
    let signedTx;
    let confirmedTx;
    const [mint] = await getMintAddress();
    transactions.add(
      createSetAuthorityInstruction(
        mint, // mint acocunt || token account
        wallet.publicKey, // current auth
        AuthorityType.MintTokens, // authority type
        mintAuthorityPubKey // new auth (you can pass `null` to close it)
      )
    );
    transactions.add(
      createSetAuthorityInstruction(
        mint, // mint acocunt || token account
        wallet.publicKey, // current auth
        AuthorityType.FreezeAccount, // authority type
        mintAuthorityPubKey // new auth (you can pass `null` to close it)
      )
    );
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
      `Authority changed: https://explorer.solana.com/tx/${confirmedTx}?cluster=devnet`
    );
  } catch (error: any) {
    if (error.message && error.message.includes("User rejected the request")) {
      console.log("transaction cancelled");
    } else {
      console.error("Failed to change authority: ", error.message);
    }
  }
};
