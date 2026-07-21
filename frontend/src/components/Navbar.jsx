import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingBag, User, Menu, X, LogOut } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { CartDrawer } from "./CartDrawer";

export const Navbar = () => {
  const { cartCount } = useCart();
  const { isLoggedIn, logout, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? "bg-white border-b border-brand-card/30 shadow-sm py-4"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex flex-col text-left group">
            <h1 className="font-serif text-lg md:text-xl font-bold tracking-[0.2em] text-brand-dark m-0 leading-none group-hover:text-brand-accent transition-colors duration-300">
              LUSCENT
            </h1>
            <span className="text-[8px] tracking-[0.45em] uppercase font-sans font-semibold text-brand-grey mt-0.5 leading-none pl-[2px]">
              GLOW
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {location.pathname.startsWith("/admin") && !!sessionStorage.getItem("luscent_admin_token") ? (
              <>
                {["Overview", "Orders", "Products", "Users", "Coupons", "Integrations", "Content"].map((tab) => {
                  const tabLower = tab.toLowerCase();
                  const searchParams = new URLSearchParams(location.search);
                  const activeTab = searchParams.get("tab") || "overview";
                  const isActive = activeTab === tabLower;
                  
                  return (
                    <Link
                      key={tab}
                      to={`/admin?tab=${tabLower}`}
                      className={`text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                        isActive ? "text-brand-accent" : "text-brand-dark hover:text-brand-accent"
                      }`}
                    >
                      {tab}
                    </Link>
                  );
                })}
              </>
            ) : (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                      isActive ? "text-brand-accent" : "text-brand-dark hover:text-brand-accent"
                    }`
                  }
                >
                  Shop All
                </NavLink>
                <NavLink
                  to="/category/sunscreen"
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                      isActive ? "text-brand-accent" : "text-brand-dark hover:text-brand-accent"
                    }`
                  }
                >
                  Sunscreen
                </NavLink>
                <NavLink
                  to="/category/face-wash"
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                      isActive ? "text-brand-accent" : "text-brand-dark hover:text-brand-accent"
                    }`
                  }
                >
                  Face Wash
                </NavLink>
                <NavLink
                  to="/category/combo"
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                      isActive ? "text-brand-accent" : "text-brand-dark hover:text-brand-accent"
                    }`
                  }
                >
                  Combo
                </NavLink>

                <NavLink
                  to="/our-story"
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                      isActive ? "text-brand-accent" : "text-brand-dark hover:text-brand-accent"
                    }`
                  }
                >
                  Our Story
                </NavLink>
                <NavLink
                  to="/faq"
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                      isActive ? "text-brand-accent" : "text-brand-dark hover:text-brand-accent"
                    }`
                  }
                >
                  FAQ
                </NavLink>
              </>
            )}
          </nav>

          {/* Icons & Actions */}
          <div className="flex items-center gap-4">
            {!(location.pathname.startsWith("/admin") && !!sessionStorage.getItem("luscent_admin_token")) ? (
              <>
                {/* Account link */}
                {isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <Link to="/profile" className="hidden sm:flex items-center gap-1.5 hover:text-brand-accent transition">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey hover:text-brand-dark">
                        Hi, {user?.name?.split(" ")[0] || "User"}
                      </span>
                    </Link>
                    <Link
                      to="/profile"
                      className="p-2 hover:bg-brand-card/40 rounded-full text-brand-dark hover:text-brand-accent transition-colors"
                      title="My Profile"
                    >
                      <User size={18} />
                    </Link>
                    <button
                      onClick={logout}
                      className="p-2 hover:bg-brand-card/40 rounded-full text-brand-dark hover:text-[#c24b4b] transition-colors hidden sm:block"
                      title="Logout"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="p-2 hover:bg-brand-card/40 rounded-full text-brand-dark hover:text-brand-accent transition-colors"
                    title="Account Login"
                  >
                    <User size={18} />
                  </Link>
                )}

                {/* Cart Icon */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="p-2 hover:bg-brand-card/40 rounded-full text-brand-dark hover:text-brand-accent transition-colors relative"
                  title="View Cart"
                >
                  <ShoppingBag size={18} />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-brand-accent text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  sessionStorage.removeItem("luscent_admin_token");
                  window.location.reload();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-brand-dark/20 hover:border-brand-dark rounded-xl text-[10px] uppercase tracking-wider font-bold text-brand-dark hover:bg-brand-bg transition-all"
              >
                <LogOut size={12} /> Logout Admin
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-brand-card/40 rounded-full text-brand-dark hover:text-brand-accent transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-brand-card/30 absolute left-0 right-0 top-full shadow-lg py-6 px-6 animate-fade-in">
            <nav className="flex flex-col gap-4">
              {location.pathname.startsWith("/admin") && !!sessionStorage.getItem("luscent_admin_token") ? (
                <>
                  {["Overview", "Orders", "Products", "Users", "Coupons", "Integrations", "Content"].map((tab) => {
                    const tabLower = tab.toLowerCase();
                    const searchParams = new URLSearchParams(location.search);
                    const activeTab = searchParams.get("tab") || "overview";
                    const isActive = activeTab === tabLower;
                    
                    return (
                      <Link
                        key={tab}
                        to={`/admin?tab=${tabLower}`}
                        className={`text-xs uppercase tracking-wider font-semibold py-2 border-b border-brand-card/30 ${
                          isActive ? "text-brand-accent font-bold" : "text-brand-dark"
                        }`}
                      >
                        {tab}
                      </Link>
                    );
                  })}
                </>
              ) : (
                <>
                  <NavLink
                    to="/"
                    className="text-xs uppercase tracking-wider font-semibold text-brand-dark py-2 border-b border-brand-card/30"
                  >
                    Shop All
                  </NavLink>
                  <NavLink
                    to="/category/sunscreen"
                    className="text-xs uppercase tracking-wider font-semibold text-brand-dark py-2 border-b border-brand-card/30"
                  >
                    Sunscreen
                  </NavLink>
                  <NavLink
                    to="/category/face-wash"
                    className="text-xs uppercase tracking-wider font-semibold text-brand-dark py-2 border-b border-brand-card/30"
                  >
                    Face Wash
                  </NavLink>
                  <NavLink
                    to="/category/combo"
                    className="text-xs uppercase tracking-wider font-semibold text-brand-dark py-2 border-b border-brand-card/30"
                  >
                    Combo
                  </NavLink>
                  <NavLink
                    to="/our-story"
                    className="text-xs uppercase tracking-wider font-semibold text-brand-dark py-2 border-b border-brand-card/30"
                  >
                    Our Story
                  </NavLink>
                  <NavLink
                    to="/faq"
                    className="text-xs uppercase tracking-wider font-semibold text-brand-dark py-2 border-b border-brand-card/30"
                  >
                    FAQ
                  </NavLink>
                  <NavLink
                    to="/contact"
                    className="text-xs uppercase tracking-wider font-semibold text-brand-dark py-2 border-b border-brand-card/30"
                  >
                    Contact
                  </NavLink>
                </>
              )}
              {isLoggedIn ? (
                <div className="flex flex-col gap-2 py-2 mt-2 border-t border-brand-card/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey">
                      Logged in as {user?.name}
                    </span>
                    <button onClick={logout} className="text-xs font-semibold text-[#c24b4b]">
                      Logout
                    </button>
                  </div>
                  <NavLink
                    to="/profile"
                    className="text-xs uppercase tracking-wider font-semibold text-brand-dark py-2 text-center bg-brand-bg rounded-xl border border-brand-card flex items-center justify-center gap-1.5"
                  >
                    <User size={14} /> View My Profile
                  </NavLink>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="text-xs uppercase tracking-wider font-semibold text-brand-accent py-2 mt-2 text-center bg-brand-bg rounded-xl border border-brand-card"
                >
                  Login / Signup
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Cart Drawer Component */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
export default Navbar;
