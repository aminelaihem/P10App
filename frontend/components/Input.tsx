// components/Input.tsx
import { InputHTMLAttributes } from "react";
import { IconType } from "react-icons";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: IconType;
}

export default function Input({ icon: Icon, ...props }: InputProps) {
  return (
    <div className="input-group-f1">
      <Icon className="input-icon-f1 text-f1red" />
      <input {...props} className="input-f1" />
    </div>
  );
}