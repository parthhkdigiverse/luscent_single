import React from "react";
import { RatingStars } from "./RatingStars";
import { Quote } from "lucide-react";

export const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-card/50 shadow-sm relative flex flex-col justify-between h-full group hover:shadow-md transition-all duration-300">
      <div className="absolute top-6 right-6 text-brand-card/40 group-hover:text-brand-accent/20 transition-colors duration-300">
        <Quote size={32} />
      </div>

      <div>
        <RatingStars rating={testimonial.rating} size={14} className="mb-4" />
        <p className="text-sm md:text-base text-brand-dark italic mb-6 leading-relaxed">
          "{testimonial.text}"
        </p>
      </div>

      <div className="border-t border-brand-card/50 pt-4 flex flex-col">
        <span className="font-serif text-sm font-semibold text-brand-dark">
          {testimonial.name}
        </span>
        <span className="text-[10px] uppercase tracking-wider font-medium text-brand-grey mb-1">
          {testimonial.role}
        </span>
        <span className="inline-self-start mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-brand-bg text-brand-dark border border-brand-card/50">
          {testimonial.skinType}
        </span>
      </div>
    </div>
  );
};
