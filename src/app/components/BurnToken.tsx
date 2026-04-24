import React, { useState } from "react";
import InputComponent from "./Input";
import Button from "./Button";
import { burnToken } from "../utils/burnToken";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

const BurnToken = () => {
  const wallet: any = useAnchorWallet();
  const [amount, setAmount] = useState("");
  const [burn, setBurn] = useState("");
  return (
    <div className="space-y-4">
      {/* <InputComponent
        type="text"
        label="Token Address"
        value={burn}
        onChange={setBurn}
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
          await burnToken(wallet, parseInt(amount));
        }}
      />
    </div>
  );
};

export default BurnToken;
