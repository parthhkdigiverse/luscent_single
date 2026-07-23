import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Shield, Heart, Award } from "lucide-react";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { useData } from "../context/DataContext";

const defaultStory = {
  title: "Pure Science. Honest Care. Made in India.",
  subtitle: "We set out to remove the confusion and heavy formulas from daily solar protection and skin barrier repair.",
  manifesto_image: "/images/manifesto_banner.png",
  manifesto_tag: "OUR MANIFESTO",
  manifesto_text: "Formulating skin barrier protection that feels absolutely weightless.",
  founder_title: "Why we started Luscent Glow",
  founder_text: "skinceutical solutions in India are often split between two extremes: heavy, oily sunscreen blocks that clog pores, or harsh chemical washes that dry out the skin barrier entirely.\n\nLuscent Glow was created to strike the perfect balance: **\"Powerful Protection. Effective Gentle Care.\"** We wanted to engineer a hybrid mineral sunscreen that is completely weightless in hot summers, hydrates like a moisturizer, and leaves absolutely no white cast.\n\nBy working with elite formulation scientists, we designed our sunscreen and face wash using clinical-grade active ingredients like **Niacinamide, Salicylic Acid, and Alpha Arbutin**. We choose safety, transparency, and results over marketing buzzwords.",
  mfg_tag: "PROUDLY MADE IN INDIA",
  mfg_title: "Clinical Precision at Basilica Biotech, Surat",
  mfg_text: "Every batch of Luscent Glow products is formulated, tested, and bottled at **Basilica Biotech**, located in the industrial hub of **Surat, Gujarat, India**.\n\nBy manufacturing locally under world-class clinical conditions, we eliminate heavy import taxes and middlemen. This allows us to deliver high-potency, dermatologist-grade actives directly to you at honest, affordable prices.",
  mfg_image: "/images/production_facility.png",
  values_title: "Skincare Without Compromise",
  values: [
    { title: "Effective, Gentle Formulations", desc: "We never use drying alcohols, synthetic sulfates, or artificial fragrances. Our active acids work gently in harmony with your skin's natural pH." },
    { title: "Dermatologist Friendly", desc: "Tested extensively on all skin types. Our formulas prioritize lipid barrier repair to prevent redness, acne flare-ups, and irritations." },
    { title: "Honest Ingredients", desc: "No hidden chemical blocks or placeholder fillers. We list every single element of our sunscreen and face wash clearly, right on the front label." }
  ]
};

export const OurStoryPage = ({ previewData }) => {
  const { content: apiContent, loading } = useData();
  
  const ourStory = previewData || { ...defaultStory, ...apiContent?.our_story };

  if (loading && !previewData) {
    return <Loader text="Loading Our Story..." />;
  }

  // Helper to render bold text
  const renderText = (text) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, idx) => {
      if (!paragraph.trim()) return null;
      // Simple bold parsing: **text**
      const parts = paragraph.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="mb-4">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  const icons = [<Heart size={20} />, <Shield size={20} />, <Sparkles size={20} />];
  const bgColors = ["bg-brand-accent/10 text-brand-accent", "bg-brand-secondary/10 text-brand-secondary", "bg-brand-green/10 text-brand-green"];

  return (
    <div className={`${previewData ? 'py-8' : 'pt-24 pb-16'} px-6 max-w-7xl mx-auto space-y-20`}>
      {/* 1. Header Hero */}
      <section className="max-w-3xl mx-auto text-center space-y-6">
        <span className="text-[10px] tracking-widest uppercase font-bold text-brand-accent block">
          ABOUT LUSCENT GLOW
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-medium text-brand-dark leading-tight">
          {ourStory.title}
        </h1>
        <p className="text-sm md:text-base text-brand-grey leading-relaxed whitespace-pre-wrap">
          {ourStory.subtitle}
        </p>
      </section>

      {/* Large Image Break */}
      <div className="w-full h-80 md:h-[450px] rounded-[32px] overflow-hidden bg-brand-card/50 relative border border-brand-card/40 shadow-sm flex items-center justify-center">
        <img
          src={ourStory.manifesto_image}
          alt="Manifesto Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/20 rounded-[32px]" />
        <div className="absolute bottom-8 left-8 text-left text-white max-w-md">
          <span className="text-[9px] uppercase tracking-widest font-semibold opacity-75 block mb-1">{ourStory.manifesto_tag}</span>
          <h3 className="font-serif text-lg md:text-xl font-medium">{ourStory.manifesto_text}</h3>
        </div>
      </div>

      {/* 2. Founders note / Mission */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left max-w-6xl mx-auto">
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-brand-dark leading-snug">
            {ourStory.founder_title}
          </h2>
          <div className="h-[2px] w-20 bg-brand-accent" />
          <p className="text-xs text-brand-grey font-medium uppercase tracking-wider">FOUNDER'S NOTE</p>
        </div>

        <div className="lg:col-span-7 text-xs md:text-sm text-brand-grey leading-relaxed">
          {renderText(ourStory.founder_text)}
        </div>
      </section>

      {/* 3. Manufacturing and Quality Section */}
      <section className="bg-brand-dark text-white rounded-[32px] p-8 md:p-12 text-left relative overflow-hidden shadow-xl max-w-6xl mx-auto">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-secondary/20 rounded-full filter blur-[100px]" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-6 relative z-10">
            <span className="text-[9px] uppercase tracking-widest font-bold text-brand-accent block">{ourStory.mfg_tag}</span>
            <h2 className="font-serif text-3xl md:text-4xl font-medium leading-tight">
              {ourStory.mfg_title}
            </h2>
            <div className="text-xs md:text-sm text-brand-card/85 leading-relaxed">
              {renderText(ourStory.mfg_text)}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-semibold uppercase tracking-wider text-brand-card/90">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-brand-accent" /> ISO Certified Lab
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-brand-accent" /> 100% Non-Toxic
              </div>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="lg:col-span-5 relative z-10 w-full aspect-[4/3] lg:aspect-[1.1] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
            <img 
              src={ourStory.mfg_image} 
              alt="Manufacturing Facility" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* 4. Values Grid */}
      <section className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] tracking-widest uppercase font-bold text-brand-grey block mb-2">OUR GUIDING PILLARS</span>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-brand-dark">{ourStory.values_title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(ourStory.values || []).map((val, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-brand-card/50 shadow-sm text-left space-y-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColors[idx % 3]}`}>
                {icons[idx % 3] || <Heart size={20} />}
              </div>
              <h3 className="font-serif text-lg font-semibold text-brand-dark">{val.title}</h3>
              <p className="text-xs text-brand-grey leading-relaxed">
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-brand-card/35 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto text-center space-y-4">
        <h3 className="font-serif text-xl font-medium text-brand-dark">Ready to experience the Luscent Glow?</h3>
        <p className="text-xs text-brand-grey max-w-md mx-auto">Explore our daily essentials, formulated with active dermatological science.</p>
        <div className="pt-2">
          <Link to="/">
            <Button className="text-xs uppercase tracking-wider py-3 px-8">Shop All Products</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
export default OurStoryPage;
