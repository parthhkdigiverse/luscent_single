import React, { useState, useRef, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";

export const BeforeAfterComparison = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseMove = (e) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto aspect-square md:aspect-[16/9] rounded-[2rem] overflow-hidden select-none shadow-[0_8px_30px_rgba(0,0,0,0.1)] group cursor-ew-resize"
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* Before Image (Background) */}
      <img
        src={beforeImage}
        alt="Before"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      
      {/* Before Label */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest z-10 shadow-sm pointer-events-none">
        Before
      </div>

      {/* After Image (Clipped) */}
      <img
        src={afterImage}
        alt="After"
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${!isDragging ? "transition-[clip-path] duration-300" : ""}`}
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      />
      
      {/* After Label */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest z-10 shadow-sm pointer-events-none">
        After
      </div>

      {/* Slider Line & Handle */}
      <div
        className={`absolute top-0 bottom-0 w-1 bg-white flex items-center justify-center pointer-events-none ${!isDragging ? "transition-all duration-300" : ""}`}
        style={{ left: `calc(${sliderPosition}%)`, transform: 'translateX(-50%)' }}
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] flex items-center justify-center">
          <ArrowLeftRight size={18} className="text-brand-dark/80" />
        </div>
      </div>
    </div>
  );
};
