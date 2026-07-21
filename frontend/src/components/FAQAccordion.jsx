import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export const FAQAccordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`border rounded-2xl transition-all duration-300 ${
              isOpen ? "border-brand-dark bg-white shadow-sm" : "border-brand-card/70 bg-white/50 hover:bg-white"
            }`}
          >
            <button
              onClick={() => toggleItem(idx)}
              className="w-full flex items-center justify-between px-5 py-4 text-left font-serif text-sm md:text-base font-semibold text-brand-dark transition-colors duration-200"
            >
              <span>{item.question}</span>
              <span className="flex-shrink-0 ml-4 w-6 h-6 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark">
                {isOpen ? <Minus size={14} /> : <Plus size={14} />}
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="px-5 pb-5 text-xs md:text-sm text-brand-grey leading-relaxed border-t border-brand-card/30 pt-3">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
