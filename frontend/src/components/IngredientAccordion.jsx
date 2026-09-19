import React from "react";
import { Sparkles } from "lucide-react";

export const IngredientAccordion = ({ ingredients, fullList, actives }) => {
  const content = ingredients || fullList || (Array.isArray(actives) ? actives.join(", ") : actives) || "";
  let items = [];

  if (Array.isArray(content)) {
    content.forEach((c) => {
      if (typeof c === "string") {
        c.split(/[\n,]+/).forEach((item) => {
          if (item.trim()) items.push(item.trim());
        });
      } else if (c) {
        items.push(String(c).trim());
      }
    });
  } else if (typeof content === "string" && content.trim()) {
    content.split(/[\n,]+/).forEach((item) => {
      if (item.trim()) items.push(item.trim());
    });
  }

  if (items.length === 0) {
    return (
      <div className="text-xs text-brand-grey py-4">
        No ingredients added yet.
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-card/60 rounded-2xl p-5 shadow-sm space-y-3 max-w-2xl">
      <h4 className="font-serif text-sm font-semibold text-brand-dark flex items-center gap-2 border-b border-brand-card/40 pb-2">
        <Sparkles size={16} className="text-brand-accent" />
        Ingredients
      </h4>
      <ul className="space-y-2 pt-1">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2.5 text-xs md:text-sm text-brand-dark font-medium py-1 border-b border-brand-card/20 last:border-none">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
