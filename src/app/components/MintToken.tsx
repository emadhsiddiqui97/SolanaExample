import React, { useState } from "react";
import InputComponent from "./Input";
import Button from "./Button";
import { mintToken } from "../utils/mintToken";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

const MintToken = () => {
  const wallet: any = useAnchorWallet();
  const [amount, setAmount] = useState("");
  const [mint, setMint] = useState("");
  return (
    <div className="space-y-4">
      {/* <InputComponent
        type="text"
        label="Mint to"
        value={mint}
        onChange={setMint}
      /> */}
      <InputComponent
        type="number"
        label="Amount"
        value={amount}
        onChange={setAmount}
      />
      <Button
        name="Send"
        onClick={async () => {
          await mintToken(wallet, parseInt(amount));
        }}
      />
    </div>
  );
};

export default MintToken;
