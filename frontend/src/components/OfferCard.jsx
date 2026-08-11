import React from 'react';
import { ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OfferCard = ({ 
  title = "Summer Sale is Live", 
  description = "Get 20% OFF on all skincare bundles. Upgrade your routine with our clinical actives.", 
  code = "GLOW20", 
  link = "/category/bundles", 
  linkText = "Shop Bundles" 
}) => {
  return (
    <div className="relative overflow-hidden bg-brand-dark rounded-[32px] p-8 sm:p-12 shadow-xl text-white group border border-brand-dark/10">
      {/* Decorative gradient glowing orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-accent/25 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/30 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-bold tracking-widest uppercase text-brand-accent border border-white/5">
            <Tag size={12} />
            <span>Special Offer</span>
          </div>
          <h3 className="font-serif text-3xl md:text-5xl font-medium leading-tight text-[#FAF8F5]">
            {title}
          </h3>
          <p className="text-brand-card/80 text-sm md:text-base leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-5 shrink-0 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
          {code && (
            <div className="flex flex-col items-start sm:items-center md:items-end w-full">
              <span className="text-[10px] uppercase tracking-widest text-brand-card/60 mb-2">Use Code at Checkout</span>
              <span className="font-mono text-xl md:text-2xl font-bold tracking-[0.2em] bg-white/10 text-white px-5 py-2.5 rounded-xl border border-white/20 select-all w-full text-center">
                {code}
              </span>
            </div>
          )}
          
          <Link to={link} className="w-full inline-flex items-center justify-center bg-brand-accent text-white px-6 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-brand-dark transition-colors duration-300 shadow-md">
            {linkText}
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
