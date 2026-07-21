import React from "react";

export const BenefitBadge = ({ text, className = "" }) => {
  return (
    <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide bg-brand-dark text-white border border-brand-dark transition-all duration-300 hover:bg-transparent hover:text-brand-dark cursor-default select-none ${className}`}>
      {text}
    </span>
  );
};
