import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, ShoppingBag, Users, Plus, Edit2, Trash2, CheckCircle, Clock, 
  TrendingUp, IndianRupee, ShieldAlert, ArrowRight, X, ChevronRight, Lock, User, Upload, Eye, EyeOff, RotateCcw
} from "lucide-react";
import { API_URL } from "../config";
import { Button } from "../components/Button";
import { useSearchParams } from "react-router-dom";
import { OurStoryPage } from "./OurStoryPage";

export const AdminPage = () => {
  // Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem("luscent_admin_token");
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Dashboard Tab state
  // Dashboard Tab state from URL search params
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const setActiveTab = (tabVal) => {
    setSearchParams({ tab: tabVal });
  };
  const [stats, setStats] = useState({ users: 0, deleted_users: 0, products: 0, orders: 0, deleted_orders: 0, revenue: 0 });
  const [orders, setOrders] = useState([]);
  const [showDeletedOrders, setShowDeletedOrders] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [couponsList, setCouponsList] = useState([]);

  // Coupon Dialog State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Coupon fields
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState("percent");
  const [couponValue, setCouponValue] = useState("");
  const [couponMinPurchase, setCouponMinPurchase] = useState("");
  const [couponBuyQty, setCouponBuyQty] = useState("");
  const [couponGetQty, setCouponGetQty] = useState("");
  const [couponTargetProduct, setCouponTargetProduct] = useState("");
  const [couponDescription, setCouponDescription] = useState("");
  const [couponIsActive, setCouponIsActive] = useState(true);

  // Settings / Integrations fields
  const [cashfreeAppId, setCashfreeAppId] = useState("");
  const [cashfreeSecretKey, setCashfreeSecretKey] = useState("");
  const [cashfreeEnv, setCashfreeEnv] = useState("sandbox");
  const [showCashfreeSecret, setShowCashfreeSecret] = useState(false);
  const [delhiveryApiToken, setDelhiveryApiToken] = useState("");
  const [showDelhiveryToken, setShowDelhiveryToken] = useState(false);
  const [delhiveryEnv, setDelhiveryEnv] = useState("sandbox");
  const [delhiveryWarehouse, setDelhiveryWarehouse] = useState("Luscentglow Warehouse");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");

  // CMS Content Blocks
  const [contentBlocks, setContentBlocks] = useState({});
  const [contentSaving, setContentSaving] = useState(false);
  const [contentMessage, setContentMessage] = useState("");
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgCacheBust, setImgCacheBust] = useState(Date.now());

  // Product Form Dialog State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Product Form fields
  const [prodId, setProdId] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOriginalPrice, setProdOriginalPrice] = useState("");
  const [prodNetVolume, setProdNetVolume] = useState("");
  const [prodSubtitle, setProdSubtitle] = useState("");
  const [prodBadge, setProdBadge] = useState("");
  const [prodTheme, setProdTheme] = useState("brand-accent");
  const [prodCategory, setProdCategory] = useState("sunscreen");
  const [prodActives, setProdActives] = useState("");
  const [prodBenefits, setProdBenefits] = useState("");
  const [prodHowToUse, setProdHowToUse] = useState("");
  const [prodIngredients, setProdIngredients] = useState("");
  const [prodTags, setProdTags] = useState("");
  const [prodImages, setProdImages] = useState([]);

  const fetchAuth = async (url, options = {}) => {
    const token = sessionStorage.getItem("luscent_admin_token");
    const headers = {
      ...options.headers,
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem("luscent_admin_token");
      setIsAuthenticated(false);
    }
    return res;
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setSubmittingLogin(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem("luscent_admin_token", data.token);
        setIsAuthenticated(true);
      } else {
        const data = await res.json();
        setLoginError(data.detail || "Invalid credentials");
      }
    } catch (err) {
      setLoginError("Failed to communicate with authentication server.");
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("luscent_admin_token");
    setIsAuthenticated(false);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    setImgCacheBust(Date.now());
    try {
      let backendStats = { users: 0, products: 0, orders: 0, revenue: 0 };
      let apiOrders = [];
      let apiProducts = [];
      let apiUsers = [];

      // Stats
      const statsRes = await fetchAuth(`${API_URL}/api/admin/stats`);
      if (statsRes.ok) {
        backendStats = await statsRes.json();
      }

      // Orders
      const ordersRes = await fetchAuth(`${API_URL}/api/admin/orders`);
      if (ordersRes.ok) {
        apiOrders = await ordersRes.json();
      }

      // Products
      const prodRes = await fetch(`${API_URL}/api/products`);
      if (prodRes.ok) {
        apiProducts = await prodRes.json();
        setProductsList(apiProducts);
      }

      // Users
      const usersRes = await fetchAuth(`${API_URL}/api/admin/users`);
      if (usersRes.ok) {
        apiUsers = await usersRes.json();
        setUsersList(apiUsers);
      }

      // Load local test orders from localStorage as well
      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem("luscent_orders") || "[]");
      } catch (e) {
        console.error("Error parsing local test orders:", e);
      }

      // Combine API orders and local orders (deduplicating by order_number)
      const orderMap = new Map();
      apiOrders.forEach(ord => {
        if (ord.order_number) orderMap.set(ord.order_number, ord);
      });
      localOrders.forEach(ord => {
        if (ord.order_number && !orderMap.has(ord.order_number)) {
          orderMap.set(ord.order_number, ord);
        }
      });

      const mergedOrders = Array.from(orderMap.values());
      mergedOrders.sort((a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now()));
      setOrders(mergedOrders);

      // Compute dynamic revenue and order metrics
      const totalRevenue = mergedOrders.reduce((sum, ord) => sum + (Number(ord.totalPrice) || 0), 0);
      const uniqueUserEmails = new Set([
        ...apiUsers.map(u => u.email?.toLowerCase()).filter(Boolean),
        ...mergedOrders.map(o => (o.user_id || o.email)?.toLowerCase()).filter(Boolean)
      ]);
      const activeUsersCount = Math.max(apiUsers.length, backendStats.users || 0, uniqueUserEmails.size);

      setStats({
        revenue: totalRevenue,
        orders: mergedOrders.length,
        users: activeUsersCount,
        products: apiProducts.length || backendStats.products || 0
      });

      // Coupons
      const couponsRes = await fetchAuth(`${API_URL}/api/admin/coupons`);
      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCouponsList(couponsData);
      }

      // Settings / Integrations
      const settingsRes = await fetchAuth(`${API_URL}/api/admin/settings`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setCashfreeAppId(settingsData.cashfree_app_id || "");
        setCashfreeSecretKey(settingsData.cashfree_secret_key || "");
        setCashfreeEnv(settingsData.cashfree_env || "sandbox");
        setDelhiveryApiToken(settingsData.delhivery_api_token || "");
        setDelhiveryEnv(settingsData.delhivery_env || "sandbox");
        setDelhiveryWarehouse(settingsData.delhivery_warehouse || "Luscentglow Warehouse");
      }

      // CMS Content Blocks
      const contentRes = await fetch(`${API_URL}/api/content`);
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setContentBlocks(contentData || {});
      }
    } catch (err) {
      setError("Failed to communicate with FastAPI backend server. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => (o.id || o._id) === orderId ? { ...o, status: newStatus } : o));
        fetchDashboardData(); // Refresh to get Delhivery AWB tracking number
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Error updating order status");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  const handleSoftDeleteOrder = async (orderId) => {
    if (!window.confirm("Move this order to trash?")) return;
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/orders/${orderId}/soft-delete`, { method: "PUT" });
      if (res.ok) fetchDashboardData();
    } catch (err) { alert("Error deleting order"); }
  };
  
  const handleRestoreOrder = async (orderId) => {
    if (!window.confirm("Restore this order?")) return;
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/orders/${orderId}/restore`, { method: "PUT" });
      if (res.ok) fetchDashboardData();
    } catch (err) { alert("Error restoring order"); }
  };
  
  const handleHardDeleteOrder = async (orderId) => {
    if (!window.confirm("Permanently delete this order? This cannot be undone!")) return;
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) fetchDashboardData();
    } catch (err) { alert("Error deleting order"); }
  };
  
  const handleSoftDeleteUser = async (userId) => {
    if (!window.confirm("Move this user to trash?")) return;
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/users/${userId}/soft-delete`, { method: "PUT" });
      if (res.ok) fetchDashboardData();
    } catch (err) { alert("Error deleting user"); }
  };
  
  const handleRestoreUser = async (userId) => {
    if (!window.confirm("Restore this user?")) return;
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/users/${userId}/restore`, { method: "PUT" });
      if (res.ok) fetchDashboardData();
    } catch (err) { alert("Error restoring user"); }
  };
  
  const handleHardDeleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user? This cannot be undone!")) return;
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) fetchDashboardData();
    } catch (err) { alert("Error deleting user"); }
  };

  const handleEditProductClick = (p) => {
    setEditingProduct(p);
    setProdId(p.id);
    setProdSlug(p.slug);
    setProdName(p.name);
    setProdPrice(p.price);
    setProdOriginalPrice(p.originalPrice || "");
    setProdNetVolume(p.netVolume);
    setProdSubtitle(p.subtitle);
    setProdBadge(p.badge || "");
    setProdTheme(p.themeColor || "brand-accent");
    setProdCategory(p.category || "sunscreen");
    setProdActives(p.keyActives.join(", "));
    setProdBenefits(p.benefits.join(", "));
    setProdHowToUse(p.howToUse.join(", "));
    setProdIngredients(p.ingredients);
    setProdTags(p.tags.join(", "));
    setProdImages(p.images || []);
    setShowProductModal(true);
  };

  const handleAddNewProductClick = () => {
    setEditingProduct(null);
    setProdId("");
    setProdSlug("");
    setProdName("");
    setProdPrice("");
    setProdOriginalPrice("");
    setProdNetVolume("");
    setProdSubtitle("");
    setProdBadge("");
    setProdTheme("brand-accent");
    setProdCategory("sunscreen");
    setProdActives("");
    setProdBenefits("");
    setProdHowToUse("");
    setProdIngredients("");
    setProdTags("");
    setProdImages([]);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (pId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/products/${pId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setProductsList(prev => prev.filter(p => p.id !== pId));
        fetchDashboardData();
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      alert("Error deleting product");
    }
  };

  const handleEditCouponClick = (c) => {
    setEditingCoupon(c);
    setCouponCode(c.code);
    setCouponType(c.discount_type);
    setCouponValue(c.value);
    setCouponMinPurchase(c.min_purchase || "");
    setCouponBuyQty(c.buy_qty || "");
    setCouponGetQty(c.get_qty || "");
    setCouponTargetProduct(c.target_product_id || "");
    setCouponDescription(c.description);
    setCouponIsActive(c.is_active);
    setShowCouponModal(true);
  };

  const handleAddNewCouponClick = () => {
    setEditingCoupon(null);
    setCouponCode("");
    setCouponType("percent");
    setCouponValue("");
    setCouponMinPurchase("");
    setCouponBuyQty("");
    setCouponGetQty("");
    setCouponTargetProduct("");
    setCouponDescription("");
    setCouponIsActive(true);
    setShowCouponModal(true);
  };

  const handleDeleteCoupon = async (code) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/coupons/${code}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        alert("Failed to delete coupon");
      }
    } catch (err) {
      alert("Error deleting coupon");
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    const couponPayload = {
      code: couponCode.toUpperCase(),
      discount_type: couponType,
      value: parseFloat(couponValue),
      min_purchase: couponMinPurchase ? parseFloat(couponMinPurchase) : 0.0,
      buy_qty: couponBuyQty ? parseInt(couponBuyQty) : 0,
      get_qty: couponGetQty ? parseInt(couponGetQty) : 0,
      target_product_id: couponTargetProduct || null,
      description: couponDescription,
      is_active: couponIsActive
    };

    try {
      let res;
      if (editingCoupon) {
        res = await fetchAuth(`${API_URL}/api/admin/coupons/${editingCoupon.code}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(couponPayload)
        });
      } else {
        res = await fetchAuth(`${API_URL}/api/admin/coupons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(couponPayload)
        });
      }

      if (res.ok) {
        setShowCouponModal(false);
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to save coupon");
      }
    } catch (err) {
      alert("Error saving coupon");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage("");
    const payload = {
      cashfree_app_id: cashfreeAppId,
      cashfree_secret_key: cashfreeSecretKey,
      cashfree_env: cashfreeEnv,
      delhivery_api_token: delhiveryApiToken,
      delhivery_env: delhiveryEnv,
      delhivery_warehouse: delhiveryWarehouse
    };

    try {
      const res = await fetchAuth(`${API_URL}/api/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSettingsMessage("Integrations configuration saved successfully!");
      } else {
        setSettingsMessage("Failed to save integrations settings.");
      }
    } catch (err) {
      setSettingsMessage("Error connecting to backend settings API.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const productPayload = {
      id: prodId,
      slug: prodSlug,
      name: prodName,
      price: parseFloat(prodPrice),
      rating: editingProduct ? editingProduct.rating : 5.0,
      originalPrice: prodOriginalPrice ? parseFloat(prodOriginalPrice) : null,
      savings: (prodOriginalPrice && prodPrice) ? (parseFloat(prodOriginalPrice) - parseFloat(prodPrice)) : null,
      netVolume: prodNetVolume,
      subtitle: prodSubtitle,
      badge: prodBadge || null,
      category: prodCategory,
      themeColor: prodTheme,
      keyActives: prodActives.split(",").map(s => s.trim()).filter(Boolean),
      benefits: prodBenefits.split(",").map(s => s.trim()).filter(Boolean),
      howToUse: prodHowToUse.split(",").map(s => s.trim()).filter(Boolean),
      ingredients: prodIngredients,
      tags: prodTags.split(",").map(s => s.trim()).filter(Boolean),
      images: prodImages.length > 0 ? prodImages : [
        `/images/${prodId}.png`,
        `/images/${prodId}_back.png`
      ]
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetchAuth(`${API_URL}/api/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload)
        });
      } else {
        res = await fetchAuth(`${API_URL}/api/admin/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload)
        });
      }

      if (res.ok) {
        setShowProductModal(false);
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to save product");
      }
    } catch (err) {
      alert("Error saving product");
    }
  };

  // Render Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden text-left">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-brand-secondary/5 rounded-full filter blur-[80px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-xl border border-brand-card/45 p-8 md:p-10 space-y-6 relative z-10"
        >
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[9px] tracking-widest uppercase font-bold text-brand-dark bg-brand-card/50 px-3.5 py-1 rounded-full">
              System Gateway
            </span>
            <h2 className="font-serif text-2xl font-semibold text-brand-dark">Admin Portal</h2>
            <p className="text-xs text-brand-grey">Please authenticate to access controls.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <ShieldAlert size={15} className="flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-brand-dark block mb-1">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey/60">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-brand-dark block mb-1">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey/60">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3 bg-white border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-grey/60 hover:text-brand-dark transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submittingLogin}
              className="w-full py-3.5 mt-6 text-xs uppercase tracking-widest bg-brand-dark text-white hover:bg-black font-semibold transition-all duration-300 shadow-sm"
            >
              {submittingLogin ? "Verifying..." : "Unlock Dashboard"}
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-10 min-h-screen text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-card/30 pb-6">
        <div>
          <span className="text-[10px] tracking-widest uppercase font-bold text-brand-accent block">
            Control Center
          </span>
          <h1 className="font-serif text-3xl font-medium text-brand-dark mt-1">Admin Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleAdminLogout} className="text-xs py-2 px-4 border border-red-200 text-red-650 hover:bg-red-50 transition">
            Logout
          </Button>
          <Button variant="outline" onClick={fetchDashboardData} className="text-xs py-2 px-4 border border-brand-dark/20 hover:bg-brand-bg transition">
            Refresh Data
          </Button>
          <Button variant="primary" onClick={handleAddNewProductClick} className="text-xs py-2 px-4 bg-brand-dark text-white hover:bg-black flex items-center gap-1.5 shadow-sm">
            <Plus size={14} /> Add Product
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs flex items-center gap-3">
          <ShieldAlert size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-brand-grey text-sm">Loading admin dashboard statistics...</div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-brand-card/40 rounded-2xl p-6 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center flex-shrink-0">
                <IndianRupee size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-grey">Total Revenue</span>
                <h3 className="font-serif text-xl font-semibold text-brand-dark mt-0.5">
                  ₹{(Number(stats.revenue) || 0).toLocaleString("en-IN")}
                </h3>
              </div>
            </div>

            <div className="bg-white border border-brand-card/40 rounded-2xl p-6 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-grey">Total Orders</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="font-serif text-xl font-semibold text-brand-dark">{stats.orders} <span className="text-xs font-sans text-brand-grey font-normal">Active</span></h3>
                  <span className="text-xs text-red-400 font-medium">| {stats.deleted_orders || 0} Deleted</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-brand-card/40 rounded-2xl p-6 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center flex-shrink-0">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-grey">Total Users</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="font-serif text-xl font-semibold text-brand-dark">{stats.users} <span className="text-xs font-sans text-brand-grey font-normal">Active</span></h3>
                  <span className="text-xs text-red-400 font-medium">| {stats.deleted_users || 0} Deleted</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-brand-card/40 rounded-2xl p-6 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-brand-dark/10 text-brand-dark flex items-center justify-center flex-shrink-0">
                <BarChart3 size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-grey">Products</span>
                <h3 className="font-serif text-xl font-semibold text-brand-dark mt-0.5">{stats.products}</h3>
              </div>
            </div>
          </div>

          <div className="pt-6"></div>

          {/* Tab Panes */}
          <div className="bg-white border border-brand-card/40 rounded-3xl p-6 shadow-sm min-h-[400px]">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg font-semibold text-brand-dark">Latest Orders</h3>
                {orders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-brand-grey">No orders placed yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-card/40 text-brand-grey">
                          <th className="py-3 px-4">Order No</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Method</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(o => (
                          <tr key={(o.id || o._id)} className="border-b border-brand-bg hover:bg-brand-bg/30">
                            <td className="py-3.5 px-4 font-bold">{o.order_number}</td>
                            <td className="py-3.5 px-4 text-brand-grey">{new Date(o.created_at).toLocaleDateString()}</td>
                            <td className="py-3.5 px-4">{o.name}</td>
                            <td className="py-3.5 px-4 uppercase tracking-wider text-[10px] text-brand-grey">{o.paymentMethod}</td>
                            <td className="py-3.5 px-4 font-semibold">₹{o.totalPrice}</td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold ${
                                o.status === "delivered" ? "bg-brand-green/10 text-brand-green" : "bg-brand-accent/10 text-brand-accent"
                              }`}>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (() => {
              const filteredOrders = orders.filter(o => showDeletedOrders ? o.is_deleted : !o.is_deleted);
              return (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-lg font-semibold text-brand-dark">
                    {showDeletedOrders ? "Deleted Customer Orders" : "Active Customer Orders"}
                  </h3>
                  <button onClick={() => setShowDeletedOrders(!showDeletedOrders)} className="text-xs font-semibold text-brand-accent hover:underline focus:outline-none">
                    {showDeletedOrders ? "Show Active Orders" : "Show Deleted Orders"}
                  </button>
                </div>
                {filteredOrders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-brand-grey">No orders found in this view.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-card/40 text-brand-grey">
                          <th className="py-3 px-4">Order No</th>
                          <th className="py-3 px-4">Customer Details</th>
                          <th className="py-3 px-4">Delivery Address</th>
                          <th className="py-3 px-4">Items Ordered</th>
                          <th className="py-3 px-4">Total</th>
                          <th className="py-3 px-4">Action Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map(o => (
                          <tr key={(o.id || o._id)} className="border-b border-brand-bg hover:bg-brand-bg/30">
                            <td className="py-4 px-4 font-bold align-top">
                              {o.order_number}
                              <span className="block text-[10px] font-normal text-brand-grey mt-0.5">
                                {o.created_at ? new Date(o.created_at).toLocaleDateString() : "Recently"}
                              </span>
                              {o.tracking_number && (
                                <span className="inline-block mt-1 font-mono text-[9px] text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded">
                                  {o.carrier || "Delhivery"}: {o.tracking_number}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 align-top">
                              <span className="font-semibold">{o.name}</span>
                              <span className="block text-brand-grey mt-0.5">{o.phone}</span>
                            </td>
                            <td className="py-4 px-4 align-top text-brand-grey max-w-xs truncate">
                              {o.address}, {o.city}, {o.state} - {o.pincode}
                            </td>
                            <td className="py-4 px-4 align-top">
                              <div className="space-y-1">
                                {o.items.map((item, idx) => (
                                  <div key={idx} className="text-brand-dark">
                                    {item.name} <span className="text-brand-grey">(x{item.quantity})</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-4 align-top font-semibold">₹{o.totalPrice}</td>
                            <td className="py-4 px-4 align-top">
                              <div className="flex items-center space-x-2">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleUpdateOrderStatus((o.id || o._id), e.target.value)}
                                  className="bg-brand-bg border border-brand-card/60 rounded-lg p-1 text-[11px] font-semibold text-brand-dark focus:outline-none focus:border-brand-dark"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                {showDeletedOrders ? (
                                  <div className="flex space-x-2">
                                    <button onClick={() => handleRestoreOrder((o.id || o._id))} title="Restore Order" className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors">
                                      <RotateCcw size={16} />
                                    </button>
                                    <button onClick={() => handleHardDeleteOrder((o.id || o._id))} title="Permanently Delete Order" className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  o.status === "pending" && (
                                    <button onClick={() => handleSoftDeleteOrder((o.id || o._id))} title="Move to Trash" className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                      <Trash2 size={16} />
                                    </button>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
            })()}

            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-semibold text-brand-dark">Store Catalog</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {productsList.map(p => (
                    <div key={p.id} className="border border-brand-card/40 rounded-2xl p-4 flex gap-4 bg-brand-bg/10 hover:border-brand-card transition shadow-sm">
                      <div className="w-16 h-16 rounded-xl bg-white overflow-hidden border border-brand-card/30 flex-shrink-0">
                        <img src={p.images?.[0] ? `${p.images[0]}?v=${imgCacheBust}` : `/images/sunscreen.png?v=${imgCacheBust}`} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="font-serif text-sm font-semibold text-brand-dark truncate">{p.name}</h4>
                        <p className="text-[10px] text-brand-grey uppercase tracking-wider font-semibold mt-0.5">{p.netVolume}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-bold text-brand-dark">₹{p.price}</span>
                          {p.originalPrice && <span className="text-[10px] text-brand-grey line-through">₹{p.originalPrice}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 justify-center">
                        <button onClick={() => handleEditProductClick(p)} className="p-2 rounded-lg bg-white border border-brand-card/40 hover:bg-brand-dark hover:text-white text-brand-grey transition shadow-sm">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition shadow-sm">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "users" && (() => {
              const filteredUsers = usersList.filter(u => showDeletedUsers ? u.is_deleted : !u.is_deleted);
              return (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-lg font-semibold text-brand-dark">
                    {showDeletedUsers ? "Deleted Accounts" : "Active Registered Accounts"}
                  </h3>
                  <button onClick={() => setShowDeletedUsers(!showDeletedUsers)} className="text-xs font-semibold text-brand-accent hover:underline focus:outline-none">
                    {showDeletedUsers ? "Show Active Users" : "Show Deleted Users"}
                  </button>
                </div>
                {filteredUsers.length === 0 ? (
                  <div className="py-12 text-center text-xs text-brand-grey">No users found in this view.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-card/40 text-brand-grey">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Joined Date</th>
                          <th className="py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={(u.id || u._id) || u.email} className="border-b border-brand-bg hover:bg-brand-bg/30">
                            <td className="py-3 px-4 font-semibold">{u.name}</td>
                            <td className="py-3 px-4 text-brand-grey">{u.email}</td>
                            <td className="py-3 px-4 text-brand-grey">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}</td>
                            <td className="py-3 px-4">
                              {showDeletedUsers ? (
                                <div className="flex space-x-2">
                                  <button onClick={() => handleRestoreUser((u.id || u._id))} title="Restore User" className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors">
                                    <RotateCcw size={16} />
                                  </button>
                                  <button onClick={() => handleHardDeleteUser((u.id || u._id))} title="Permanently Delete User" className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => handleSoftDeleteUser((u.id || u._id))} title="Move to Trash" className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
            })()}

            {activeTab === "coupons" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-lg font-semibold text-brand-dark">Active Coupon Codes</h3>
                  <Button onClick={handleAddNewCouponClick} className="py-2 px-4 bg-brand-dark text-white text-[10px] uppercase font-bold tracking-wider hover:bg-black rounded-xl">
                    Create Coupon
                  </Button>
                </div>
                {couponsList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-brand-grey">No coupons created yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-card/40 text-brand-grey">
                          <th className="py-3 px-4">Code</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Value</th>
                          <th className="py-3 px-4">Min Spend</th>
                          <th className="py-3 px-4">Details</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {couponsList.map(c => (
                          <tr key={c.code} className="border-b border-brand-bg hover:bg-brand-bg/30">
                            <td className="py-3.5 px-4 font-bold tracking-wider text-brand-accent">{c.code}</td>
                            <td className="py-3.5 px-4 uppercase text-[10px] text-brand-grey">{c.discount_type}</td>
                            <td className="py-3.5 px-4 font-semibold">
                              {c.discount_type === "percent" ? `${c.value}%` : `₹${c.value}`}
                            </td>
                            <td className="py-3.5 px-4 text-brand-grey">₹{c.min_purchase}</td>
                            <td className="py-3.5 px-4 text-brand-grey max-w-[200px] truncate">{c.description}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                c.is_active ? "bg-brand-green/10 text-brand-green" : "bg-brand-grey/10 text-brand-grey"
                              }`}>
                                {c.is_active ? "Active" : "Disabled"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleEditCouponClick(c)} className="p-1.5 text-brand-grey hover:text-brand-dark rounded hover:bg-brand-bg transition">
                                  <Edit2 size={13} />
                                </button>
                                <button onClick={() => handleDeleteCoupon(c.code)} className="p-1.5 text-brand-grey hover:text-[#c24b4b] rounded hover:bg-brand-bg transition">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-6 text-left max-w-2xl">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-brand-dark">API Integrations Settings</h3>
                  <p className="text-xs text-brand-grey mt-1">Configure your third-party payment gateways and shipping carrier credentials below.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Cashfree Segment */}
                  <div className="p-5 bg-brand-bg/50 border border-brand-card/45 rounded-2xl space-y-4">
                    <h4 className="font-serif text-sm font-semibold text-brand-dark border-b border-brand-card/30 pb-2">Cashfree Payment Gateway</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold block mb-1 text-xs text-brand-dark">Cashfree App ID (Client ID)</label>
                        <input
                          type="text"
                          value={cashfreeAppId}
                          onChange={(e) => setCashfreeAppId(e.target.value)}
                          placeholder="e.g. TEST103130..."
                          className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1 text-xs text-brand-dark">Cashfree Environment Mode</label>
                        <select
                          value={cashfreeEnv}
                          onChange={(e) => setCashfreeEnv(e.target.value)}
                          className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                        >
                          <option value="sandbox">Sandbox (Testing)</option>
                          <option value="production">Production (Live)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-xs text-brand-dark">Cashfree Secret Key</label>
                      <div className="relative">
                        <input
                          type={showCashfreeSecret ? "text" : "password"}
                          value={cashfreeSecretKey}
                          onChange={(e) => setCashfreeSecretKey(e.target.value)}
                          placeholder="••••••••••••••••••••••••••••••••"
                          className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs pr-16"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCashfreeSecret(!showCashfreeSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-brand-grey hover:text-brand-dark"
                        >
                          {showCashfreeSecret ? "Hide" : "View"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delhivery Segment */}
                  <div className="p-5 bg-brand-bg/50 border border-brand-card/45 rounded-2xl space-y-4">
                    <h4 className="font-serif text-sm font-semibold text-brand-dark border-b border-brand-card/30 pb-2">Delhivery Logistics Shipping</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold block mb-1 text-xs text-brand-dark">Delhivery API Token</label>
                        <div className="relative">
                          <input
                            type={showDelhiveryToken ? "text" : "password"}
                            value={delhiveryApiToken}
                            onChange={(e) => setDelhiveryApiToken(e.target.value)}
                            placeholder="••••••••••••••••••••••••"
                            className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs pr-16"
                          />
                          <button
                            type="button"
                            onClick={() => setShowDelhiveryToken(!showDelhiveryToken)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-brand-grey hover:text-brand-dark"
                          >
                            {showDelhiveryToken ? "Hide" : "View"}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="font-semibold block mb-1 text-xs text-brand-dark">Delhivery API Mode</label>
                        <select
                          value={delhiveryEnv}
                          onChange={(e) => setDelhiveryEnv(e.target.value)}
                          className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                        >
                          <option value="sandbox">Sandbox (Staging)</option>
                          <option value="production">Production (Live)</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="font-semibold block mb-1 text-xs text-brand-dark">Delhivery Warehouse Name</label>
                        <input
                          type="text"
                          value={delhiveryWarehouse}
                          onChange={(e) => setDelhiveryWarehouse(e.target.value)}
                          placeholder="e.g. Luscentglow Warehouse"
                          className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                        />
                        <p className="text-[10px] text-brand-grey mt-1">Must exactly match the pickup location name registered in your Delhivery account.</p>
                      </div>
                    </div>
                  </div>

                  {settingsMessage && (
                    <div className={`p-3 text-xs font-semibold rounded-xl ${
                      settingsMessage.includes("success") ? "bg-brand-green/10 text-brand-green" : "bg-[#c24b4b]/10 text-[#c24b4b]"
                    }`}>
                      {settingsMessage}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={savingSettings}
                      className="py-3 px-8 bg-brand-dark text-white hover:bg-black font-bold text-xs uppercase tracking-wider shadow-sm rounded-xl"
                    >
                      {savingSettings ? "Saving Settings..." : "Save Credentials"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "content" && (
              <ContentManagerTab
                contentBlocks={contentBlocks}
                setContentBlocks={setContentBlocks}
                contentSaving={contentSaving}
                setContentSaving={setContentSaving}
                contentMessage={contentMessage}
                setContentMessage={setContentMessage}
                API_URL={API_URL}
                fetchAuth={fetchAuth}
              />
            )}
          </div>
        </>
      )}

      {/* Edit/Add Product dialog modal */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] border border-brand-card/40 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-brand-card/40 p-6 md:p-8 pb-4 flex-shrink-0">
                <h3 className="font-serif text-xl font-semibold text-brand-dark">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <button onClick={() => setShowProductModal(false)} className="text-brand-grey hover:text-brand-dark p-1 rounded-full hover:bg-brand-bg transition">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-4 space-y-6 flex flex-col">
                <div className="flex-grow space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1">Product ID (Unique String)</label>
                    <input
                      type="text"
                      disabled={!!editingProduct}
                      value={prodId}
                      onChange={(e) => setProdId(e.target.value)}
                      placeholder="e.g. face-wash"
                      required
                      className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Slug URL</label>
                    <input
                      type="text"
                      value={prodSlug}
                      onChange={(e) => setProdSlug(e.target.value)}
                      placeholder="e.g. face-wash"
                      required
                      className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Name</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Bright Skin Face Wash"
                    required
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold block mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="395"
                      required
                      className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      value={prodOriginalPrice}
                      onChange={(e) => setProdOriginalPrice(e.target.value)}
                      placeholder="e.g. 450"
                      className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Net Volume</label>
                    <input
                      type="text"
                      value={prodNetVolume}
                      onChange={(e) => setProdNetVolume(e.target.value)}
                      placeholder="100 mL"
                      required
                      className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold block mb-1">Badge</label>
                    <input
                      type="text"
                      value={prodBadge}
                      onChange={(e) => setProdBadge(e.target.value)}
                      placeholder="e.g. Bestseller"
                      className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Category</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                    >
                      <option value="sunscreen">Sunscreen</option>
                      <option value="face-wash">Face Wash</option>
                      <option value="combo">Combo</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Theme Color</label>
                    <select
                      value={prodTheme}
                      onChange={(e) => setProdTheme(e.target.value)}
                      className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                    >
                      <option value="brand-accent">burnt-orange (Accent)</option>
                      <option value="brand-secondary">navy-blue (Secondary)</option>
                      <option value="brand-dark">charcoal (Dark)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={prodSubtitle}
                    onChange={(e) => setProdSubtitle(e.target.value)}
                    placeholder="Effective Gentle Care"
                    required
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Key Actives (Comma separated)</label>
                  <input
                    type="text"
                    value={prodActives}
                    onChange={(e) => setProdActives(e.target.value)}
                    placeholder="Salicylic Acid, Niacinamide, Alpha Arbutin"
                    required
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Benefits (Comma separated)</label>
                  <input
                    type="text"
                    value={prodBenefits}
                    onChange={(e) => setProdBenefits(e.target.value)}
                    placeholder="Fragrance Free, Deep Cleanses, Fades Hyperpigmentation"
                    required
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">How To Use (Comma separated)</label>
                  <input
                    type="text"
                    value={prodHowToUse}
                    onChange={(e) => setProdHowToUse(e.target.value)}
                    placeholder="Wet Face, Massage Gently, Rinse Well"
                    required
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Ingredients (Text)</label>
                  <textarea
                    value={prodIngredients}
                    onChange={(e) => setProdIngredients(e.target.value)}
                    placeholder="Water, Glycerin, Niacinamide..."
                    required
                    rows={3}
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white resize-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={prodTags}
                    onChange={(e) => setProdTags(e.target.value)}
                    placeholder="Daily Routine Set, Bestseller"
                    required
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
                  />
                </div>

                </div>

                {/* Product Images */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold block text-sm text-brand-dark">Product Images</label>
                    <button
                      type="button"
                      onClick={() => setProdImages([...prodImages, ""])}
                      className="text-[10px] uppercase tracking-wider font-bold text-brand-accent hover:text-brand-dark transition flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Image
                    </button>
                  </div>
                  {prodImages.length === 0 && (
                    <div className="text-xs text-brand-grey italic py-2">
                      No images added yet. Click "Add Image" above, or images will auto-generate from the Product ID.
                    </div>
                  )}
                  {prodImages.map((img, imgIdx) => (
                    <div key={imgIdx} className="relative">
                      <ImageUploader
                        label={`Image ${imgIdx + 1}`}
                        value={img}
                        onChange={(val) => {
                          const copy = [...prodImages];
                          copy[imgIdx] = val;
                          setProdImages(copy);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setProdImages(prodImages.filter((_, i) => i !== imgIdx))}
                        className="absolute top-0 right-0 p-1 text-[#c24b4b] hover:bg-[#c24b4b]/10 rounded transition"
                        title="Remove this image"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-brand-card/40 flex justify-end gap-3 flex-shrink-0">
                  <Button type="button" onClick={() => setShowProductModal(false)} variant="outline" className="py-2 px-4 border border-brand-dark/20 text-brand-dark hover:bg-brand-bg">
                    Cancel
                  </Button>
                  <Button type="submit" className="py-2 px-6 bg-brand-dark text-white hover:bg-black font-semibold shadow-sm">
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit/Add Coupon dialog modal */}
        {showCouponModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] border border-brand-card/40 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-brand-card/40 p-6 md:p-8 pb-4 flex-shrink-0">
                <h3 className="font-serif text-xl font-semibold text-brand-dark">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Coupon"}
                </h3>
                <button onClick={() => setShowCouponModal(false)} className="text-brand-grey hover:text-brand-dark p-1 rounded-full hover:bg-brand-bg transition">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCouponSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-4 space-y-6 flex flex-col text-left">
                <div className="flex-grow space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold block mb-1 text-xs">Coupon Code (Uppercase)</label>
                      <input
                        type="text"
                        disabled={!!editingCoupon}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. GLOW50"
                        required
                        className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-xs">Discount Type</label>
                      <select
                        value={couponType}
                        onChange={(e) => setCouponType(e.target.value)}
                        className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white text-xs"
                      >
                        <option value="percent">Percentage Off (%)</option>
                        <option value="fixed">Flat Amount Off (₹)</option>
                        <option value="buy_x_get_y">Buy X Get Y Free</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold block mb-1 text-xs">
                        {couponType === "buy_x_get_y" ? "Value (Item Value equivalent discount)" : "Discount Value"}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={couponValue}
                        onChange={(e) => setCouponValue(e.target.value)}
                        placeholder={couponType === "percent" ? "e.g. 15" : "e.g. 200"}
                        required
                        className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-xs">Min Spend Required (₹)</label>
                      <input
                        type="number"
                        value={couponMinPurchase}
                        onChange={(e) => setCouponMinPurchase(e.target.value)}
                        placeholder="e.g. 500 (0 for none)"
                        className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  {couponType === "buy_x_get_y" && (
                    <div className="p-4 bg-brand-bg rounded-2xl border border-brand-card space-y-4">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-brand-grey">Buy X Get Y Configuration</h4>
                      
                      <div>
                        <label className="font-semibold block mb-1 text-[11px]">Target Product</label>
                        <select
                          value={couponTargetProduct}
                          onChange={(e) => setCouponTargetProduct(e.target.value)}
                          required
                          className="w-full p-2 bg-white border border-brand-card rounded-lg focus:outline-none text-xs"
                        >
                          <option value="">-- Select Product --</option>
                          {productsList.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold block mb-1 text-[11px]">Buy Quantity</label>
                          <input
                            type="number"
                            value={couponBuyQty}
                            onChange={(e) => setCouponBuyQty(e.target.value)}
                            placeholder="e.g. 2"
                            required
                            className="w-full p-2 bg-white border border-brand-card rounded-lg focus:outline-none text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-[11px]">Get Quantity Free</label>
                          <input
                            type="number"
                            value={couponGetQty}
                            onChange={(e) => setCouponGetQty(e.target.value)}
                            placeholder="e.g. 1"
                            required
                            className="w-full p-2 bg-white border border-brand-card rounded-lg focus:outline-none text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="font-semibold block mb-1 text-xs">Coupon Description</label>
                    <input
                      type="text"
                      value={couponDescription}
                      onChange={(e) => setCouponDescription(e.target.value)}
                      placeholder="e.g. Get 15% off when you spend ₹500"
                      required
                      className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="coupon_active"
                      checked={couponIsActive}
                      onChange={(e) => setCouponIsActive(e.target.checked)}
                      className="rounded text-brand-dark focus:ring-brand-dark"
                    />
                    <label htmlFor="coupon_active" className="font-semibold text-xs cursor-pointer select-none">
                      Active (Customers can use this coupon code)
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-brand-card/40 flex justify-end gap-3 flex-shrink-0">
                  <Button type="button" onClick={() => setShowCouponModal(false)} variant="outline" className="py-2 px-4 border border-brand-dark/20 text-brand-dark hover:bg-brand-bg text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="py-2 px-6 bg-brand-dark text-white hover:bg-black font-semibold shadow-sm text-xs">
                    {editingCoupon ? "Save Changes" : "Create Coupon"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// Content Manager Tab Component (Full CRUD)
// ==========================================
const inputClass = "w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs";
const labelClass = "font-semibold block mb-1 text-xs text-brand-dark";
const sectionCardClass = "p-5 bg-brand-bg/50 border border-brand-card/45 rounded-2xl space-y-4";
const sectionTitleClass = "font-serif text-sm font-semibold text-brand-dark border-b border-brand-card/30 pb-2 flex items-center justify-between";

// Reusable Direct Image Uploader Component
const ImageUploader = ({ value, onChange, label = "Slide Image" }) => {
  const fileInputRef = React.useRef(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [localCacheBust, setLocalCacheBust] = useState(Date.now());

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size should be less than 10MB");
        return;
      }
      
      const formData = new FormData();
      formData.append("file", file);
      if (value && typeof value === "string" && !value.startsWith("data:")) {
        formData.append("replace_path", value);
      }
      
      try {
        const token = sessionStorage.getItem("luscent_admin_token");
        const res = await fetch(`${API_URL}/api/admin/upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
        
        if (res.ok) {
          const data = await res.json();
          onChange(data.url);
          setLocalCacheBust(Date.now());
        } else {
          alert("Failed to upload image");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("An error occurred during upload");
      }
    }
  };

  return (
    <div className="space-y-2 text-left">
      <div className="flex justify-between items-center">
        <label className={labelClass}>{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] text-brand-grey hover:text-brand-dark underline"
        >
          {showUrlInput ? "Hide URL input" : "Edit URL manually"}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="p-3 bg-white border border-brand-card/40 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={value.startsWith("data:") ? value : `${value}?v=${localCacheBust}`}
              alt="Slide preview"
              className="w-14 h-14 object-cover rounded-lg border border-brand-card/30 flex-shrink-0"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=Preview+Error"; }}
            />
            <div className="truncate">
              <span className="text-xs font-semibold text-brand-dark block">Current Image</span>
              <span className="text-[10px] text-brand-grey truncate block max-w-[200px]">
                {value.startsWith("data:") ? "Uploaded Local Image File" : value}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-1.5 px-3 bg-brand-dark text-white rounded-lg text-xs font-medium hover:bg-black transition flex items-center gap-1.5 shadow-sm"
            >
              <Upload size={12} /> Upload New
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Remove image"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-4 border-2 border-dashed border-brand-card/60 hover:border-brand-dark rounded-xl flex flex-col items-center justify-center gap-2 bg-brand-bg/30 hover:bg-brand-bg/70 transition group"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-brand-card/40 flex items-center justify-center text-brand-dark group-hover:scale-105 transition shadow-sm">
            <Upload size={18} />
          </div>
          <div className="text-center">
            <span className="text-xs font-bold text-brand-dark block">Click to Upload Image Directly</span>
            <span className="text-[10px] text-brand-grey block mt-0.5">Supports PNG, JPG, WEBP, SVG (Max 10MB)</span>
          </div>
        </button>
      )}

      {showUrlInput && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL (e.g. /images/banner.png)"
          className={inputClass + " mt-2"}
        />
      )}
    </div>
  );
};

const ContentManagerTab = ({ contentBlocks, setContentBlocks, contentSaving, setContentSaving, contentMessage, setContentMessage, API_URL, fetchAuth }) => {
  // ─── Local editing states ───
  // Hero Slides
  const heroSlides = contentBlocks.hero_slides || [
    { tag: "SPF 50+ PA++++ DEFENSE", title: "Powerful Protection. Effortless Glow.", desc: "Weightless, non-greasy sunscreen that blocks UV rays while treating dark spots.", image: "/images/sunscreen_banner.png", link: "/product/sunscreen" },
    { tag: "DEEP CLEANSING & BRIGHTENING", title: "Gentle Cleanse. Radiant Skin.", desc: "Exfoliates pores, controls breakouts, and fades dark spots.", image: "/images/sunscreen_beach_banner.jpg", link: "/product/face-wash" },
    { tag: "THE COMPLETE GLOW ROUTINE", title: "Ultimate Skin Defense Duo.", desc: "Maximum sun protection combined with a deep brightening cleanse. Save ₹86.", image: "/images/hero_banner.png", link: "/product/combo" }
  ];

  // Homepage Banner
  const homepageBanner = contentBlocks.homepage_banner || { title: "Powerful Protection. Effective Gentle Care.", subtitle: "We focus on formulation efficacy. Minimal products, maximal results." };

  // Testimonials
  const testimonials = contentBlocks.testimonials || [
    { name: "Dr. Ananya Sharma", role: "Dermatologist & Skin Specialist", rating: 5, skinType: "Sensitive Skin", text: "The combination of 2% Niacinamide and Zinc Oxide in the Ultra Light Sunscreen is formulation genius." },
  ];

  // FAQ Categories
  const faqCategories = contentBlocks.faq_categories || [
    { category: "Product Usage", questions: [{ question: "Can I use the Ultra Light Sunscreen SPF 50+ daily?", answer: "Yes, absolutely!" }] }
  ];

  // Our Story
  const ourStory = contentBlocks.our_story || {
    title: "Pure Science. Honest Care. Made in India.",
    subtitle: "We set out to remove the confusion and heavy formulas from daily solar protection and skin barrier repair.",
    manifesto_image: "/images/manifesto_banner.png",
    manifesto_tag: "OUR MANIFESTO",
    manifesto_text: "Formulating skin barrier protection that feels absolutely weightless.",
    founder_title: "Why we started Luscent Glow",
    founder_text: "skinceutical solutions in India are often split between two extremes: heavy, oily sunscreen blocks that clog pores, or harsh chemical washes that dry out the skin barrier entirely.\n\nLuscent Glow was created to strike the perfect balance: **\"Powerful Protection. Effective Gentle Care.\"** We wanted to engineer a hybrid mineral sunscreen that is completely weightless in hot summers, hydrates like a moisturizer, and leaves absolutely no white cast.\n\nBy working with elite formulation scientists, we designed our sunscreen and face wash using clinical-grade active ingredients like **Niacinamide, Salicylic Acid, and Alpha Arbutin**. We choose safety, transparency, and results over marketing buzzwords.",
    mfg_tag: "PROUDLY MADE IN INDIA",
    mfg_title: "Clinical Precision at Basilica Biotech, Surat",
    mfg_text: "Every batch of Luscent Glow products is formulated, tested, and bottled at **Basilica Biotech**, located in the industrial hub of **Surat, Gujarat, India**.\n\nBy manufacturing locally under world-class clinical conditions, we eliminate heavy import taxes and middlemen. This allows us to deliver high-potency, dermatologist-grade actives directly to you at honest, affordable prices.",
    mfg_image: "/images/production_facility.png",
    values_title: "Skincare Without Compromise",
    values: [
      { title: "Effective, Gentle Formulations", desc: "We never use drying alcohols, synthetic sulfates, or artificial fragrances. Our active acids work gently in harmony with your skin's natural pH." },
      { title: "Dermatologist Friendly", desc: "Tested extensively on all skin types. Our formulas prioritize lipid barrier repair to prevent redness, acne flare-ups, and irritations." },
      { title: "Honest Ingredients", desc: "No hidden chemical blocks or placeholder fillers. We list every single element of our sunscreen and face wash clearly, right on the front label." }
    ]
  };

  // Contact Info
  const contactInfo = contentBlocks.contact_info || { email: "theluscentglow@gmail.com", phone: "+91 63521 63607", address: "Mfg. by Basilica Biotech, Surat, Gujarat, India." };

  // ─── Generic save helper ───
  const saveSection = async (sectionKey, content) => {
    setContentSaving(true);
    setContentMessage("");
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/content/${sectionKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        setContentBlocks(prev => ({ ...prev, [sectionKey]: content }));
        setContentMessage(`Section "${sectionKey}" saved successfully!`);
      } else {
        setContentMessage(`Failed to save "${sectionKey}".`);
      }
    } catch {
      setContentMessage("Error connecting to backend.");
    } finally {
      setContentSaving(false);
      setTimeout(() => setContentMessage(""), 3500);
    }
  };

  // ─── Local form states ───
  const [localHero, setLocalHero] = useState(heroSlides);
  const [localBanner, setLocalBanner] = useState(homepageBanner);
  const [localTestimonials, setLocalTestimonials] = useState(testimonials);
  const [localFAQ, setLocalFAQ] = useState(faqCategories);
  const [localStory, setLocalStory] = useState(ourStory);
  const [localContact, setLocalContact] = useState(contactInfo);
  const [showStoryPreview, setShowStoryPreview] = useState(false);

  // Sync with parent when contentBlocks change
  React.useEffect(() => {
    if (contentBlocks.hero_slides) setLocalHero(contentBlocks.hero_slides);
    if (contentBlocks.homepage_banner) setLocalBanner(contentBlocks.homepage_banner);
    if (contentBlocks.testimonials) setLocalTestimonials(contentBlocks.testimonials);
    if (contentBlocks.faq_categories) setLocalFAQ(contentBlocks.faq_categories);
    if (contentBlocks.our_story) setLocalStory(contentBlocks.our_story);
    if (contentBlocks.contact_info) setLocalContact(contentBlocks.contact_info);
  }, [contentBlocks]);

  // ─── Hero Slide Helpers ───
  const updateHeroSlide = (idx, field, value) => {
    const copy = [...localHero];
    copy[idx] = { ...copy[idx], [field]: value };
    setLocalHero(copy);
  };
  const addHeroSlide = () => setLocalHero([...localHero, { tag: "", title: "", desc: "", image: "", link: "" }]);
  const removeHeroSlide = (idx) => setLocalHero(localHero.filter((_, i) => i !== idx));

  // ─── Testimonial Helpers ───
  const updateTestimonial = (idx, field, value) => {
    const copy = [...localTestimonials];
    copy[idx] = { ...copy[idx], [field]: value };
    setLocalTestimonials(copy);
  };
  const addTestimonial = () => setLocalTestimonials([...localTestimonials, { name: "", role: "", rating: 5, skinType: "", text: "" }]);
  const removeTestimonial = (idx) => setLocalTestimonials(localTestimonials.filter((_, i) => i !== idx));

  // ─── FAQ Helpers ───
  const addFAQCategory = () => setLocalFAQ([...localFAQ, { category: "", questions: [{ question: "", answer: "" }] }]);
  const removeFAQCategory = (idx) => setLocalFAQ(localFAQ.filter((_, i) => i !== idx));
  const updateFAQCategoryName = (idx, value) => {
    const copy = [...localFAQ];
    copy[idx] = { ...copy[idx], category: value };
    setLocalFAQ(copy);
  };
  const addFAQQuestion = (catIdx) => {
    const copy = [...localFAQ];
    copy[catIdx] = { ...copy[catIdx], questions: [...copy[catIdx].questions, { question: "", answer: "" }] };
    setLocalFAQ(copy);
  };
  const removeFAQQuestion = (catIdx, qIdx) => {
    const copy = [...localFAQ];
    copy[catIdx] = { ...copy[catIdx], questions: copy[catIdx].questions.filter((_, i) => i !== qIdx) };
    setLocalFAQ(copy);
  };
  const updateFAQQuestion = (catIdx, qIdx, field, value) => {
    const copy = [...localFAQ];
    const qCopy = [...copy[catIdx].questions];
    qCopy[qIdx] = { ...qCopy[qIdx], [field]: value };
    copy[catIdx] = { ...copy[catIdx], questions: qCopy };
    setLocalFAQ(copy);
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h3 className="font-serif text-lg font-semibold text-brand-dark">Website Content Manager</h3>
        <p className="text-xs text-brand-grey mt-1">Full CRUD control over all website content. Changes go live once saved.</p>
      </div>

      <AnimatePresence>
        {contentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 py-3 px-5 text-sm font-semibold rounded-xl shadow-2xl z-50 flex items-center gap-2 backdrop-blur-md ${
              contentMessage.includes("success") ? "bg-brand-green/90 text-white" : "bg-[#c24b4b]/90 text-white"
            }`}
          >
            {contentMessage.includes("success") ? <CheckCircle size={18} /> : <X size={18} />}
            {contentMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ 1. HERO SLIDES ═══════ */}
      <div className={sectionCardClass}>
        <div className={sectionTitleClass}>
          <span>Hero Carousel Slides ({localHero.length})</span>
          <button onClick={addHeroSlide} className="text-[10px] uppercase tracking-wider font-bold text-brand-accent hover:text-brand-dark transition flex items-center gap-1">
            <Plus size={12} /> Add Slide
          </button>
        </div>
        {localHero.map((slide, idx) => (
          <div key={idx} className="p-4 bg-white border border-brand-card/30 rounded-xl space-y-3 relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-grey">Slide {idx + 1}</span>
              {localHero.length > 1 && (
                <button onClick={() => removeHeroSlide(idx)} className="text-[#c24b4b] hover:bg-[#c24b4b]/10 p-1 rounded transition">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Tag / Badge</label><input type="text" value={slide.tag} onChange={(e) => updateHeroSlide(idx, "tag", e.target.value)} placeholder="e.g. SPF 50+ PA++++" className={inputClass} /></div>
              <div><label className={labelClass}>Link URL</label><input type="text" value={slide.link} onChange={(e) => updateHeroSlide(idx, "link", e.target.value)} placeholder="/product/sunscreen" className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Title</label><input type="text" value={slide.title} onChange={(e) => updateHeroSlide(idx, "title", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Description</label><textarea rows={2} value={slide.desc} onChange={(e) => updateHeroSlide(idx, "desc", e.target.value)} className={inputClass + " resize-none"} /></div>
            <ImageUploader label="Slide Image" value={slide.image} onChange={(val) => updateHeroSlide(idx, "image", val)} />
          </div>
        ))}
        <div className="flex justify-end">
          <Button onClick={() => saveSection("hero_slides", localHero)} disabled={contentSaving} className="py-2.5 px-6 bg-brand-dark text-white hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl">
            {contentSaving ? "Saving..." : "Save Hero Slides"}
          </Button>
        </div>
      </div>

      {/* ═══════ 2. HOMEPAGE BANNER ═══════ */}
      <div className={sectionCardClass}>
        <h4 className={sectionTitleClass}>Homepage "Our Essentials" Banner Text</h4>
        <div><label className={labelClass}>Heading</label><input type="text" value={localBanner.title} onChange={(e) => setLocalBanner({ ...localBanner, title: e.target.value })} className={inputClass} /></div>
        <div><label className={labelClass}>Subtitle</label><textarea rows={2} value={localBanner.subtitle} onChange={(e) => setLocalBanner({ ...localBanner, subtitle: e.target.value })} className={inputClass + " resize-none"} /></div>
        <div className="flex justify-end">
          <Button onClick={() => saveSection("homepage_banner", localBanner)} disabled={contentSaving} className="py-2.5 px-6 bg-brand-dark text-white hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl">
            {contentSaving ? "Saving..." : "Save Banner"}
          </Button>
        </div>
      </div>

      {/* ═══════ 3. TESTIMONIALS ═══════ */}
      <div className={sectionCardClass}>
        <div className={sectionTitleClass}>
          <span>Customer Testimonials ({localTestimonials.length})</span>
          <button onClick={addTestimonial} className="text-[10px] uppercase tracking-wider font-bold text-brand-accent hover:text-brand-dark transition flex items-center gap-1">
            <Plus size={12} /> Add Review
          </button>
        </div>
        {localTestimonials.map((t, idx) => (
          <div key={idx} className="p-4 bg-white border border-brand-card/30 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-grey">Review {idx + 1}</span>
              {localTestimonials.length > 1 && (
                <button onClick={() => removeTestimonial(idx)} className="text-[#c24b4b] hover:bg-[#c24b4b]/10 p-1 rounded transition">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Name</label><input type="text" value={t.name} onChange={(e) => updateTestimonial(idx, "name", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Role</label><input type="text" value={t.role} onChange={(e) => updateTestimonial(idx, "role", e.target.value)} placeholder="e.g. Verified Buyer" className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Rating (1-5)</label><input type="number" min="1" max="5" step="0.5" value={t.rating} onChange={(e) => updateTestimonial(idx, "rating", parseFloat(e.target.value))} className={inputClass} /></div>
              <div><label className={labelClass}>Skin Type</label><input type="text" value={t.skinType} onChange={(e) => updateTestimonial(idx, "skinType", e.target.value)} placeholder="e.g. Oily & Acne-Prone" className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Review Text</label><textarea rows={3} value={t.text} onChange={(e) => updateTestimonial(idx, "text", e.target.value)} className={inputClass + " resize-none"} /></div>
          </div>
        ))}
        <div className="flex justify-end">
          <Button onClick={() => saveSection("testimonials", localTestimonials)} disabled={contentSaving} className="py-2.5 px-6 bg-brand-dark text-white hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl">
            {contentSaving ? "Saving..." : "Save Testimonials"}
          </Button>
        </div>
      </div>

      {/* ═══════ 4. FAQ CATEGORIES ═══════ */}
      <div className={sectionCardClass}>
        <div className={sectionTitleClass}>
          <span>FAQ Categories ({localFAQ.length})</span>
          <button onClick={addFAQCategory} className="text-[10px] uppercase tracking-wider font-bold text-brand-accent hover:text-brand-dark transition flex items-center gap-1">
            <Plus size={12} /> Add Category
          </button>
        </div>
        {localFAQ.map((cat, catIdx) => (
          <div key={catIdx} className="p-4 bg-white border border-brand-card/30 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex-1 mr-3">
                <label className={labelClass}>Category Name</label>
                <input type="text" value={cat.category} onChange={(e) => updateFAQCategoryName(catIdx, e.target.value)} placeholder="e.g. Product Usage" className={inputClass} />
              </div>
              {localFAQ.length > 1 && (
                <button onClick={() => removeFAQCategory(catIdx)} className="text-[#c24b4b] hover:bg-[#c24b4b]/10 p-1.5 rounded transition mt-4">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <div className="ml-4 space-y-3 border-l-2 border-brand-card/30 pl-4">
              {cat.questions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-2 p-3 bg-brand-bg/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-grey">Q{qIdx + 1}</span>
                    {cat.questions.length > 1 && (
                      <button onClick={() => removeFAQQuestion(catIdx, qIdx)} className="text-[#c24b4b] hover:bg-[#c24b4b]/10 p-1 rounded transition">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                  <div><label className={labelClass}>Question</label><input type="text" value={q.question} onChange={(e) => updateFAQQuestion(catIdx, qIdx, "question", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Answer</label><textarea rows={2} value={q.answer} onChange={(e) => updateFAQQuestion(catIdx, qIdx, "answer", e.target.value)} className={inputClass + " resize-none"} /></div>
                </div>
              ))}
              <button onClick={() => addFAQQuestion(catIdx)} className="text-[10px] uppercase tracking-wider font-bold text-brand-accent hover:text-brand-dark transition flex items-center gap-1 ml-1">
                <Plus size={11} /> Add Question
              </button>
            </div>
          </div>
        ))}
        <div className="flex justify-end">
          <Button onClick={() => saveSection("faq_categories", localFAQ)} disabled={contentSaving} className="py-2.5 px-6 bg-brand-dark text-white hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl">
            {contentSaving ? "Saving..." : "Save FAQs"}
          </Button>
        </div>
      </div>

      {/* ═══════ 5. OUR STORY ═══════ */}
      <div className={sectionCardClass}>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-brand-card/30 pb-3 mb-4">
          <h4 className="font-serif text-sm font-semibold text-brand-dark flex items-center">Our Story Page Content</h4>
          <Button 
            onClick={() => setShowStoryPreview(!showStoryPreview)} 
            variant="outline" 
            className="text-[10px] py-1.5 px-3 bg-white border border-brand-card/60 hover:bg-brand-bg transition"
          >
            {showStoryPreview ? "Close Live Preview" : "Show Live Preview"}
          </Button>
        </div>
        
        <div className={`grid ${showStoryPreview ? 'grid-cols-1 xl:grid-cols-2 gap-8' : 'grid-cols-1'}`}>
          <div className="space-y-6">
          {/* Header Section */}
          <div className="p-4 bg-white border border-brand-card/30 rounded-xl space-y-3">
            <h5 className="text-[10px] uppercase font-bold text-brand-grey mb-2">1. Header Section</h5>
            <div><label className={labelClass}>Page Title / Heading</label><input type="text" value={localStory.title} onChange={(e) => setLocalStory({ ...localStory, title: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Subtitle / Description</label><textarea rows={3} value={localStory.subtitle} onChange={(e) => setLocalStory({ ...localStory, subtitle: e.target.value })} className={inputClass + " resize-none leading-relaxed"} /></div>
          </div>

          {/* Manifesto Break */}
          <div className="p-4 bg-white border border-brand-card/30 rounded-xl space-y-3">
            <h5 className="text-[10px] uppercase font-bold text-brand-grey mb-2">2. Manifesto Image Break</h5>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Tagline</label><input type="text" value={localStory.manifesto_tag} onChange={(e) => setLocalStory({ ...localStory, manifesto_tag: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Text</label><input type="text" value={localStory.manifesto_text} onChange={(e) => setLocalStory({ ...localStory, manifesto_text: e.target.value })} className={inputClass} /></div>
            </div>
            <ImageUploader label="Manifesto Image" value={localStory.manifesto_image} onChange={(val) => setLocalStory({ ...localStory, manifesto_image: val })} />
          </div>

          {/* Founder Note */}
          <div className="p-4 bg-white border border-brand-card/30 rounded-xl space-y-3">
            <h5 className="text-[10px] uppercase font-bold text-brand-grey mb-2">3. Founder Note</h5>
            <div><label className={labelClass}>Section Title</label><input type="text" value={localStory.founder_title} onChange={(e) => setLocalStory({ ...localStory, founder_title: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Founder Text (Markdown supported: **bold**)</label><textarea rows={6} value={localStory.founder_text} onChange={(e) => setLocalStory({ ...localStory, founder_text: e.target.value })} className={inputClass + " resize-none leading-relaxed"} /></div>
          </div>

          {/* Manufacturing */}
          <div className="p-4 bg-white border border-brand-card/30 rounded-xl space-y-3">
            <h5 className="text-[10px] uppercase font-bold text-brand-grey mb-2">4. Manufacturing & Quality</h5>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Tagline</label><input type="text" value={localStory.mfg_tag} onChange={(e) => setLocalStory({ ...localStory, mfg_tag: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Section Title</label><input type="text" value={localStory.mfg_title} onChange={(e) => setLocalStory({ ...localStory, mfg_title: e.target.value })} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Description Text</label><textarea rows={4} value={localStory.mfg_text} onChange={(e) => setLocalStory({ ...localStory, mfg_text: e.target.value })} className={inputClass + " resize-none leading-relaxed"} /></div>
            <ImageUploader label="Manufacturing Image" value={localStory.mfg_image} onChange={(val) => setLocalStory({ ...localStory, mfg_image: val })} />
          </div>

          {/* Values Grid */}
          <div className="p-4 bg-white border border-brand-card/30 rounded-xl space-y-4">
            <h5 className="text-[10px] uppercase font-bold text-brand-grey mb-2">5. Three Core Values</h5>
            <div><label className={labelClass}>Values Section Title</label><input type="text" value={localStory.values_title} onChange={(e) => setLocalStory({ ...localStory, values_title: e.target.value })} className={inputClass} /></div>
            <div className="space-y-4 pt-2">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="p-3 bg-brand-bg/30 rounded-lg space-y-2 border border-brand-card/20">
                  <h6 className="text-[9px] uppercase font-bold text-brand-grey">Value {idx + 1}</h6>
                  <div><label className={labelClass}>Title</label><input type="text" value={localStory.values?.[idx]?.title || ""} onChange={(e) => {
                    const copy = [...(localStory.values || [])];
                    if (!copy[idx]) copy[idx] = { title: "", desc: "" };
                    copy[idx].title = e.target.value;
                    setLocalStory({ ...localStory, values: copy });
                  }} className={inputClass} /></div>
                  <div><label className={labelClass}>Description</label><textarea rows={2} value={localStory.values?.[idx]?.desc || ""} onChange={(e) => {
                    const copy = [...(localStory.values || [])];
                    if (!copy[idx]) copy[idx] = { title: "", desc: "" };
                    copy[idx].desc = e.target.value;
                    setLocalStory({ ...localStory, values: copy });
                  }} className={inputClass + " resize-none"} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showStoryPreview && (
          <div className="border border-brand-card/40 rounded-2xl overflow-hidden bg-[#FAF8F5] relative h-[800px] overflow-y-auto custom-scrollbar shadow-inner mt-6 xl:mt-0">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md py-2.5 px-4 flex justify-between items-center border-b border-brand-card/40 z-50 shadow-sm">
              <span className="text-[10px] font-bold tracking-widest uppercase text-brand-grey">Live Preview</span>
              <span className="text-[10px] text-brand-accent/80 font-medium bg-brand-accent/10 px-2 py-0.5 rounded">Updating instantly</span>
            </div>
            <div className="origin-top" style={{ transform: "scale(0.85)", width: "117.6%" }}>
              <div className="pointer-events-none pb-32">
                <OurStoryPage previewData={localStory} />
              </div>
            </div>
          </div>
        )}
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-brand-card/30">
          <Button onClick={() => saveSection("our_story", localStory)} disabled={contentSaving} className="py-2.5 px-6 bg-brand-dark text-white hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl">
            {contentSaving ? "Saving..." : "Save Our Story Page"}
          </Button>
        </div>
      </div>

      {/* ═══════ 6. CONTACT INFO ═══════ */}
      <div className={sectionCardClass}>
        <h4 className={sectionTitleClass}>Contact & Manufacturer Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Support Email</label><input type="email" value={localContact.email} onChange={(e) => setLocalContact({ ...localContact, email: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Support Phone</label><input type="text" value={localContact.phone} onChange={(e) => setLocalContact({ ...localContact, phone: e.target.value })} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Manufacturer Address</label><input type="text" value={localContact.address} onChange={(e) => setLocalContact({ ...localContact, address: e.target.value })} className={inputClass} /></div>
        <div className="flex justify-end">
          <Button onClick={() => saveSection("contact_info", localContact)} disabled={contentSaving} className="py-2.5 px-6 bg-brand-dark text-white hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl">
            {contentSaving ? "Saving..." : "Save Contact Info"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
