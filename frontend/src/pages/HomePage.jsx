import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { testimonials as staticTestimonials } from "../data/testimonials";
import { faqs as staticFaqs } from "../data/faqs";
import { Button } from "../components/Button";
import { ProductCard } from "../components/ProductCard";
import { TrustBadgeStrip } from "../components/TrustBadgeStrip";
import { TestimonialCard } from "../components/TestimonialCard";
import { FAQAccordion } from "../components/FAQAccordion";
import { ScrollReveal } from "../components/ScrollReveal";
import { API_URL } from "../config";

const defaultHeroSlides = [
  {
    id: "sunscreen",
    tag: "SPF 50+ PA++++ DEFENSE",
    title: "Powerful Protection. Effortless Glow.",
    desc: "Weightless, non-greasy sunscreen that blocks UV rays while treating dark spots. Powered by 2% Niacinamide & Zinc Oxide.",
    image: "/images/sunscreen_banner.png",
    link: "/product/sunscreen"
  },
  {
    id: "face-wash",
    tag: "DEEP CLEANSING & BRIGHTENING",
    title: "Gentle Cleanse. Radiant Skin.",
    desc: "Exfoliates pores, controls breakouts, and fades dark spots with Salicylic Acid & Niacinamide.",
    image: "/images/sunscreen_beach_banner.jpg",
    link: "/product/face-wash"
  },
  {
    id: "combo",
    tag: "THE COMPLETE GLOW ROUTINE",
    title: "Ultimate Skin Defense Duo.",
    desc: "Maximum sun protection combined with a deep brightening cleanse. Get our bestselling duo and save ₹86.",
    image: "/images/hero_banner.png",
    link: "/product/combo"
  }
];

export const HomePage = () => {
  const [productList, setProductList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [heroSlides, setHeroSlides] = useState(defaultHeroSlides);
  const [bannerText, setBannerText] = useState({ title: "Powerful Protection. Effective Gentle Care.", subtitle: "We focus on formulation efficacy. Minimal products, maximal results. Discover our daily essential routine." });
  const [testimonialsList, setTestimonialsList] = useState(staticTestimonials);
  const [faqList, setFaqList] = useState(staticFaqs);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setProductList(data);
          }
        }
      } catch (err) {
        console.warn("FastAPI backend not available:", err.message);
      } finally {
        setLoadingProducts(false);
      }
    };
    const loadContent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/content`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.hero_slides) setHeroSlides(data.hero_slides);
          if (data.homepage_banner) setBannerText(data.homepage_banner);
          if (data.testimonials) setTestimonialsList(data.testimonials);
          if (data.faq_categories) setFaqList(data.faq_categories);
        }
      } catch (err) {
        console.warn("Content API not available, using static defaults:", err.message);
      }
    };
    loadProducts();
    loadContent();
  }, []);

  // Extract products
  const sunscreen = productList.find(p => p.id === "sunscreen");
  const faceWash = productList.find(p => p.id === "face-wash");
  const combo = productList.find(p => p.id === "combo");

  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-scroll slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Get first 3 FAQs for preview
  const faqPreview = faqList && faqList.length > 0 && faqList[0].questions
    ? faqList[0].questions.slice(0, 3)
    : [];

  const activesList = [
    {
      name: "Niacinamide",
      desc: "Deeply repairs the skin barrier, reduces redness, regulates oil secretion, and fades hyperpigmentation.",
      bg: "bg-brand-accent/5",
      text: "text-brand-accent"
    },
    {
      name: "Salicylic Acid",
      desc: "Gentle oil-soluble BHA that exfoliates skin pores, eliminates dead cells, and prevents active breakouts.",
      bg: "bg-brand-secondary/5",
      text: "text-brand-secondary"
    },
    {
      name: "Vitamin E",
      desc: "A potent lipophilic antioxidant that neutralizes free radicals, boosts skin elasticity, and retains moisture.",
      bg: "bg-brand-green/5",
      text: "text-brand-green"
    },
    {
      name: "Licorice Extract",
      desc: "Dermat-loved botanical lightener that inhibits melanin production, soothing irritations and brightening tone.",
      bg: "bg-brand-dark/5",
      text: "text-brand-dark"
    }
  ];

  if (loadingProducts) {
    return <div className="py-32 text-center text-brand-grey text-sm">Loading products...</div>;
  }

  return (
    <div className="pt-20 pb-12 overflow-x-hidden">
      {/* 1. Full-Screen Widescreen Hero Banner (Slideshow) */}
      <section className="w-full">
        <div className="relative w-full overflow-hidden h-[calc(100vh-5rem)] min-h-[500px] bg-brand-bg">
          {/* Active Banner Slide */}
          <Link
            to={heroSlides[activeSlide].link}
            className="block w-full h-full animate-fade-in"
            key={activeSlide}
          >
            <img
              src={heroSlides[activeSlide].image}
              alt={heroSlides[activeSlide].title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback placeholder showing title if graphic file is not yet generated
                e.target.src = `https://placehold.co/1200x500/FAF8F5/1C1B19?text=${encodeURIComponent(
                  heroSlides[activeSlide].title
                )}`;
              }}
            />
          </Link>

          {/* Dots Indicator Centered at the Bottom */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeSlide === idx ? "bg-brand-dark w-6" : "bg-brand-dark/20 hover:bg-brand-dark/50"
                  }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Left Arrow Navigation Button */}
          <button
            onClick={() => setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#e1e2d6] hover:bg-[#d4d6c7] active:scale-95 flex items-center justify-center text-brand-dark transition-all shadow-md z-30 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Right Arrow Navigation Button */}
          <button
            onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#e1e2d6] hover:bg-[#d4d6c7] active:scale-95 flex items-center justify-center text-brand-dark transition-all shadow-md z-30 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* 2. Trust Strip */}
      <ScrollReveal className="max-w-7xl mx-auto px-6 mt-8">
        <TrustBadgeStrip />
      </ScrollReveal>

      {/* 3. Shop by Product */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-brand-grey mb-2 block">
            OUR ESSENTIALS
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-brand-dark mb-4">
            {bannerText.title}
          </h2>
          <p className="text-xs md:text-sm text-brand-grey">
            {bannerText.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {productList.map((product) => (
            <ScrollReveal key={product.id}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 4. Why Luscent Glow */}
      <section className="bg-brand-card/40 py-20 px-6 border-y border-brand-card/50 mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] tracking-widest uppercase font-semibold text-brand-grey mb-2 block">
              THE LUSCENT STANDARD
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-brand-dark">
              Formulated for Daily Skin Defense
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-card/40 text-left">
              <span className="w-10 h-10 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-6 font-semibold">1</span>
              <h3 className="font-serif text-lg font-semibold text-brand-dark mb-3">Weightless, Non-Greasy Formula</h3>
              <p className="text-xs text-brand-grey leading-relaxed">
                Zero white cast. Zero stickiness. Engineered specifically for warm humid climates, absorbing instantly into a natural, velvety matte finish.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-card/40 text-left">
              <span className="w-10 h-10 rounded-full bg-brand-secondary/10 text-brand-secondary flex items-center justify-center mb-6 font-semibold">2</span>
              <h3 className="font-serif text-lg font-semibold text-brand-dark mb-3">Clinically-Backed Actives</h3>
              <p className="text-xs text-brand-grey leading-relaxed">
                We combine physical barriers like Zinc Oxide with dermat favorites like Niacinamide, Salicylic Acid, and Licorice to active treat skin as it protects.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-card/40 text-left">
              <span className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mb-6 font-semibold">3</span>
              <h3 className="font-serif text-lg font-semibold text-brand-dark mb-3">Proudly Made in Surat, Gujarat</h3>
              <p className="text-xs text-brand-grey leading-relaxed">
                Manufactured locally at Basilica Biotech in Surat under strict ISO-certified clinical standards. 100% clean, non-toxic, and transparent sourcing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Combo Banner (The Glow Duo) */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="bg-brand-dark text-white rounded-[32px] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center relative shadow-xl">
          {/* Subtle accent circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-accent/20 rounded-full filter blur-[80px]" />

          <div className="p-8 md:p-16 lg:col-span-7 space-y-6 text-left">
            <span className="inline-block px-3 py-1 bg-brand-accent rounded-full text-[10px] uppercase font-bold tracking-widest text-white shadow-sm">
              Featured Duo Combo — Save ₹{combo.savings}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-medium text-white leading-tight">
              The Glow Duo: Your Daily Cleansing & Protection Ritual
            </h2>
            <p className="text-xs md:text-sm text-brand-card/75 leading-relaxed max-w-xl">
              Cleanse skin gently, lift pollutants, and seal in robust Broad Spectrum protection. Features our full-sized Bright Skin Face Wash (100ml) + Ultra Light Sunscreen SPF 50+ (50ml) for a premium skincare routine.
            </p>

            <div className="flex flex-wrap gap-4 items-center pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">₹{combo.price}</span>
                <span className="text-xs text-white/50 line-through">₹{combo.originalPrice}</span>
              </div>
              <Link to="/product/combo">
                <Button variant="primary" className="bg-brand-accent hover:bg-[#c25a20] text-xs py-3.5 px-8 uppercase tracking-widest">
                  Get The Ritual <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 p-8 flex justify-center bg-brand-card/5 self-stretch items-center border-t lg:border-t-0 lg:border-l border-white/10">
            <div className="relative aspect-square w-72 max-h-72 bg-white/5 rounded-2xl flex items-center justify-center p-6">
              <img
                src={combo.images[0]}
                alt="The Glow Duo Combo Pack"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Ingredient Spotlight */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-brand-grey mb-2 block">
            INGREDIENT SCIENCE
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-brand-dark mb-4">
            Clinical Actives Meet Clean Botanicals
          </h2>
          <p className="text-xs md:text-sm text-brand-grey">
            No filler ingredients, no skin-damaging silicones. Every single compound has a specific clinical job to do.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activesList.map((act, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-brand-card/50 text-left hover:shadow-md transition-shadow duration-300">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider mb-4 ${act.bg} ${act.text}`}>
                {act.name}
              </span>
              <p className="text-xs text-brand-grey leading-relaxed">
                {act.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Our Story Teaser */}
      <section className="bg-[#F3EFE9]/40 py-20 px-6 border-y border-brand-card/30 mt-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-brand-grey block">
            ABOUT LUSCENT GLOW
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-brand-dark leading-snug">
            "Powerful Protection. Effective Gentle Care."
          </h2>
          <p className="text-sm md:text-base text-brand-grey max-w-2xl mx-auto leading-relaxed">
            Luscent Glow was born in Surat, Gujarat out of a simple need: a premium, dermatologist-friendly sunscreen that guards skin flawlessly without leaving a sticky residue or chalky white cast.
          </p>
          <div className="pt-4">
            <Link to="/our-story">
              <Button variant="outline" className="text-xs py-3 px-6 uppercase tracking-wider">
                Read Our Full Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-brand-grey mb-2 block">
            LOVED BY USERS
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-brand-dark">
            Real Reviews, Radiant Skin
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsList.slice(0, 3).map((item, index) => (
            <ScrollReveal key={item.id || index}>
              <TestimonialCard testimonial={item} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 9. FAQ Preview */}
      <section className="max-w-3xl mx-auto px-6 mt-24">
        <div className="text-center mb-12">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-brand-grey mb-2 block">
            HAVE QUESTIONS?
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-brand-dark mb-4">
            Common Inquiries
          </h2>
        </div>

        <FAQAccordion items={faqPreview} />

        <div className="text-center mt-8">
          <Link to="/faq" className="text-xs uppercase tracking-wider font-semibold text-brand-accent hover:underline flex items-center justify-center gap-1.5">
            View All FAQs <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
};
export default HomePage;
