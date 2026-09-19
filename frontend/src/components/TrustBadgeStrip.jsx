import React from "react";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";

export const TrustBadgeStrip = ({ className = "" }) => {
  const badges = [
    {
      icon: Truck,
      title: "Free Shipping",
      desc: "On all orders nationwide"
    },
    {
      icon: RotateCcw,
      title: "Easy Return / Exchange",
      desc: "7 Days hassle-free policy"
    },
    {
      icon: ShieldCheck,
      title: "Secure Payment",
      desc: "100% encrypted & protected"
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 py-6 px-6 max-w-5xl mx-auto ${className}`}>
      {badges.map((b, idx) => (
        <div key={idx} className="flex flex-col items-center text-center p-3 group rounded-2xl bg-brand-bg/40 border border-brand-card/40 hover:border-brand-dark transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-brand-card flex items-center justify-center text-brand-dark mb-3 transition-colors duration-300 group-hover:bg-brand-accent group-hover:text-white">
            <b.icon size={22} className="stroke-[1.5]" />
          </div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-brand-dark mb-0.5">{b.title}</h4>
          <p className="text-[11px] text-brand-grey">{b.desc}</p>
        </div>
      ))}
    </div>
  );
};
