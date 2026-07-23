import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Newsletter } from "./components/Newsletter";
import { CartToast } from "./components/CartToast";

// Pages
import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { AuthPage } from "./pages/AuthPage";
import { OurStoryPage } from "./pages/OurStoryPage";
import { FAQPage } from "./pages/FAQPage";
import { ContactPage } from "./pages/ContactPage";
import { AdminPage } from "./pages/AdminPage";
import { CategoryPage } from "./pages/CategoryPage";
import { TrackPage } from "./pages/TrackPage";
import { ProfilePage } from "./pages/ProfilePage";

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
      {/* Render Navbar globally */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-grow bg-[#FAF8F5]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/profile" element={<ProfilePage />} />
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
          <DataProvider>
            <ScrollToTop />
            <CartToast />
            <AppContent />
          </DataProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};
export default App;
