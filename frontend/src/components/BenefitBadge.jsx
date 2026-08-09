import React from "react";
import { CheckCircle2 } from "lucide-react";

export const BenefitBadge = ({ text, className = "" }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[13px] font-semibold tracking-wide bg-gradient-to-r from-[#F3EFE9]/40 to-white text-brand-dark shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-brand-card/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:border-brand-accent/30 cursor-default select-none ${className}`}>
      <CheckCircle2 size={16} className="text-brand-accent/90" />
      {text}
    </span>
  );
};
