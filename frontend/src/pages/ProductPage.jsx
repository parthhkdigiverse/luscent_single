import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Check, ShieldCheck, Heart, AlertCircle, ShoppingCart, CheckCircle2, Award, DropletOff, Leaf } from "lucide-react";
import { Button } from "../components/Button";
import { RatingStars } from "../components/RatingStars";
import { ProductGallery } from "../components/ProductGallery";
import { BenefitBadge } from "../components/BenefitBadge";
import { HowToUseSteps } from "../components/HowToUseSteps";
import { IngredientAccordion } from "../components/IngredientAccordion";
import { FAQAccordion } from "../components/FAQAccordion";
import { useCart } from "../context/CartContext";
import { TrustBadgeStrip } from "../components/TrustBadgeStrip";
import { API_URL } from "../config";

export const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [addedNotify, setAddedNotify] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const [resProduct, resAll] = await Promise.all([
          fetch(`${API_URL}/api/products/${slug}`, { cache: 'no-store' }),
          fetch(`${API_URL}/api/products`, { cache: 'no-store' })
        ]);
        
        if (!resProduct.ok) throw new Error("Failed to fetch product");
        const data = await resProduct.json();
        setProduct(data);
        
        try {
          const resReviews = await fetch(`${API_URL}/api/products/${data.id || data._id}/reviews`, { cache: 'no-store' });
          if (resReviews.ok) {
            setReviews(await resReviews.json());
          }
        } catch (e) {
          console.error("Failed to fetch reviews");
        }
        
        if (resAll.ok) {
          const allData = await resAll.json();
          setAllProducts(allData);
        }

        // Fetch reviews
        if (data && data.id) {
          try {
            const revRes = await fetch(`${API_URL}/api/reviews/product/${data.id}`);
            if (revRes.ok) {
              const revData = await revRes.json();
              setReviews(revData);
            }
          } catch (e) {
            console.error("Failed to fetch reviews");
          }
        }
      } catch (err) {
        console.warn("FastAPI backend not available:", err.message);
        navigate("/");
      }
    };
    loadProduct();
    setQuantity(1);
    setActiveTab("description");
  }, [slug, navigate]);

  if (!product) return <div className="py-32 text-center text-brand-grey text-sm">Loading...</div>;

  const isCombo = product.id === "combo";
  const crossSells = allProducts.filter((p) => p.id !== product.id);
  const comboSunscreen = allProducts.find((p) => p.id === "sunscreen");
  const comboFaceWash = allProducts.find((p) => p.id === "face-wash");

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
          <div 
            className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity" 
            onClick={() => {
              const elem = document.getElementById("reviews-section");
              if (elem) {
                elem.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          >
            <RatingStars rating={product.rating || 5} size={14} />
            <span className="text-xs font-semibold text-brand-dark group-hover:underline">
              {(product.rating ? parseFloat(product.rating).toFixed(1) : "5.0")} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
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
                    <img src={comboSunscreen?.images?.[0]} alt="" className="max-h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[10px] font-bold text-brand-dark truncate">Ultra Light Sunscreen</h5>
                    <span className="text-[9px] text-brand-grey">50 mL · ₹690</span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-brand-card/40 flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-brand-bg flex items-center justify-center p-1">
                    <img src={comboFaceWash?.images?.[0]} alt="" className="max-h-full object-contain" />
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
                  disabled={product.available_stock <= 0}
                  className="w-8 h-8 flex items-center justify-center font-bold text-brand-grey hover:text-brand-dark text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-12 text-center text-xs font-semibold text-brand-dark">
                  {product.available_stock <= 0 ? 0 : quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.available_stock <= 0 || quantity >= product.available_stock}
                  className="w-8 h-8 flex items-center justify-center font-bold text-brand-grey hover:text-brand-dark text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              {product.available_stock > 0 && product.available_stock <= 5 && (
                <span className="text-xs font-semibold text-brand-accent">Only {product.available_stock} left!</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={product.available_stock <= 0}
                variant={product.available_stock <= 0 ? "outline" : "primary"}
                className={`w-full py-4 text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${product.available_stock <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ShoppingBag size={14} /> {product.available_stock <= 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={product.available_stock <= 0}
                variant={product.id === "face-wash" ? "navy" : "secondary"}
                className={`w-full py-4 text-xs uppercase tracking-widest ${product.available_stock <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
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

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 pb-2 border-t border-brand-card/40">
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-brand-bg/30 border border-brand-card/30 hover:border-brand-dark transition duration-300">
              <div className="w-10 h-10 rounded-full bg-brand-card/85 flex items-center justify-center text-brand-dark mb-2 shadow-sm">
                <Award size={18} className="stroke-[1.5]" />
              </div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-brand-dark">Dermat Tested</span>
              <span className="text-[9px] text-brand-grey mt-0.5">Clinically Safe</span>
            </div>
            
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-brand-bg/30 border border-brand-card/30 hover:border-brand-dark transition duration-300">
              <div className="w-10 h-10 rounded-full bg-brand-card/85 flex items-center justify-center text-brand-dark mb-2 shadow-sm">
                <DropletOff size={18} className="stroke-[1.5]" />
              </div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-brand-dark">Fragrance Free</span>
              <span className="text-[9px] text-brand-grey mt-0.5">Zero Perfumes</span>
            </div>

            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-brand-bg/30 border border-brand-card/30 hover:border-brand-dark transition duration-300">
              <div className="w-10 h-10 rounded-full bg-brand-card/85 flex items-center justify-center text-brand-dark mb-2 shadow-sm">
                <Leaf size={18} className="stroke-[1.5]" />
              </div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-brand-dark">Clean Source</span>
              <span className="text-[9px] text-brand-grey mt-0.5">100% Ethical</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Strip */}
      <div className="border-t border-brand-card/30 pt-8">
        <TrustBadgeStrip />
      </div>

      {/* Accordion / Tabs Details */}
      <section className="border-t border-brand-card/40 pt-12 text-left">
        <div className="flex border-b border-brand-card/40 mb-6 gap-6 overflow-x-auto pb-1">
          {["description", "benefits", "how-to-use", "ingredients", "faq", "caution"].map((tab) => {
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

          {activeTab === "faq" && (
            <div className="max-w-2xl">
              {product.faqs && product.faqs.length > 0 ? (
                <FAQAccordion items={product.faqs} />
              ) : (
                <div className="text-left text-sm text-brand-grey py-8 border border-dashed border-brand-card/60 rounded-2xl px-6 bg-brand-bg/30">
                  No FAQs available for this product yet. Check back later!
                </div>
              )}
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

      {/* Customer Reviews Section (Compact Space-Saving Layout) */}
      <section id="reviews-section" className="border-t border-brand-card/30 pt-8 text-left max-w-4xl scroll-mt-24">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-lg font-semibold text-brand-dark">
              Customer Reviews
            </h2>
            <span className="text-xs px-2.5 py-0.5 bg-brand-dark/5 border border-brand-card/40 rounded-full font-semibold text-brand-dark">
              ★ {product.rating ? Number(product.rating).toFixed(1) : "5.0"} ({reviews.length})
            </span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-brand-card/40 p-4 text-center text-xs text-brand-grey">
            No reviews yet for this product.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reviews.map((rev, idx) => (
              <div 
                key={rev._id || rev.id || idx} 
                className="bg-white border border-brand-card/40 rounded-xl p-3 shadow-sm hover:border-brand-dark/30 transition-all text-xs flex flex-col justify-between gap-1"
              >
                <div className="flex items-center justify-between gap-2 border-b border-brand-card/20 pb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-brand-dark text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0 uppercase">
                      {(rev.name || "C")[0]}
                    </span>
                    <span className="font-semibold text-xs text-brand-dark truncate">{rev.name || "Verified Customer"}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-amber-500 font-bold text-xs">★ {rev.rating}</span>
                    <span className="text-[9px] text-brand-grey">
                      • {rev.created_at ? new Date(rev.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : ""}
                    </span>
                  </div>
                </div>

                <div className="pt-0.5">
                  {rev.title && (
                    <strong className="text-brand-dark text-xs block truncate">{rev.title}</strong>
                  )}
                  <p className="text-brand-grey text-[11px] leading-tight mt-0.5">{rev.comment}</p>
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
                      {rev.images.map((img, i) => (
                        <div 
                          key={i} 
                          className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-brand-card/30 cursor-zoom-in hover:opacity-85 transition-opacity"
                          onClick={() => setZoomImage(img)}
                        >
                          <img src={img} alt={`Review attachment ${i+1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* You May Also Like (Cross Sell) */}
      <section className="border-t border-brand-card/40 pt-16 mt-16">
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

      {/* Image Zoom Lightbox Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-fade-in"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden bg-white rounded-3xl p-1.5 shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-black/85 text-white rounded-full flex items-center justify-center transition-colors font-bold text-sm z-10"
              onClick={() => setZoomImage(null)}
            >
              ✕
            </button>
            <img 
              src={zoomImage} 
              alt="Zoomed review attachment" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductPage;
