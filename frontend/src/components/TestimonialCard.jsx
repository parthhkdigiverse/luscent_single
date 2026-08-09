import React from "react";
import { RatingStars } from "./RatingStars";
import { Quote } from "lucide-react";

export const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-gradient-to-br from-white via-white to-[#F9F7F3] p-8 rounded-3xl border border-brand-card/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative flex flex-col justify-between h-full group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-accent/5 rounded-full blur-2xl group-hover:bg-brand-accent/10 transition-colors duration-500"></div>
      
      <div className="absolute top-6 right-6 text-brand-accent/20 group-hover:text-brand-accent/40 group-hover:scale-110 transition-all duration-500 transform origin-top-right">
        <Quote size={40} className="drop-shadow-sm" />
      </div>

      <div className="relative z-10">
        <RatingStars rating={testimonial.rating} size={16} className="mb-5 drop-shadow-sm" />
        <p className="text-[15px] md:text-base text-brand-dark/90 italic mb-8 leading-relaxed font-medium">
          "{testimonial.text}"
        </p>
      </div>

      <div className="border-t border-brand-card/60 pt-5 flex items-center justify-between relative z-10">
        <div className="flex flex-col">
          <span className="font-serif text-base font-semibold text-brand-dark tracking-wide">
            {testimonial.name}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-medium text-brand-grey mt-0.5">
            {testimonial.role}
          </span>
        </div>
        <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-white text-brand-dark border border-brand-card/50 shadow-sm">
          {testimonial.skinType}
        </span>
      </div>
    </div>
  );
};
