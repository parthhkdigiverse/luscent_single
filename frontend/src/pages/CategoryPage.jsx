import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { ScrollReveal } from "../components/ScrollReveal";
import { useData } from "../context/DataContext";
import { Loader } from "../components/Loader";

export const CategoryPage = () => {
  const { categoryName } = useParams();
  const { products: allProducts, loading } = useData();

  const products = allProducts ? allProducts.filter(p => p.category === categoryName) : [];

  // Loading state
  if (loading) {
    return <Loader />;
  }

  // Smart routing check:
  // If there is exactly one product in the category, redirect to its detail view.
  if (products.length === 1) {
    return <Navigate to={`/product/${products[0].slug}`} replace />;
  }

  // Get Pretty title
  const getCategoryTitle = (cat) => {
    switch (cat) {
      case "sunscreen": return "Premium Sunscreens";
      case "face-wash": return "Brightening Face Washes";
      case "combo": return "Skincare Ritual Combos";
      default: return `${cat.charAt(0).toUpperCase() + cat.slice(1)} Collection`;
    }
  };

  return (
    <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-16 text-left">
      {/* Header */}
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-[10px] tracking-widest uppercase font-bold text-brand-accent block">
          COLLECTION CATALOG
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-brand-dark">
          {getCategoryTitle(categoryName)}
        </h1>
        <p className="text-xs md:text-sm text-brand-grey leading-relaxed">
          Clinically formulated to meet your skin's daily requirements without compromise.
        </p>
      </section>

      {products.length === 0 ? (
        <div className="py-20 text-center text-brand-grey text-xs">
          No products found in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ScrollReveal key={product.id}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
