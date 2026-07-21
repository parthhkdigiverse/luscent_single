import React from "react";
import { Star, StarHalf } from "lucide-react";

export const RatingStars = ({ rating = 5, size = 16, className = "" }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className={`flex items-center gap-0.5 text-amber-500 flex-nowrap ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} fill="currentColor" stroke="currentColor" strokeWidth={1} className="shrink-0" />
      ))}
      {hasHalf && <StarHalf size={size} fill="currentColor" stroke="currentColor" strokeWidth={1} className="shrink-0" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} fill="currentColor" stroke="currentColor" strokeWidth={1} className="text-amber-500/20 shrink-0" />
      ))}
    </div>
  );
};
