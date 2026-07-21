import React from "react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-sans font-medium tracking-wide transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-accent hover:bg-[#c25a20] text-white focus:ring-brand-accent shadow-sm hover:shadow-md transform hover:-translate-y-0.5",
    secondary: "border border-brand-dark hover:bg-brand-dark hover:text-white text-brand-dark focus:ring-brand-dark",
    navy: "bg-brand-secondary hover:bg-[#152945] text-white focus:ring-brand-secondary shadow-sm hover:shadow-md transform hover:-translate-y-0.5",
    outline: "border border-brand-card hover:bg-brand-card/50 text-brand-dark focus:ring-brand-card",
    ghost: "text-brand-dark hover:bg-brand-card/30 focus:ring-brand-dark",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
