import React, { useEffect, useState } from "react";
import Button from "./Button";
import InputComponent from "./Input";
import { sendToken } from "../utils/sendToken";
import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import useIsMounted from "../hooks/useIsMounted";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { burnToken } from "../utils/burnToken";

const SendToken = () => {
  const [sendTo, setSendTo] = useState("");
  const [amount, setAmount] = useState("");
  const wallet: any = useAnchorWallet();
  // const mounted = useIsMounted();

  // useEffect(() => {
  //   console.log(wallet.publickey);
  // }, []);
  return (
    <div className="space-y-4">
      <InputComponent
        type="text"
        label="Send to"
        value={sendTo}
        onChange={setSendTo}
      />
      <InputComponent
        type="number"
        label="Amount"
        value={amount}
        onChange={setAmount}
      />
      <Button
        name="Send"
        onClick={async () => {
          // console.log("wallet", wallet);
          await sendToken(wallet, sendTo, parseInt(amount));
          // await burnToken(wallet, parseInt(amount));
        }}
      />
      {/* {mounted && <WalletMultiButton />} */}
    </div>
  );
};

export default SendToken;
