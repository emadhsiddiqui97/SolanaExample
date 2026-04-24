import React, { FC } from "react";
import SendToken from "./SendToken";

type navbarTypes = {
  value: string;
  // setValue?: (name: string) => void;
  setValue: any;
};

const Navbar: FC<navbarTypes> = ({ value, setValue }) => {
  const list = [
    {
      name: "Create",
      component: <SendToken />,
    },
    {
      name: "Mint",
      component: <SendToken />,
    },
    {
      name: "Transfer",
      component: <SendToken />,
    },
    {
      name: "Burn",
      component: <SendToken />,
    },
    {
      name: "Freeze",
      component: <SendToken />,
    },
    {
      name: "Unfreeze",
      component: <SendToken />,
    },
  ];
  return (
    <div className="flex justify-around w-full">
      {list.map((item, key) => {
        return (
          <div
            onClick={() => {
              setValue(name);
            }}
          >
            {item.name}
          </div>
        );
      })}
    </div>
  );
};

export default Navbar;
