import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export const IngredientAccordion = ({ actives, fullList }) => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="border border-brand-card/60 rounded-2xl overflow-hidden divide-y divide-brand-card/60 bg-white">
      {/* Key Actives Section */}
      <div>
        <button
          onClick={() => toggleSection("actives")}
          className="w-full flex items-center justify-between px-5 py-4 text-left font-serif text-sm font-medium text-brand-dark hover:bg-brand-bg transition-colors duration-200"
        >
          <span>Key Active Ingredients</span>
          {openSection === "actives" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openSection === "actives" && (
          <div className="px-5 pb-5 pt-1">
            <div className="grid grid-cols-2 gap-3">
              {actives.map((act, idx) => (
                <div key={idx} className="bg-brand-bg px-3.5 py-2.5 rounded-xl border border-brand-card/30">
                  <span className="text-xs font-semibold text-brand-dark block mb-0.5">{act.split(" ")[0]}</span>
                  <span className="text-xs text-brand-grey">{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Ingredient List */}
      <div>
        <button
          onClick={() => toggleSection("full")}
          className="w-full flex items-center justify-between px-5 py-4 text-left font-serif text-sm font-medium text-brand-dark hover:bg-brand-bg transition-colors duration-200"
        >
          <span>Full Ingredient List</span>
          {openSection === "full" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openSection === "full" && (
          <div className="px-5 pb-5 pt-1">
            <p className="text-xs text-brand-grey leading-relaxed font-sans bg-brand-bg p-4 rounded-xl border border-brand-card/30">
              {fullList}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
