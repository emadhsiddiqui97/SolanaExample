import { getAssociatedTokenAddress } from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export const getTokenAta = async (
  tokenAddress: PublicKey,
  wallet: AnchorWallet
) => {
  return getAssociatedTokenAddress(tokenAddress, wallet.publicKey);
};
