import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { solConfig } from "config/solana";
import * as anchor from "@project-serum/anchor";
import { getMintAddress } from "helpers/mintAddress";
import { Transaction } from "@solana/web3.js";
import { createAta } from "helpers/createAta";
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import { AccountMeta } from "@solana/web3.js";
import { ComputeBudgetProgram } from "@solana/web3.js";
import { createMultipleAta } from "helpers/createMultipleAta";
import { Keypair } from "@solana/web3.js";
import { getExplorerUrl } from "utils/explorer";

// const remainingAccounts = (wallets): AccountMeta[] => {
//   // console.log(wallets);
//   return wallets.map((wallet, index) => {
//     // console.log("wallet ", index);
//     return {
//       pubkey: wallet,
//       isWritable: true,
//       isSigner: false,
//     };
//   });
// };

const airdropInstructions = async (
  wallets: PublicKey[],
  tokenAddress,
  wallet,
  transactions,
  senderAtaInstruction,
  program,
  amount,
  transactionArray: any[]
  //   walletAtas
) => {
  //   let transactionArray = [];
  let currentTransaction = new Transaction();
  let currentSize = 0;
  const addresses = await Promise.all(
    wallets.map(async (deposit, index) => {
      // console.log(deposit.toBase58());
      //   let ataAddress: Account;
      //   const test = await setTimeout(async () => {
      //     ataAddress = await getOrCreateAssociatedTokenAccount(
      //       solConfig.connection,
      //       solConfig.adminWallet,
      //       tokenAddress,
      //       deposit
      //     );
      //     return {
      //       pubkey: ataAddress.address,
      //       isWritable: true,
      //       isSigner: false,
      //     };
      //   }, 10000);
      //   return test;
      //   ataAddress = await getOrCreateAssociatedTokenAccount(
      //   //       solConfig.connection,
      //   //       solConfig.adminWallet,
      //   //       tokenAddress,
      //   //       deposit
      //   //     );
      const depositAtaInstruction = await createAta(
        tokenAddress,
        deposit,
        wallet.publicKey
      );
      if (
        !depositAtaInstruction.init &&
        depositAtaInstruction.instruction !== undefined
      ) {
        transactions.add(depositAtaInstruction.instruction);
        console.log(
          "instruction size: ",
          depositAtaInstruction.instruction.data.byteLength
        );
        // console.log(
        //   index,
        //   depositAtaInstruction.instruction.data.byteLength);
        // currentTransaction.add(depositAtaInstruction.instruction);
        // let { blockhash } = await solConfig.connection.getLatestBlockhash();
        // currentTransaction.recentBlockhash = blockhash;
        // currentTransaction.feePayer = wallet.publicKey;
        // currentTransaction.sign(solConfig.adminWallet);
        // const instructionSize =
        //   depositAtaInstruction.instruction.data.byteLength;
        // console.log(instructionSize, " --> ", index);
        // if (currentSize + instructionSize > solConfig.MAX_TRANSACTION_SIZE) {
        // Add the current transaction to the transactions array and start a new one
        //   transactionArray.push(currentTransaction);
        //   currentTransaction = new Transaction();
        //   currentSize = 0;
        // }
        // currentTransaction.add(depositAtaInstruction.instruction);

        // currentSize += instructionSize;
        console.log("ata created");
        // if(index == wallets.length){
        //     transactionArray.push(currentTransaction);
        // }
        return {
          pubkey: depositAtaInstruction.address,
          isWritable: true,
          isSigner: false,
        };
      } else {
        console.log("the ata is already initialized");
        return {
          pubkey: depositAtaInstruction.address,
          isWritable: true,
          isSigner: false,
        };
      }
      //   if(index == wallets.length)
    })
  );

  return addresses;
};
/*
    This fucntion get a list of wallets and checks if their ATA exist. If the ata doesnt exist it creates
    it and adds it to the transaction. the method builder calls the contract instruction that receives a
    list of atas through the remaining accounts property.
*/
export const airdropWithAta = async (
  wallet: AnchorWallet,
  amount: number,
  wallets: PublicKey[],
  userPrivateKey: Keypair
): Promise<boolean> => {
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

  //   let walletAtas: any = [];
  let transactionArray = [];
  //   const walletMetas = await airdropInstructions(
  //     wallets,
  //     tokenAddress,
  //     wallet,
  //     transactions,
  //     senderAtaInstruction,
  //     program,
  //     amount,
  //     transactionArray
  //     // walletAtas
  //   );
  const walletMetas = await createMultipleAta(
    wallets,
    tokenAddress,
    wallet,
    transactionArray,
    userPrivateKey
  );
  //   console.log(transactionArray);
  transactionArray = walletMetas.transaction;
  //   console.log(transactionArray);
  //create context for transfer intruction
  const context = {
    tokenAccount: senderAtaInstruction.address,
    payer: wallet.publicKey,
    mint: tokenAddress,
    tokenProgram: TOKEN_PROGRAM_ID,
    atokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  };
  const amountBN = new anchor.BN(JSON.stringify(amount * LAMPORTS_PER_SOL));
  //method builder for instruction
  const tx = await program.methods
    .transferWithoutAta(amountBN)
    .accounts(context)
    .remainingAccounts(walletMetas.addresses)
    .instruction();
  const progTx = new Transaction();
  progTx.add(tx);
  let { blockhash } = await solConfig.connection.getLatestBlockhash();
  transactions.recentBlockhash = blockhash;
  transactions.feePayer = wallet.publicKey;
  //   let progTxarray: Transaction[] = [];
  progTx.recentBlockhash = blockhash;
  progTx.feePayer = wallet.publicKey;
  let signedTx;
  let signedProgTx;
  let confirmedTx;
  const computeLimitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1400000, // Set to max units (1.4 million compute units)
  });
  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1,
  });
  progTx.add(computeLimitInstruction);
  progTx.add(addPriorityFee);
  //condition to check if any ata needs to be created
  //   if (transactions.instructions.length != 0) {
  if (transactionArray.length != 0) {
    console.log("signAll");
    //send ata transaction then send the transfer transaction after 10s
    transactions.add(computeLimitInstruction);
    transactions.add(addPriorityFee);
    transactionArray.push(transactions);
    transactionArray.push(progTx);
    try {
      //   signedTx = await wallet.signTransaction(transactions);
      // signedTx = await wallet.signAllTransactions(transactionArray);
      // for(const transaction in transactionArray){
      //   transaction
      // }
      // signedTx = sendAndConfirmTransaction(solConfig.connection, transactionArray, solConfig.adminWallet)
      console.log(`${transactionArray.length} transactions signed`);
    } catch (error: any) {
      console.log(`${transactionArray.length} transactions signed`);
      console.log("could not sign tx: ", error.message);
    }
    try {
      let index = 0;
      for (const tx of transactionArray) {
        // tx.sign(userPrivateKey);
        // if (index == signedTx.length - 2) {
        //   await new Promise((resolve) => setTimeout(resolve, 10000));
        // }
        // const signature = await solConfig.connection.sendRawTransaction(
        //   tx.serialize()
        // );
        // console.info(userPrivateKey.publicKey.toBase58());
        try {
          const signature = await sendAndConfirmTransaction(
            solConfig.connection,
            tx,
            [userPrivateKey]
          );
          // console.log(signature);
          console.log(
            `Tokens sent: https://explorer.solana.com/tx/${signature}?cluster=devnet`
          );
        } catch (error) {
          console.log(error.message);
        }
        index++;
        console.log(index, " transaction sent");
        // console.info(
        //   `tx ${index} sent: ${getExplorerUrl(
        //     solConfig.connection.rpcEndpoint,
        //     signature,
        //     tx
        //   )}`
        // );
        // await solConfig.connection.confirmTransaction(signature);
      }
      // const rawTransactions = signedTx.map((tx) => tx.serialize());
      // rawTransactions
      //   ? (confirmedTx = await solConfig.connection.sendRawTransaction(
      //       // signedTx.serialize()
      //       rawTransactions
      //     ))
      //   : console.log("couldnot sign");
      console.log(
        `Created Atas: https://explorer.solana.com/tx/${confirmedTx}?cluster=devnet`
      );
    } catch (error: any) {
      if (
        error.message &&
        error.message.includes("User rejected the request")
      ) {
        console.log("transaction cancelled");
        return true;
      } else {
        console.error("Failed to send tokens: ", error.message);
        return true;
      }
    }
    // await setTimeout(async () => {
    //   try {
    //     // signedProgTx = await wallet.signTransaction(progTx);
    //     console.log(`${progTx.instructions.length} transactions signed`);
    //   } catch (error) {
    //     console.log("could not sign tx: ", error.message);
    //   }
    //   try {
    //     // console.log("wallet transfer ix: ", signedProgTx.serialize.length);
    //     signedProgTx
    //       ? (confirmedTx = await solConfig.connection.sendRawTransaction(
    //           signedProgTx.serialize()
    //         ))
    //       : null;
    //     console.log(
    //       `Tokens sent: https://explorer.solana.com/tx/${confirmedTx}?cluster=devnet`
    //     );
    //   } catch (error) {
    //     console.error("Failed to send tokens: ", error.message);
    //     return true;
    //   }
    // }, 10000);
  } else {
    //atas are already created, send the transfer transaction
    progTx.add(computeLimitInstruction);
    progTx.add(addPriorityFee);
    try {
      signedProgTx = await wallet.signTransaction(progTx);
      console.log(`${progTx.instructions.length} transactions signed`);
    } catch (error) {
      console.log("could not sign tx: ", error.message);
    }
    try {
      signedProgTx
        ? (confirmedTx = await solConfig.connection.sendRawTransaction(
            signedProgTx.serialize()
          ))
        : null;
      console.log(
        `Tokens sent: https://explorer.solana.com/tx/${confirmedTx}?cluster=devnet`
      );
    } catch (error) {
      console.error("Failed to send tokens: ", error.message);
      return true;
    }
  }
};
