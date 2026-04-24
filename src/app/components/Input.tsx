import React, { FC } from "react";
import { inputProps } from "./component.type";

const InputComponent: FC<inputProps> = ({ label, type, onChange, value }) => {
  return (
    <div>
      <label className="text-gray-400 ml-2">{label}</label>
      <input
        type={type}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-lg bg-gray-700 border-gray-700 text-gray-900 focus:border-blue-500"
        required
      />
    </div>
  );
};

export default InputComponent;
