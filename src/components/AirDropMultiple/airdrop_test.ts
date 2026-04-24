import { AnchorWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { solConfig } from "config/solana";
import * as anchor from "@project-serum/anchor";
import { getMintAddress } from "helpers/mintAddress";
import { Transaction } from "@solana/web3.js";
import { createAta } from "helpers/createAta";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import { AccountMeta } from "@solana/web3.js";

const remainingAccounts = (wallets): AccountMeta[] => {
  // console.log(wallets);
  return wallets.map((wallet, index) => {
    // console.log("wallet ", index);
    return {
      pubkey: wallet,
      isWritable: true,
      isSigner: false,
    };
  });
};

const airdropInstructions = async (
  wallets: PublicKey[],
  tokenAddress,
  wallet,
  transactions,
  senderAtaInstruction,
  program,
  amount,
  walletAtas
) => {
  console.log("hello");
  const addresses = await Promise.all(
    wallets.map(async (deposit) => {
      // console.log(deposit.toBase58());
      const depositAtaInstruction = await createAta(
        tokenAddress,
        deposit,
        wallet.publicKey
      );
      // console.log(depositAtaInstruction.address.toBase58());
      if (
        !depositAtaInstruction.init &&
        depositAtaInstruction.instruction !== undefined
      ) {
        transactions.add(depositAtaInstruction.instruction);
        // console.log("ata address: ", depositAtaInstruction.address);
        // walletAtas.push(depositAtaInstruction.address);
        // return depositAtaInstruction.address;
        console.log("ata created");
        return {
          pubkey: depositAtaInstruction.address,
          isWritable: true,
          isSigner: false,
        };
        // console.log(walletAtas);
      } else {
        console.log("the ata is already initialized");
        // return depositAtaInstruction.address;
        return {
          pubkey: depositAtaInstruction.address,
          isWritable: true,
          isSigner: false,
        };
      }

      // !depositAtaInstruction.init &&
      // depositAtaInstruction.instruction !== undefined
      //   ? transactions.add(depositAtaInstruction.instruction)
      //   : null;
      //   transactions.add(depositAtaInstruction.instruction)
    })
  );

  return addresses;
};
// const getWallets = async (wallets: PublicKey[], walletAccounts) => {
//   wallets.map((wallet, index) => {
//     walletAccounts.push({
//       pubkey: wallet,
//       isWritable: true,
//       isSigner: false,
//     });
//   });
// };
export const airdropTest = async (
  wallet: AnchorWallet,
  amount: number,
  wallets: PublicKey[]
) => {
  const idlFile: any = solConfig.idl;
  const provider = new anchor.AnchorProvider(solConfig.connection, wallet, {});
  const program = new anchor.Program(idlFile, solConfig.programId, provider);
  const [tokenAddress] = await getMintAddress();
  let transactions = new Transaction();
  //   let transactionArray = new Transaction
  let signedTxNumber = 0;
  const senderAtaInstruction = await createAta(
    tokenAddress,
    wallet.publicKey,
    wallet.publicKey
  );
  !senderAtaInstruction.init && senderAtaInstruction.instruction !== undefined
    ? transactions.add(senderAtaInstruction.instruction)
    : null;
  let walletAtas: any = [];
  //   const amountBN = new anchor.BN(JSON.stringify(amount * LAMPORTS_PER_SOL));
  // const walletMetas = await airdropInstructions(
  //   wallets,
  //   tokenAddress,
  //   wallet,
  //   transactions,
  //   senderAtaInstruction,
  //   program,
  //   amount,
  //   walletAtas
  // );
  // walletMetas.map((wallet) => {
  //   console.log(wallet.pubkey.toBase58());
  // });
  console.log(walletAtas);
  // const accounts = remainingAccounts(walletAtas);
  // console.log(accounts);
  // let walletAccounts: any;
  // walletAccounts = await getWallets(walletAtas, walletAccounts);
  // console.log(walletAccounts);
  const context = {
    tokenAccount: senderAtaInstruction.address,
    payer: wallet.publicKey,
    mint: tokenAddress,
    tokenProgram: TOKEN_PROGRAM_ID,
    atokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  };
  console.log(JSON.parse(JSON.stringify(context)));
  // console;
  const amountBN = new anchor.BN(JSON.stringify(amount * LAMPORTS_PER_SOL));
  // console.info(
  //   "ATAs to pass:"
  //   walletAtas.map((ata) => console.log(ata))
  //   walletAtas[1]
  // );

  // Create remaining accounts array and log it
  // const remainingAccounts = walletAtas.map((ata) => ({
  //   pubkey: ata,
  //   isWritable: true,
  //   isSigner: false,
  // }));

  // console.log("Remaining accounts:", remainingAccounts);
  const tx = await program.methods
    .airdropMultiple(amountBN)
    .accounts(context)
    .remainingAccounts(remainingAccounts(wallets))
    .instruction();
  // console.log(tx);
  const progTx = new Transaction();
  progTx.add(tx);
  // transactions.add(tx);
  const { blockhash } = await solConfig.connection.getLatestBlockhash();
  transactions.recentBlockhash = blockhash;
  transactions.feePayer = wallet.publicKey;
  // const { blockhash } = await solConfig.connection.getLatestBlockhash();
  progTx.recentBlockhash = blockhash;
  progTx.feePayer = wallet.publicKey;
  // console.log(transactions);
  let signedTx;
  let signedProgTx;
  let confirmedTx;
  try {
    signedTx = await wallet.signTransaction(transactions);
    signedProgTx = await wallet.signTransaction(progTx);
    console.log(`${transactions.instructions.length} transactions signed`);
  } catch (error: any) {
    console.log("could not sign tx: ", error.message);
  }
  try {
    signedTx
      ? (confirmedTx = await solConfig.connection.sendRawTransaction(
          signedTx.serialize()
        ))
      : null;
    console.log(
      `Created Atas: https://explorer.solana.com/tx/${confirmedTx}?cluster=devnet`
    );
    signedProgTx
      ? (confirmedTx = await solConfig.connection.sendRawTransaction(
          signedProgTx.serialize()
        ))
      : null;
    console.log(
      `Tokens sent: https://explorer.solana.com/tx/${confirmedTx}?cluster=devnet`
    );
  } catch (error: any) {
    if (error.message && error.message.includes("User rejected the request")) {
      console.log("transaction cancelled");
    } else {
      console.error("Failed to send tokens: ", error.message);
    }
  }
};
