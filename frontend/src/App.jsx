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

// Sub-component to hold Router context
const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

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
