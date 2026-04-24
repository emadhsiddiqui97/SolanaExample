import React, { useState } from "react";
import Button from "./Button";
import { createToken } from "../utils/createToken";
import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import InputComponent from "./Input";

const CreateToken = () => {
  const wallet: any = useAnchorWallet();

  return (
    <div>
      <Button
        name="Create Token"
        onClick={async () => {
          await createToken(wallet);
        }}
      />
    </div>
  );
};

export default CreateToken;
