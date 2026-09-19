import React from "react";

export const HowToUseSteps = ({ steps }) => {
  let stepList = [];
  if (Array.isArray(steps)) {
    steps.forEach((s) => {
      if (typeof s === "string") {
        s.split(/[\n,]+/).forEach((item) => {
          if (item.trim()) stepList.push(item.trim());
        });
      } else if (s) {
        stepList.push(String(s).trim());
      }
    });
  } else if (typeof steps === "string" && steps.trim()) {
    steps.split(/[\n,]+/).forEach((item) => {
      if (item.trim()) stepList.push(item.trim());
    });
  }

  if (stepList.length === 0) {
    return (
      <div className="text-xs text-brand-grey py-4">
        No usage instructions added yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2 max-w-2xl">
      {stepList.map((step, idx) => (
        <div key={idx} className="flex items-start gap-3 bg-white border border-brand-card/50 p-3.5 rounded-xl shadow-sm">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-dark text-white flex items-center justify-center text-xs font-bold">
            {idx + 1}
          </span>
          <p className="text-xs md:text-sm text-brand-dark pt-0.5 leading-relaxed font-medium">
            {step}
          </p>
        </div>
      ))}
    </div>
  );
};
