// components/Button.tsx
import { ButtonHTMLAttributes } from "react";
import { FaFlagCheckered } from "react-icons/fa";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  label?: string;
}

export default function Button({ loading, label = "Start Engine", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`btn-f1-red mt-2 flex items-center justify-center gap-3 ${
        loading ? "animate-f1-pulse" : ""
      } ${props.className || ""}`}
      disabled={loading || props.disabled}
    >
      <FaFlagCheckered className="text-2xl text-f1red" />
      {loading ? <span className="loader-f1-red" /> : label}
    </button>
  );
}