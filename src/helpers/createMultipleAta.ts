import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
// import { createAta } from "./createAta";
import { Transaction } from "@solana/web3.js";
import { solConfig } from "config/solana";

interface ataType {
  wallet: PublicKey;
  ata: PublicKey;
  instruction: TransactionInstruction;
}

const findAta = async (
  wallets: PublicKey[],
  tokenAddress: PublicKey,
  payer: AnchorWallet
): Promise<ataType[]> => {
  const ataPromises = wallets.map((wallet) =>
    getAssociatedTokenAddress(tokenAddress, wallet, true)
  );
  const ataAddresses = await Promise.all(ataPromises);
  const accounts = await solConfig.connection.getMultipleAccountsInfo(
    ataAddresses
  );
  return wallets.map((wallet, index) => {
    const ata = ataAddresses[index];
    const account = accounts[index];
    // If account is null, ATA doesn't exist - create instruction
    if (!account) {
      const instruction = createAssociatedTokenAccountInstruction(
        payer.publicKey, // Payer for account creation
        ata, // ATA address
        wallet, // Wallet address (owner)
        tokenAddress // Token mint
      );
      return {
        wallet,
        ata,
        instruction,
      };
    }
    // ATA exists, return null instruction
    return {
      wallet,
      ata,
      instruction: null,
    };
  });
};

// const createAta = async (
//   tokenAddress: PublicKey,
//   wallets: PublicKey[],
//   payer: AnchorWallet
// ) => {
//   const ataAddress = await findAta(wallets, tokenAddress, payer);
//   // if (!ataAddress.ataExist) {
//   //   const ataInstruction = createAssociatedTokenAccountInstruction(
//   //     payer,
//   //     ataAddress.ata,
//   //     wallet,
//   //     tokenAddress
//   //   );
//   //   return {
//   //     instruction: ataInstruction,
//   //     address: ataAddress.ata,
//   //     init: false,
//   //   };
//   // } else {
//   //   return { address: ataAddress.ata, init: true };
//   // }
//   ata
// };

export const createMultipleAta = async (
  wallets: PublicKey[],
  tokenAddress: PublicKey,
  wallet: AnchorWallet,
  transactionArray: any[],
  userPrivateKey: Keypair
) => {
  /*
        recieves an array of wallets. returns an array of AccountMeta
        checks for ata. if it exist adds the address to the accountMeta if not creates an instruction
        and adds it to the transaction array. 
    */

  const walletAtas = await findAta(wallets, tokenAddress, wallet);
  const addresses = await Promise.all(
    walletAtas.map(async (deposit) => {
      let currentTransaction = new Transaction();
      if (deposit.instruction) {
        currentTransaction.add(deposit.instruction);
        let { blockhash } = await solConfig.connection.getLatestBlockhash();
        currentTransaction.recentBlockhash = blockhash;
        currentTransaction.feePayer = userPrivateKey.publicKey;
        // currentTransaction.sign(userPrivateKey);
        transactionArray.push(currentTransaction);
      }
      return {
        pubkey: deposit.ata,
        isWritable: true,
        isSigner: false,
      };
    })
  );

  // const addresses = await Promise.all(
  //   wallets.map(async (deposit, index) => {
  //     let currentTransaction = new Transaction();
  //     const depositAtaInstruction = await createAta(
  //       tokenAddress,
  //       deposit,
  //       wallet.publicKey
  //     );
  //     if (
  //       !depositAtaInstruction.init &&
  //       depositAtaInstruction.instruction !== undefined
  //     ) {
  //       console.log("creating ata...");
  //       currentTransaction.add(depositAtaInstruction.instruction);
  //       let { blockhash } = await solConfig.connection.getLatestBlockhash();
  //       currentTransaction.recentBlockhash = blockhash;
  //       currentTransaction.feePayer = wallet.publicKey;
  //       transactionArray.push(currentTransaction);
  //     }
  //     return {
  //       pubkey: depositAtaInstruction.address,
  //       isWritable: true,
  //       isSigner: false,
  //     };
  //   })
  // );
  return { addresses: addresses, transaction: transactionArray };
};
