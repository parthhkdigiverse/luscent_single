import React, { useState, useEffect } from "react";
import { faqs as staticFaqs } from "../data/faqs";
import { FAQAccordion } from "../components/FAQAccordion";
import { HelpCircle, Search } from "lucide-react";
import { API_URL } from "../config";

export const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [faqList, setFaqList] = useState(staticFaqs);

  useEffect(() => {
    fetch(`${API_URL}/api/content/faq_categories`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.content) {
          setFaqList(data.content);
        }
      })
      .catch(() => {});
  }, []);

  // Filter FAQs based on search
  const filteredFaqs = faqList.map(cat => {
    const filteredQuestions = cat.questions ? cat.questions.filter(
      q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
           q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];
    return {
      ...cat,
      questions: filteredQuestions
    };
  }).filter(cat => cat.questions && cat.questions.length > 0);

  return (
    <div className="pt-24 pb-16 px-6 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <section className="text-center space-y-4">
        <span className="text-[10px] tracking-widest uppercase font-bold text-brand-accent block">
          HELP CENTER
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-brand-dark">
          Frequently Asked Questions
        </h1>
        <p className="text-xs md:text-sm text-brand-grey max-w-md mx-auto leading-relaxed">
          Find instant answers to questions regarding our active ingredients, solar safety, order shipping, and return terms.
        </p>

        {/* Search bar */}
        <div className="max-w-md mx-auto pt-4 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey/60">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions or ingredients..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-brand-card rounded-full text-xs focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all"
          />
        </div>
      </section>

      {/* Grouped Accordions list */}
      <div className="space-y-10 text-left">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-10 text-brand-grey text-xs">
            No questions match "{searchTerm}". Try searching for "sunscreen" or "shipping".
          </div>
        ) : (
          filteredFaqs.map((cat, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="font-serif text-lg font-semibold text-brand-dark border-b border-brand-card/50 pb-2 flex items-center gap-2">
                <HelpCircle size={16} className="text-brand-accent" /> {cat.category}
              </h2>
              <FAQAccordion items={cat.questions} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default FAQPage;
