import React from "react";
import { Check } from "lucide-react";

export const CheckoutStepper = ({ currentStep }) => {
  const steps = [
    { number: 1, label: "Shipping" },
    { number: 2, label: "Payment" },
    { number: 3, label: "Review" }
  ];

  return (
    <div className="flex items-center justify-center max-w-lg mx-auto py-6">
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <React.Fragment key={step.number}>
            {/* Step circle */}
            <div className="flex flex-col items-center relative">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold tracking-wide border transition-all duration-300 ${
                  isCompleted
                    ? "bg-brand-green border-brand-green text-white"
                    : isActive
                      ? "bg-brand-dark border-brand-dark text-white ring-4 ring-brand-card/50"
                      : "bg-white border-brand-card text-brand-grey"
                }`}
              >
                {isCompleted ? <Check size={14} /> : step.number}
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold mt-2 absolute -bottom-5 whitespace-nowrap ${
                  isActive || isCompleted ? "text-brand-dark" : "text-brand-grey/70"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {idx < steps.length - 1 && (
              <div
                className={`flex-grow h-[2px] mx-4 transition-all duration-500 ${
                  isCompleted ? "bg-brand-green" : "bg-brand-card"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
export default CheckoutStepper;
