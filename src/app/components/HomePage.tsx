import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import React, { useState } from "react";
import useIsMounted from "../hooks/useIsMounted";
import SendToken from "./SendToken";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import CreateToken from "./CreateToken";
import MintToken from "./MintToken";
import BurnToken from "./BurnToken";
import FreezeToken from "./FreezeToken";
import UnFreezeToken from "./UnFreezeToken";
import ChangeAuth from "./ChangeAuth";

const HomePage = () => {
  //   const wallet = useAnchorWallet();
  const list = [
    {
      name: "Create",
      component: <CreateToken />,
    },
    {
      name: "Mint",
      component: <MintToken />,
    },
    {
      name: "Change Authority",
      component: <ChangeAuth />,
    },
    {
      name: "Transfer",
      component: <SendToken />,
    },
    {
      name: "Burn",
      component: <BurnToken />,
    },
    {
      name: "Freeze",
      component: <FreezeToken />,
    },
    {
      name: "Unfreeze",
      component: <UnFreezeToken />,
    },
  ];
  const mounted = useIsMounted();
  // const wallet: any | AnchorWallet = useAnchorWallet();
  const [activeTab, setActiveTab] = useState("Create");
  return (
    <>
      <div className="flex flex-col items-center bg-slate-900 min-h-screen">
        {/* <Navbar /> */}
        <div className="flex justify-around w-full">
          {list.map((item, key) => {
            return (
              <button
                key={key}
                className={`m-2 px-4 py-2 hover:bg-blue-500 hover:rounded-lg transition-all ease-in-out ${
                  activeTab === item.name
                    ? "bg-blue-600 text-white rounded-lg"
                    : ""
                }`}
                onClick={() => {
                  setActiveTab(item.name);
                }}
              >
                {item.name}
              </button>
            );
          })}
        </div>
        <div className="flex max-w-md justify-center space-y-4 items-center m-4 rounded-xl drop-shadow-lg p-4 bg-slate-800">
          {list.map((val, key) => {
            if (activeTab === val.name) {
              return <div key={key}>{val.component}</div>;
            }
          })}
        </div>
        {mounted && <WalletMultiButton />}
      </div>
    </>
  );
};

export default HomePage;
