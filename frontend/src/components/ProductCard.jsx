import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { RatingStars } from "./RatingStars";

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const isCombo = product.id === "combo";

  const getBorderColor = () => {
    if (product.id === "sunscreen") return "hover:border-brand-accent/30";
    if (product.id === "face-wash") return "hover:border-brand-secondary/30";
    return "hover:border-brand-dark/30";
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`group relative flex flex-col justify-between h-full bg-white rounded-3xl p-6 border border-brand-card/50 shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${getBorderColor()}`}
    >
      {/* Badge / Ribbon */}
      {product.badge && (
        <div className="absolute top-4 left-4 z-10">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-semibold text-white ${
            isCombo ? "bg-brand-dark" : product.id === "sunscreen" ? "bg-brand-accent" : "bg-brand-secondary"
          }`}>
            {product.badge}
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-brand-bg flex items-center justify-center p-6 mb-6">
        <img
          src={product.images[0]}
          alt={product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        {/* Quick View overlay */}
        <div className="absolute inset-0 bg-brand-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/90 backdrop-blur-sm text-brand-dark px-4 py-2 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            View Details <ArrowRight size={14} />
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey">
            {product.netVolume}
          </span>
          <RatingStars rating={product.rating || 5} size={12} />
        </div>

        <h3 className="font-serif text-lg md:text-xl font-medium text-brand-dark group-hover:text-brand-accent transition-colors duration-300 mb-1">
          {product.name}
        </h3>

        <p className="text-xs text-brand-grey line-clamp-2 mb-4 leading-relaxed">
          {product.subtitle}
        </p>

        {/* Pricing & Add to Cart */}
        <div className="mt-auto pt-4 border-t border-brand-card/50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-brand-dark">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-brand-grey line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            {product.savings && (
              <span className="text-[10px] font-semibold text-brand-green">
                Save ₹{product.savings}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
              isCombo 
                ? "bg-brand-dark hover:bg-black" 
                : product.id === "sunscreen" 
                  ? "bg-brand-accent hover:bg-[#c25a20]" 
                  : "bg-brand-secondary hover:bg-[#152945]"
            }`}
            title="Quick Add to Cart"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
};
