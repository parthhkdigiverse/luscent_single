import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Check, ShieldCheck, Heart, AlertCircle, ShoppingCart } from "lucide-react";
import { Button } from "../components/Button";
import { RatingStars } from "../components/RatingStars";
import { ProductGallery } from "../components/ProductGallery";
import { BenefitBadge } from "../components/BenefitBadge";
import { HowToUseSteps } from "../components/HowToUseSteps";
import { IngredientAccordion } from "../components/IngredientAccordion";
import { useCart } from "../context/CartContext";
import { useData } from "../context/DataContext";
import { Loader } from "../components/Loader";

export const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products: allProducts, loading } = useData();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [addedNotify, setAddedNotify] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setActiveTab("description");
  }, [slug]);

  if (loading) return <Loader />;

  const product = allProducts?.find(p => p.id === slug || p.slug === slug);
  if (!product) return <div className="py-32 text-center text-brand-grey text-sm">Product not found.</div>;

  const isCombo = product.id === "combo";
  const crossSells = allProducts.filter((p) => p.id !== product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotify(true);
    setTimeout(() => setAddedNotify(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/checkout");
  };

  return (
    <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-16">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center gap-2 text-xs text-brand-grey border-b border-brand-card/30 pb-4">
        <Link to="/" className="hover:text-brand-dark transition-colors flex items-center gap-1">
          <ArrowLeft size={12} /> Home
        </Link>
        <span>/</span>
        <span className="capitalize">{product.name}</span>
      </div>

      {/* Main product presentation block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right Column: Product Detail Form */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Badge */}
          {product.badge && (
            <span className={`inline-block px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold text-white ${
              isCombo ? "bg-brand-dark" : product.id === "sunscreen" ? "bg-brand-accent" : "bg-brand-secondary"
            }`}>
              {product.badge}
            </span>
          )}

          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-brand-dark leading-tight mb-2">
              {product.name}
            </h1>
            <p className="text-xs md:text-sm text-brand-grey font-medium tracking-wide">
              {product.subtitle}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <RatingStars rating={product.rating || 5} size={14} />
            <span className="text-xs font-semibold text-brand-dark">{product.rating || "5.0"}</span>
            <span className="text-xs text-brand-grey">
              ({product.id === "combo" ? "12" : "48"} verified reviews)
            </span>
          </div>

          {/* Sizing Label */}
          <div className="text-xs">
            <span className="text-brand-grey uppercase tracking-wider font-semibold block mb-1">Net Quantity</span>
            <span className="px-3.5 py-1.5 bg-brand-card rounded-full font-medium text-brand-dark inline-block border border-brand-card">
              {product.netVolume}
            </span>
          </div>

          {/* Price details */}
          <div className="py-4 border-y border-brand-card/50">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-bold text-brand-dark">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-base text-brand-grey line-through">₹{product.originalPrice}</span>
              )}
              {product.savings && (
                <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded">
                  Save ₹{product.savings}
                </span>
              )}
            </div>
            <p className="text-[10px] text-brand-grey mt-1">Inclusive of all taxes. Free shipping on this order.</p>
          </div>

          {/* Combo side-by-side presentation */}
          {isCombo && (
            <div className="bg-brand-card/30 border border-brand-card/50 rounded-2xl p-4 space-y-3">
              <span className="text-[9px] uppercase tracking-widest font-bold text-brand-dark block">BUNDLE INCLUDES</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-brand-card/40 flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-brand-bg flex items-center justify-center p-1">
                    <img src={allProducts.find(p => p.id === "sunscreen")?.images?.[0] || "/images/sunscreen.png"} alt="Sunscreen" className="max-h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[10px] font-bold text-brand-dark truncate">Ultra Light Sunscreen</h5>
                    <span className="text-[9px] text-brand-grey">50 mL · ₹690</span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-brand-card/40 flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-brand-bg flex items-center justify-center p-1">
                    <img src={allProducts.find(p => p.id === "face-wash")?.images?.[0] || "/images/facewash.png"} alt="Face Wash" className="max-h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[10px] font-bold text-brand-dark truncate">Bright Skin Face Wash</h5>
                    <span className="text-[9px] text-brand-grey">100 mL · ₹395</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Qty & CTAs */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-brand-dark uppercase tracking-wider">Quantity</span>
              <div className="flex items-center border border-brand-card rounded-full bg-brand-bg px-3 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-brand-grey hover:text-brand-dark text-lg"
                >
                  -
                </button>
                <span className="w-12 text-center text-xs font-semibold text-brand-dark">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center font-bold text-brand-grey hover:text-brand-dark text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                variant="primary"
                className="w-full py-4 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} /> Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                variant={product.id === "face-wash" ? "navy" : "secondary"}
                className="w-full py-4 text-xs uppercase tracking-widest"
              >
                Buy It Now
              </Button>
            </div>

            {/* Notification alert */}
            {addedNotify && (
              <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green text-xs flex items-center gap-2 animate-fade-in justify-center">
                <Check size={14} className="stroke-[3]" /> Added to cart successfully!
              </div>
            )}
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-3 gap-2 py-4 border-t border-brand-card/40 text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <ShieldCheck size={14} className="text-brand-green" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-dark">Dermat Tested</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <ShieldCheck size={14} className="text-brand-green" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-dark">Fragrance Free</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <ShieldCheck size={14} className="text-brand-green" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-dark">Clean Sourcing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion / Tabs Details */}
      <section className="border-t border-brand-card/40 pt-12 text-left">
        <div className="flex border-b border-brand-card/40 mb-6 gap-6 overflow-x-auto pb-1">
          {["description", "benefits", "how-to-use", "ingredients", "caution"].map((tab) => {
            if (tab === "caution" && !product.caution) return null;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs md:text-sm font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  activeTab === tab ? "border-b-2 border-brand-dark text-brand-dark" : "text-brand-grey/50 hover:text-brand-dark"
                }`}
              >
                {tab.replace("-", " ")}
              </button>
            );
          })}
        </div>

        {/* Tab contents */}
        <div className="min-h-36">
          {activeTab === "description" && (
            <div className="space-y-4 max-w-3xl">
              <p className="text-xs md:text-sm text-brand-grey leading-relaxed">
                Experience clinical care combined with luxury application. Our {product.name} is engineered using premium standard, non-comedogenic ingredients to ensure total skin protection and a nourishing, silky experience.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="bg-brand-card text-brand-dark px-3 py-1 rounded-full text-[10px] font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "benefits" && (
            <div className="flex flex-wrap gap-3 max-w-2xl py-2">
              {product.benefits.map((benefit, idx) => (
                <BenefitBadge key={idx} text={benefit} />
              ))}
            </div>
          )}

          {activeTab === "how-to-use" && (
            <div className="max-w-2xl">
              <HowToUseSteps steps={product.howToUse} productId={product.id} />
            </div>
          )}

          {activeTab === "ingredients" && (
            <div className="max-w-2xl">
              <IngredientAccordion actives={product.keyActives} fullList={product.ingredients} />
            </div>
          )}

          {activeTab === "caution" && product.caution && (
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 max-w-2xl space-y-2">
              <span className="flex items-center gap-1.5 text-red-800 text-xs font-semibold uppercase tracking-wider">
                <AlertCircle size={14} /> Usage Cautions
              </span>
              <ul className="list-disc list-inside text-xs text-red-700/80 space-y-1 pl-1">
                {product.caution.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* You May Also Like (Cross Sell) */}
      <section className="border-t border-brand-card/40 pt-16">
        <h2 className="font-serif text-2xl md:text-3xl text-left font-medium text-brand-dark mb-8">
          Complete Your Ritual
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {crossSells.map((p) => (
            <div key={p.id} className="bg-white border border-brand-card/50 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div className="flex gap-4">
                <div className="w-20 h-24 bg-brand-bg rounded-xl p-2 flex items-center justify-center border border-brand-card/30 flex-shrink-0">
                  <img src={p.images[0]} alt="" className="max-h-full object-contain" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-wider text-brand-grey font-semibold">{p.netVolume}</span>
                  <h4 className="font-serif text-sm font-semibold text-brand-dark mt-0.5">{p.name}</h4>
                  <p className="text-xs text-brand-grey line-clamp-2 mt-1 leading-relaxed">{p.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-brand-card/30 pt-4 mt-4">
                <span className="text-sm font-semibold text-brand-dark">₹{p.price}</span>
                <Link to={`/product/${p.slug}`}>
                  <Button variant="outline" size="sm" className="text-[10px] uppercase font-bold py-2.5 px-5">
                    View Product
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default ProductPage;
