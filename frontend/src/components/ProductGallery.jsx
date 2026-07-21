import React, { useState } from "react";

export const ProductGallery = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ transform: "scale(1)" });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transform: "scale(1.5)",
      transformOrigin: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transform: "scale(1)" });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image View */}
      <div className="relative aspect-[3/4] rounded-3xl bg-[#FAF8F5] border border-brand-card/40 overflow-hidden flex items-center justify-center p-8">
        <img
          src={images[activeIndex]}
          alt={`${productName} view ${activeIndex + 1}`}
          className="max-h-full max-w-full object-contain transition-transform duration-200 cursor-zoom-in"
          style={zoomStyle}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`aspect-square rounded-xl overflow-hidden border bg-white p-2 transition-all duration-300 ${
              activeIndex === idx 
                ? "border-brand-dark ring-1 ring-brand-dark" 
                : "border-brand-card/50 hover:border-brand-grey"
            }`}
          >
            <img
              src={img}
              alt={`${productName} thumbnail ${idx + 1}`}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
