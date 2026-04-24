import React, { useState } from "react";
import InputComponent from "./Input";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import Button from "./Button";
import { changeAuthority } from "../utils/changeAuthority";

const ChangeAuth = () => {
  const wallet: any = useAnchorWallet();
  const [mintAuth, setMintAuth] = useState("");
  return (
    <div className="space-y-4">
      <InputComponent
        type="text"
        label="Mint Authority"
        value={mintAuth}
        onChange={setMintAuth}
      />
      <Button
        name="Change Authority"
        onClick={async () => {
          await changeAuthority(mintAuth, wallet);
        }}
      />
    </div>
  );
};

export default ChangeAuth;
