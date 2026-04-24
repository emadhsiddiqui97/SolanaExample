import React from "react";
import Button from "./Button";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { freezeToken } from "../utils/freezeToken";
import { unFreezeToken } from "../utils/unFreezeToken";

const UnFreezeToken = () => {
  const wallet: any = useAnchorWallet();
  return (
    <Button
      name="Unfreeze Token"
      onClick={async () => {
        await unFreezeToken(wallet);
      }}
    />
  );
};

export default UnFreezeToken;
