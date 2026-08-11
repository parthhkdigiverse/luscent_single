import React, { useState, useEffect } from "react";
import { faqs as staticFaqs } from "../data/faqs";
import { FAQAccordion } from "../components/FAQAccordion";
import { HelpCircle, Search } from "lucide-react";
import { API_URL } from "../config";
import { Loader } from "../components/Loader";

export const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [faqList, setFaqList] = useState(staticFaqs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/content/faq_categories`, { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.content) {
          setFaqList(data.content);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Flatten faqList if it's in the grouped format
  const allQuestions = React.useMemo(() => {
    if (!Array.isArray(faqList)) return [];
    return faqList.flatMap(item => {
      if (item && item.questions && Array.isArray(item.questions)) {
        return item.questions;
      }
      return item ? [item] : [];
    });
  }, [faqList]);

  // Filter based on search term
  const filteredQuestions = React.useMemo(() => {
    return allQuestions.filter(
      q => q && q.question && (
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (q.answer && q.answer.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [allQuestions, searchTerm]);

  if (loading) {
    return <Loader text="Loading FAQs..." />;
  }

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
        <div className="max-w-md mx-auto pt-4">
          <div className="relative">
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
        </div>
      </section>

      {/* Accordions list */}
      <div className="space-y-10 text-left">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-10 text-brand-grey text-xs">
            No questions match "{searchTerm}". Try searching for "sunscreen" or "shipping".
          </div>
        ) : (
          <FAQAccordion items={filteredQuestions} />
        )}
      </div>
    </div>
  );
};
export default FAQPage;
