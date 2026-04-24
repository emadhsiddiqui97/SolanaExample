import React, { FC } from "react";
import { buttonProps } from "./component.type";

const Button: FC<buttonProps> = ({ name, onClick }) => {
  return (
    <button
      className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
      onClick={onClick}
    >
      {name}
    </button>
  );
};

export default Button;
