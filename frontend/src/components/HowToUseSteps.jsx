import React from "react";
import { Sparkles, HelpCircle, RefreshCw, Layers } from "lucide-react";

export const HowToUseSteps = ({ steps, productId }) => {
  const isFaceWash = productId === "face-wash";

  if (isFaceWash) {
    // Face Wash 3-step icon row
    const faceWashSteps = [
      { title: "Wet Face", desc: "Splash face with lukewarm water" },
      { title: "Massage Gently", desc: "Work into a light lather, massage" },
      { title: "Rinse Well", desc: "Rinse thoroughly and pat dry" }
    ];

    return (
      <div className="grid grid-cols-3 gap-4 py-4 text-center">
        {faceWashSteps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-brand-secondary/10 text-brand-secondary flex items-center justify-center mb-3 font-semibold text-sm">
              {idx + 1}
            </div>
            <h4 className="font-serif text-xs md:text-sm font-semibold text-brand-dark mb-1">{step.title}</h4>
            <p className="text-[10px] md:text-xs text-brand-grey leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    );
  }

  // Otherwise, default to list style
  return (
    <div className="space-y-4 py-2">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-start gap-4">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-card flex items-center justify-center text-xs font-semibold text-brand-dark">
            {idx + 1}
          </span>
          <p className="text-xs md:text-sm text-brand-grey pt-0.5 leading-relaxed">
            {step}
          </p>
        </div>
      ))}
    </div>
  );
};
