import create, { State } from "zustand";
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import { getMintAddress } from "helpers/mintAddress";
import {
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { solConfig } from "config/solana";
// import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
// import { useWallet } from "@solana/wallet-adapter-react";

interface UserTokenBalanceStore extends State {
  tokenBalance: number;
  getUserTokenBalance: (publicKey: PublicKey) => void;
}

async function getTokenBalanceWeb3(tokenAccount, user) {
  console.log("token", tokenAccount.toBase58());
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const depositAtaInstruction = await getOrCreateAssociatedTokenAccount(
    connection,
    solConfig.adminWallet,
    tokenAccount,
    user,
    true
  );
  console.log(depositAtaInstruction.address);
  const info = await connection.getTokenAccountBalance(
    depositAtaInstruction.address
  );
  if (info.value.uiAmount == null) throw new Error("No balance found");
  console.log("Balance (using Solana-Web3.js): ", info.value.uiAmount);
  return info.value.uiAmount;
}

const useUserTokenBalanceStore = create<UserTokenBalanceStore>((set, _get) => ({
  tokenBalance: 0,
  getUserTokenBalance: async (user: PublicKey) => {
    const [tokenAddress] = await getMintAddress();
    let balance: any = 0;
    try {
      balance = await getTokenBalanceWeb3(tokenAddress, user).catch((err) =>
        console.log(err)
      );
    } catch (e) {
      console.log(`error getting balance: `, e);
    }
    set((s) => {
      s.tokenBalance = balance;
      console.log(`token balance updated, `, balance);
    });
  },
}));

export default useUserTokenBalanceStore;
