import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const base =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300";

const styles = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "bg-gray-600 text-white hover:bg-gray-700",
  ghost: "bg-transparent text-brand hover:bg-brand/10",
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className,
  ...props
}) => {
  return (
    <button {...props} className={`${base} ${styles[variant]} ${className ?? ""}`}>
      {props.children}
    </button>
  );
};

export default Button;
