import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Newsletter } from "./components/Newsletter";
import { CartToast } from "./components/CartToast";

// Pages
import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ThankYouPage } from "./pages/ThankYouPage";
import { AuthPage } from "./pages/AuthPage";
import { OurStoryPage } from "./pages/OurStoryPage";
import { FAQPage } from "./pages/FAQPage";
import { ContactPage } from "./pages/ContactPage";
import { AdminPage } from "./pages/AdminPage";
import { CategoryPage } from "./pages/CategoryPage";
import { TrackPage } from "./pages/TrackPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PolicyPage } from "./pages/PolicyPage";

// Scroll to top on route change helper
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Route-based Meta Tags Map
const META_TAGS_MAP = {
  "/": {
    title: "Skincare Products for Glowing Skin | Luscent Glow",
    description: "Shop Luscent Glow skincare products designed for healthy, glowing skin. Explore sunscreen, face wash and skincare combos for your daily routine."
  },
  "/product/sunscreen": {
    title: "Sunscreen for Daily Skin Protection | Luscent Glow",
    description: "Shop Luscent Glow sunscreen for daily skin protection. Enjoy lightweight, comfortable skincare designed to help keep your skin protected and glowing."
  },
  "/category/sunscreen": {
    title: "Sunscreen for Daily Skin Protection | Luscent Glow",
    description: "Shop Luscent Glow sunscreen for daily skin protection. Enjoy lightweight, comfortable skincare designed to help keep your skin protected and glowing."
  },
  "/product/face-wash": {
    title: "Face Wash for Clean & Healthy Skin | Luscent Glow",
    description: "Discover Luscent Glow face wash for gentle daily cleansing. Remove dirt and impurities while keeping your skin feeling fresh, clean and healthy."
  },
  "/category/face-wash": {
    title: "Face Wash for Clean & Healthy Skin | Luscent Glow",
    description: "Discover Luscent Glow face wash for gentle daily cleansing. Remove dirt and impurities while keeping your skin feeling fresh, clean and healthy."
  },
  "/product/combo": {
    title: "Skincare Combo for Glowing Skin | Luscent Glow",
    description: "Get your daily skincare essentials together with the Luscent Glow skincare combo. Cleanse, protect and care for your skin with an easy daily routine."
  },
  "/category/combo": {
    title: "Skincare Combo for Glowing Skin | Luscent Glow",
    description: "Get your daily skincare essentials together with the Luscent Glow skincare combo. Cleanse, protect and care for your skin with an easy daily routine."
  },
  "/our-story": {
    title: "Our Story | Luscent Glow Skincare",
    description: "Discover the story behind Luscent Glow and our approach to skincare. Learn how we're creating simple skincare products for healthy, radiant-looking skin."
  },
  "/faq": {
    title: "Skincare FAQs & Product Questions | Luscent Glow",
    description: "Find answers to frequently asked questions about Luscent Glow skincare products, usage, orders, shipping and your daily skincare routine."
  },
  "/contact": {
    title: "Contact Luscent Glow | Skincare Support",
    description: "Have questions about Luscent Glow skincare products or your order? Contact our team for product, order and customer support."
  }
};

// Sub-component to hold Router context
const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  // Dynamic Meta Tags updater on route change
  useEffect(() => {
    const meta = META_TAGS_MAP[location.pathname] || META_TAGS_MAP["/"];

    if (meta.title) {
      document.title = meta.title;

      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", meta.title);

      let twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute("content", meta.title);
    }

    if (meta.description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", meta.description);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", meta.description);

      let twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute("content", meta.description);
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Render Navbar globally, except on Admin pages where we have a custom sidebar */}
      {!isAdminPath && <Navbar />}

      {/* Main Page Content */}
      <main className={`flex-grow bg-[#FAF8F5] ${!isAdminPath ? 'pt-10' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/policies/:policyId" element={<PolicyPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Hide Newsletter and Footer on Admin pages */}
      {!isAdminPath && <Newsletter />}
      {!isAdminPath && <Footer />}
    </div>
  );
};

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <CartToast />
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};
export default App;
