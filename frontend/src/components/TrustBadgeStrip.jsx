import React from "react";
import { ShieldAlert, Award, DropletOff, Leaf } from "lucide-react";

export const TrustBadgeStrip = ({ className = "" }) => {
  const badges = [
    {
      icon: ShieldAlert,
      title: "SPF 50+ PA++++",
      desc: "Maximum solar defence"
    },
    {
      icon: Award,
      title: "Dermat Tested",
      desc: "Clinically proven safe"
    },
    {
      icon: DropletOff,
      title: "Fragrance Free Option",
      desc: "Zero harsh synthetic perfumes"
    },
    {
      icon: Leaf,
      title: "Cruelty Free",
      desc: "Ethically & cleanly made"
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 py-6 px-6 max-w-6xl mx-auto ${className}`}>
      {badges.map((b, idx) => (
        <div key={idx} className="flex flex-col items-center text-center p-2 group">
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
