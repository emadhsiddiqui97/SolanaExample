import React from "react";
import Button from "./Button";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { freezeToken } from "../utils/freezeToken";

const FreezeToken = () => {
  const wallet: any = useAnchorWallet();
  return (
    <Button
      name="Freeze Token"
      onClick={async () => {
        await freezeToken(wallet);
      }}
    />
  );
};

export default FreezeToken;
