import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, ShoppingBag, Users, Plus, Edit2, Trash2, CheckCircle, Clock, 
  TrendingUp, IndianRupee, ShieldAlert, ArrowRight, X, ChevronRight, Lock, User, Upload, Eye, EyeOff, RotateCcw, MessageSquare,
  LogOut, Package, Ticket, LayoutDashboard, FileText, Settings, Filter, Download, Circle, Search, Printer, Truck, Boxes, CreditCard, Wallet, XCircle, Sparkles, ArrowUpRight, ArrowDownRight, Star
} from "lucide-react";
import { API_URL } from "../config";
import { Button } from "../components/Button";
import { useSearchParams } from "react-router-dom";
import { OurStoryPage } from "./OurStoryPage";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [showDeletedOrders, setShowDeletedOrders] = useState(false);
  const [orderTab, setOrderTab] = useState("All");
  const [searchOrderQuery, setSearchOrderQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [inquiriesList, setInquiriesList] = useState([]);
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
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [razorpayEnv, setRazorpayEnv] = useState("sandbox");
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [activeGateway, setActiveGateway] = useState("cashfree");
  const [delhiveryApiToken, setDelhiveryApiToken] = useState("");
  const [showDelhiveryToken, setShowDelhiveryToken] = useState(false);
  const [delhiveryEnv, setDelhiveryEnv] = useState("sandbox");
  const [delhiveryWarehouse, setDelhiveryWarehouse] = useState("Luscentglow Warehouse");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
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
  const [prodFaqs, setProdFaqs] = useState([]);

  // Review Admin Form Dialog State
  const [showAdminReviewModal, setShowAdminReviewModal] = useState(false);
  const [editingAdminReview, setEditingAdminReview] = useState(null);
  const [adminReviewProductId, setAdminReviewProductId] = useState("sunscreen");
  const [adminReviewName, setAdminReviewName] = useState("");
  const [adminReviewRating, setAdminReviewRating] = useState(5);
  const [adminReviewTitle, setAdminReviewTitle] = useState("");
  const [adminReviewComment, setAdminReviewComment] = useState("");
  const [adminReviewImages, setAdminReviewImages] = useState([]);
  const [submittingAdminReview, setSubmittingAdminReview] = useState(false);
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [reviewRatingFilter, setReviewRatingFilter] = useState("all");
  const [prodBenefits, setProdBenefits] = useState("");
  const [prodHowToUse, setProdHowToUse] = useState("");
  const [prodIngredients, setProdIngredients] = useState("");
  const [prodTags, setProdTags] = useState("");
  const [prodImages, setProdImages] = useState([]);

  const addProdFAQ = () => setProdFaqs([...prodFaqs, { question: "", answer: "" }]);
  const removeProdFAQ = (idx) => setProdFaqs(prodFaqs.filter((_, i) => i !== idx));
  const updateProdFAQ = (idx, field, value) => {
    const copy = [...prodFaqs];
    copy[idx] = { ...copy[idx], [field]: value };
    setProdFaqs(copy);
  };

  // Manual Order Form Dialog State
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const [manualOrderName, setManualOrderName] = useState("");
  const [manualOrderPhone, setManualOrderPhone] = useState("");
  const [manualOrderAddress, setManualOrderAddress] = useState("");
  const [manualOrderCity, setManualOrderCity] = useState("");
  const [manualOrderState, setManualOrderState] = useState("");
  const [manualOrderPincode, setManualOrderPincode] = useState("");
  const [manualOrderPaymentMethod, setManualOrderPaymentMethod] = useState("cod");
  const [manualOrderItems, setManualOrderItems] = useState({});
  const [submittingManualOrder, setSubmittingManualOrder] = useState(false);

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
        window.location.reload();
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
    window.location.reload();
  };

  const handleManualOrderSubmit = async (e) => {
    e.preventDefault();
    if (!manualOrderName || !manualOrderPhone || !manualOrderAddress || !manualOrderCity || !manualOrderState || !manualOrderPincode) {
      return alert("Please fill in all customer details.");
    }

    const items = [];
    let totalPrice = 0;

    Object.entries(manualOrderItems).forEach(([productId, quantity]) => {
      if (quantity > 0) {
        const prod = productsList.find(p => p.id === productId || p._id === productId);
        if (prod) {
          items.push({
            id: prod.id || prod._id,
            name: prod.name,
            price: prod.price,
            quantity: quantity,
            image: prod.images?.[0] || ""
          });
          totalPrice += (prod.price * quantity);
        }
      }
    });

    if (items.length === 0) return alert("Please select at least one product.");

    setSubmittingManualOrder(true);

    const orderPayload = {
      name: manualOrderName,
      phone: manualOrderPhone,
      address: manualOrderAddress,
      city: manualOrderCity,
      state: manualOrderState,
      pincode: manualOrderPincode,
      paymentMethod: manualOrderPaymentMethod,
      totalPrice: totalPrice,
      items: items
    };

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      if (res.ok) {
        setShowManualOrderModal(false);
        fetchDashboardData();
        setManualOrderName("");
        setManualOrderPhone("");
        setManualOrderAddress("");
        setManualOrderCity("");
        setManualOrderState("");
        setManualOrderPincode("");
        setManualOrderItems({});
        alert("Order created successfully!");
      } else {
        const data = await res.json();
        alert(data.detail || "Error creating order");
      }
    } catch (err) {
      alert("Error creating order");
    } finally {
      setSubmittingManualOrder(false);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetchAuth(`${API_URL}/api/contacts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInquiriesList(inquiriesList.filter(inq => inq._id !== id));
      } else {
        alert("Failed to delete inquiry.");
      }
    } catch (err) {
      alert("Error deleting inquiry.");
    }
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

      // Inventory
      const invRes = await fetchAuth(`${API_URL}/api/admin/inventory`);
      if (invRes.ok) setInventoryList(await invRes.json());
      
      const invHistRes = await fetchAuth(`${API_URL}/api/admin/inventory/history`);
      if (invHistRes.ok) setInventoryHistory(await invHistRes.json());

      let mergedOrders = apiOrders;
      
      // Merge order users with auth users for search compatibility
      const enhancedOrders = mergedOrders.map(o => {
        const orderUser = apiUsers.find(u => u.email === o.email || (o.user_id && u._id === o.user_id));
        return { ...o, user_data: orderUser };
      }).sort((a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now()));
      setOrders(enhancedOrders);

      // Compute dynamic revenue and order metrics
      const totalRevenue = mergedOrders.reduce((sum, ord) => sum + (Number(ord.totalPrice) || 0), 0);
      const uniqueUserEmails = new Set([
        ...apiUsers.map(u => u.email?.toLowerCase()).filter(Boolean),
        ...mergedOrders.map(o => (o.user_id || o.email)?.toLowerCase()).filter(Boolean)
      ]);
      const activeUsersCount = Math.max(apiUsers.length, backendStats.users || 0, uniqueUserEmails.size);

      setStats({
        ...backendStats,
        revenue: totalRevenue,
        orders: mergedOrders.filter(o => !o.is_deleted).length,
        deleted_orders: mergedOrders.filter(o => o.is_deleted).length || backendStats.deleted_orders || 0,
        users: activeUsersCount,
        deleted_users: backendStats.deleted_users || 0,
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
        setRazorpayKeyId(settingsData.razorpay_key_id || "");
        setRazorpayKeySecret(settingsData.razorpay_key_secret || "");
        setRazorpayEnv(settingsData.razorpay_env || "sandbox");
        setActiveGateway(settingsData.active_gateway || "cashfree");
        setDelhiveryApiToken(settingsData.delhivery_api_token || "");
        setDelhiveryEnv(settingsData.delhivery_env || "sandbox");
        setDelhiveryWarehouse(settingsData.delhivery_warehouse || "Luscentglow Warehouse");
        setSocialInstagram(settingsData.social_instagram || "");
        setSocialFacebook(settingsData.social_facebook || "");
        setSocialTwitter(settingsData.social_twitter || "");
        setSocialYoutube(settingsData.social_youtube || "");
        setOnlinePaymentEnabled(settingsData.online_payment_enabled !== false);
        setBeforeImage(settingsData.before_image || "/before-skin.png");
        setAfterImage(settingsData.after_image || "/after-skin.png");
      }

      // CMS Content Blocks
      const contentRes = await fetchAuth(`${API_URL}/api/admin/content`);
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        const contentMap = {};
        contentData.forEach(block => {
          contentMap[block.key] = block.content;
        });
        setContentBlocks(contentMap);
      }

      // Inquiries
      const contactsRes = await fetchAuth(`${API_URL}/api/contacts`);
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setInquiriesList(contactsData);
      }
      
      // Reviews
      const reviewsRes = await fetchAuth(`${API_URL}/api/admin/reviews`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviewsList(reviewsData);
      }
    } catch (err) {
      setError("Failed to fetch dashboard data. Please try again.");
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
    setProdFaqs(p.faqs || []);
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
    setProdFaqs([]);
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
      razorpay_key_id: razorpayKeyId,
      razorpay_key_secret: razorpayKeySecret,
      razorpay_env: razorpayEnv,
      active_gateway: activeGateway,
      delhivery_api_token: delhiveryApiToken,
      delhivery_env: delhiveryEnv,
      delhivery_warehouse: delhiveryWarehouse,
      social_instagram: socialInstagram,
      social_facebook: socialFacebook,
      social_twitter: socialTwitter,
      social_youtube: socialYoutube,
      online_payment_enabled: onlinePaymentEnabled,
      before_image: beforeImage,
      after_image: afterImage
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
      faqs: prodFaqs,
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

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const handleOpenAddReviewModal = () => {
    setEditingAdminReview(null);
    setAdminReviewProductId(productsList[0]?.id || "sunscreen");
    setAdminReviewName("");
    setAdminReviewRating(5);
    setAdminReviewTitle("");
    setAdminReviewComment("");
    setAdminReviewImages([]);
    setShowAdminReviewModal(true);
  };

  const handleOpenEditReviewModal = (review) => {
    setEditingAdminReview(review);
    setAdminReviewProductId(review.product_id || "sunscreen");
    setAdminReviewName(review.name || "");
    setAdminReviewRating(review.rating || 5);
    setAdminReviewTitle(review.title || "");
    setAdminReviewComment(review.comment || "");
    setAdminReviewImages(review.images || []);
    setShowAdminReviewModal(true);
  };

  const handleSaveAdminReview = async (e) => {
    e.preventDefault();
    setSubmittingAdminReview(true);
    const payload = {
      product_id: adminReviewProductId,
      name: adminReviewName,
      rating: adminReviewRating,
      title: adminReviewTitle,
      comment: adminReviewComment,
      images: adminReviewImages
    };

    try {
      let res;
      if (editingAdminReview) {
        const revId = editingAdminReview._id || editingAdminReview.id;
        res = await fetchAuth(`${API_URL}/api/admin/reviews/${revId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetchAuth(`${API_URL}/api/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      if (res.ok) {
        setShowAdminReviewModal(false);
        setEditingAdminReview(null);
        fetchDashboardData();
        setAdminReviewName("");
        setAdminReviewRating(5);
        setAdminReviewTitle("");
        setAdminReviewComment("");
        setAdminReviewImages([]);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Failed to save review");
      }
    } catch (err) {
      alert("Error saving review");
    } finally {
      setSubmittingAdminReview(false);
    }
  };

  const handleAdminReviewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (adminReviewImages.length + files.length > 3) {
      alert("You can only upload a maximum of 3 images.");
      return;
    }
    
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`File ${file.name} is larger than 2MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setAdminReviewImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
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
  // Sidebar Navigation Item Component
  const NavItem = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-left ${
        activeTab === id 
          ? "bg-brand-card/30 text-brand-dark" 
          : "text-brand-grey hover:bg-brand-bg hover:text-brand-dark"
      }`}
    >
      <Icon size={18} className={activeTab === id ? "text-brand-accent" : ""} />
      <span className="hidden md:inline">{label}</span>
      <span className="md:hidden text-xs whitespace-nowrap">{label}</span>
    </button>
  );

  // Render Dashboard
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAF8F5]">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-brand-card/30 flex flex-col flex-shrink-0 md:h-screen md:sticky top-0 md:overflow-y-auto z-20">
        <div className="p-4 md:p-6 border-b border-brand-card/30 hidden md:block">
          <div className="flex flex-col gap-4 mb-2">
            <img 
              src="/images/logo.png" 
              alt="Luscent Glow" 
              className="h-8 object-contain self-start" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
        
        <div className="p-2 md:p-4 flex-1 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
          <div className="flex md:flex-col gap-1 w-max md:w-full">
            <NavItem id="overview" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="orders" label="Orders" icon={ShoppingBag} />
            <NavItem id="products" label="Products" icon={Package} />
            <NavItem id="inventory" label="Inventory" icon={Boxes} />
            <NavItem id="users" label="Customers" icon={Users} />
            <NavItem id="coupons" label="Coupons" icon={Ticket} />
            <NavItem id="payments" label="Payments" icon={CreditCard} />
            <NavItem id="reports" label="Reports" icon={BarChart3} />
            <NavItem id="reviews" label="Reviews" icon={Star} />
            <NavItem id="inquiries" label="Inquiries" icon={MessageSquare} />
            <NavItem id="integrations" label="Integrations" icon={Settings} />
            <NavItem id="content" label="Content" icon={FileText} />
          </div>
        </div>

        <div className="p-2 md:p-4 border-t border-brand-card/30 hidden md:block">
          <button onClick={handleAdminLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
             <LogOut size={18} />
             <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 py-8 px-4 md:px-8 w-full max-w-[1600px] space-y-6 min-w-0 text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-card/30 pb-6 mb-4">
          <div className="flex-1 w-full md:max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-brand-grey" />
            </div>
            <input 
              type="text" 
              placeholder="Search orders, customers, products..." 
              className="w-full pl-10 pr-12 py-2 border border-brand-card/60 rounded-full text-sm focus:outline-none focus:border-brand-dark/30 focus:ring-1 focus:ring-brand-dark/30 transition-all shadow-sm bg-white"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-[10px] text-brand-grey font-mono border border-brand-card/50 rounded px-1.5 py-0.5 bg-brand-bg/50">⌘K</span>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <Button variant="outline" onClick={handleAdminLogout} className="md:hidden text-xs py-2 px-4 border border-red-200 text-red-650 hover:bg-red-50 transition rounded-full h-[36px]">
              Logout
            </Button>
            <div className="flex items-center gap-2 border border-brand-card/60 bg-[#FAF8F5] rounded-full px-4 py-1.5 shadow-sm h-[36px]">
              <span className="text-[10px] font-bold text-brand-grey uppercase tracking-widest">Today</span>
              <span className="text-sm font-bold text-brand-dark">₹{orders.filter(o => o.status !== "cancelled" && new Date(o.created_at).toDateString() === new Date().toDateString()).reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0).toLocaleString("en-IN")}</span>
            </div>
            <Button variant="primary" onClick={() => setShowManualOrderModal(true)} className="text-xs py-2 px-5 bg-brand-dark text-white hover:bg-black rounded-full flex items-center gap-1.5 shadow-sm h-[36px]">
              <Plus size={14} strokeWidth={3} /> <span className="font-semibold tracking-wide">Quick Order</span>
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
          {/* Dashboard Overview */}
          {activeTab === "overview" && (
            <DashboardOverview 
              orders={orders} 
              productsList={productsList} 
              inventoryList={inventoryList} 
              setShowManualOrderModal={setShowManualOrderModal} 
            />
          )}

          {/* Tab Panes */}
          <div className="bg-white border border-brand-card/40 rounded-3xl p-4 sm:p-6 shadow-sm min-h-[400px]">
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
              const filteredOrders = orders.filter(o => {
                if (showDeletedOrders ? !o.is_deleted : o.is_deleted) return false;
                
                if (searchOrderQuery) {
                  const q = searchOrderQuery.toLowerCase();
                  const matchesSearch = 
                    (o.order_number && o.order_number.toLowerCase().includes(q)) ||
                    (o.name && o.name.toLowerCase().includes(q)) ||
                    (o.phone && o.phone.toLowerCase().includes(q)) ||
                    (o.city && o.city.toLowerCase().includes(q));
                  if (!matchesSearch) return false;
                }

                if (orderTab !== "All") {
                  if (orderTab === "Today") {
                    const today = new Date().toLocaleDateString();
                    const orderDate = new Date(o.created_at).toLocaleDateString();
                    if (today !== orderDate) return false;
                  } else if (orderTab === "Paid") {
                    if ((o.paymentStatus || (o.paymentMethod === 'cod' ? 'Pending' : 'Paid')).toLowerCase() !== 'paid') return false;
                  } else if (orderTab === "COD") {
                    if ((o.paymentMethod || '').toLowerCase() !== 'cod') return false;
                  } else if (orderTab === "Pending") {
                    if ((o.status || '').toLowerCase() !== 'pending') return false;
                  } else if (orderTab === "Cancelled") {
                    if ((o.status || '').toLowerCase() !== 'cancelled') return false;
                  } else if (orderTab === "Delivered") {
                    if ((o.status || '').toLowerCase() !== 'delivered') return false;
                  }
                }
                return true;
              });
              const pillTabs = ["All", "Today", "Paid", "COD", "Pending", "Cancelled", "Delivered"];
              
              const getStatusColor = (status) => {
                switch(status?.toLowerCase()) {
                  case 'confirmed': return "bg-blue-100 text-blue-700";
                  case 'out for delivery': return "bg-sky-100 text-sky-700";
                  case 'delivered': return "bg-brand-green/20 text-brand-green";
                  case 'cancelled': return "bg-red-100 text-red-700";
                  case 'in transit': return "bg-blue-100 text-blue-700";
                  case 'packing': return "bg-orange-100 text-orange-700";
                  default: return "bg-brand-card text-brand-dark";
                }
              };

              const getPaymentColor = (status) => {
                switch(status?.toLowerCase()) {
                  case 'pending': return "bg-[#fdf4e7] text-[#a5702b] border-[#f5debe]";
                  case 'paid': return "bg-[#e8f6ed] text-[#349e7b] border-[#c8e7d5]";
                  case 'failed': return "bg-[#fbeaea] text-[#d15858] border-[#f5cdcd]";
                  default: return "bg-brand-card text-brand-dark border-brand-card/60";
                }
              };

              const handleBulkTrash = async () => {
                if (!window.confirm(`Move ${selectedOrders.length} orders to trash?`)) return;
                try {
                  await Promise.all(selectedOrders.map(id => 
                    fetchAuth(`${API_URL}/api/admin/orders/${id}/soft-delete`, { method: "PUT" })
                  ));
                  
                  // Optimistically update the UI
                  setOrders(orders.map(o => selectedOrders.includes(o.id || o._id) ? { ...o, is_deleted: true } : o));
                  setSelectedOrders([]);
                } catch (err) {
                  console.error("Bulk trash error:", err);
                  alert("Error moving some orders to trash");
                }
              };

              const handleExportCSV = () => {
                if (filteredOrders.length === 0) return;
                const headers = ["Order Number", "Customer Name", "Phone", "City", "State", "Payment Method", "Payment Status", "Order Status", "Total Amount", "Date"];
                const rows = filteredOrders.map(o => [
                  o.order_number || "",
                  o.name || "",
                  o.phone || "",
                  o.city || "",
                  o.state || "",
                  o.paymentMethod || "",
                  o.paymentStatus || (o.paymentMethod === 'cod' ? 'Pending' : 'Paid'),
                  o.status || "Pending",
                  o.totalPrice || 0,
                  new Date(o.created_at).toLocaleDateString()
                ]);
                
                const csvContent = [
                  headers.join(","),
                  ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
                ].join("\n");
                
                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `orders_export_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              };

              const handleShipOrder = async (orderId) => {
                if (!window.confirm("Ship this order with Delhivery?")) return;
                try {
                  const res = await fetchAuth(`${API_URL}/api/admin/orders/${orderId}/status`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "shipped" })
                  });
                  if (res.ok) {
                    alert("Order shipped successfully!");
                    fetchDashboardData();
                  } else {
                    const err = await res.json();
                    alert(err.detail || "Error shipping order");
                  }
                } catch (err) {
                  alert("Network error while shipping order.");
                }
              };

              const handleSchedulePickup = async (orderId) => {
                if (!window.confirm("Schedule pickup with Delhivery?")) return;
                try {
                  const res = await fetchAuth(`${API_URL}/api/admin/orders/${orderId}/pickup`, { method: "POST" });
                  if (res.ok) {
                    alert("Pickup scheduled successfully!");
                    fetchDashboardData();
                  } else {
                    const err = await res.json();
                    alert(err.detail || "Error scheduling pickup");
                  }
                } catch (err) {
                  alert("Network error while scheduling pickup.");
                }
              };

              const handleGetLabel = async (orderId) => {
                try {
                  const res = await fetchAuth(`${API_URL}/api/admin/orders/${orderId}/label`);
                  if (res.ok) {
                    const data = await res.json();
                    if (data.url) {
                      window.open(data.url, '_blank');
                    } else if (data.packages && data.packages.length > 0) {
                      window.open(data.packages[0].pdf_download_link, '_blank');
                    } else {
                      alert("Label URL not found in response.");
                    }
                  } else {
                    const err = await res.json();
                    alert(err.detail || "Error fetching label");
                  }
                } catch (err) {
                  alert("Network error while fetching label.");
                }
              };

              const handleCancelShipment = async (orderId) => {
                if (!window.confirm("Cancel this shipment? This cannot be undone.")) return;
                try {
                  const res = await fetchAuth(`${API_URL}/api/admin/orders/${orderId}/cancel-shipment`, { method: "POST" });
                  if (res.ok) {
                    alert("Shipment cancelled successfully!");
                    fetchDashboardData();
                  } else {
                    const err = await res.json();
                    alert(err.detail || "Error cancelling shipment");
                  }
                } catch (err) {
                  alert("Network error while cancelling shipment.");
                }
              };

              return (
                <div className="space-y-6">
                  {/* Top Header Section */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-medium text-brand-dark mb-1">Orders</h2>
                      <p className="text-xs sm:text-sm text-brand-grey">{filteredOrders.length} orders • Manage the full order lifecycle</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById("order-search-input")?.focus()}
                        className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium border-brand-card/60 bg-white hover:bg-brand-bg transition-colors"
                      >
                        <Filter size={14} /> Filters
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium border-brand-card/60 bg-white hover:bg-brand-bg transition-colors"
                      >
                        <Download size={14} /> Export CSV
                      </Button>
                      <Button 
                        onClick={() => setShowManualOrderModal(true)}
                        className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium bg-[#3f312b] text-white hover:bg-black transition-colors"
                      >
                        New order
                      </Button>
                    </div>
                  </div>

                  {/* Main Table Container */}
                  <div className="bg-white border border-brand-card/40 rounded-2xl shadow-sm overflow-hidden">
                    {/* Toolbar / Bulk Actions */}
                    {selectedOrders.length > 0 ? (
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 border-b border-brand-card/30 gap-4 bg-[#FAF8F5]">
                        <div className="flex items-center gap-6">
                          <span className="font-semibold text-brand-dark text-sm">{selectedOrders.length} selected</span>
                          <div className="flex items-center gap-4">
                            <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-brand-dark hover:text-black transition-colors">
                              <Printer size={14} /> Print
                            </button>
                            <button onClick={handleBulkTrash} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                              <Trash2 size={14} /> Trash
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedOrders([])} 
                          className="flex items-center gap-1.5 text-xs font-semibold text-brand-dark hover:text-brand-grey transition-colors"
                        >
                          <X size={14} /> Clear Selection
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 border-b border-brand-card/30 gap-4">
                        <div className="flex gap-1 bg-[#F9F7F5] p-1 rounded-full overflow-x-auto w-full lg:w-auto">
                          {pillTabs.map(tab => (
                            <button 
                              key={tab}
                              onClick={() => setOrderTab(tab)}
                              className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-colors ${
                                orderTab === tab 
                                  ? "bg-white text-brand-dark shadow-sm" 
                                  : "text-brand-grey hover:text-brand-dark"
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                        
                        <div className="relative w-full lg:w-64 flex-shrink-0">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grey/60" />
                          <input 
                            id="order-search-input"
                            type="text" 
                            placeholder="Search orders..." 
                            value={searchOrderQuery}
                            onChange={(e) => setSearchOrderQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-brand-card/60 rounded-full text-xs sm:text-sm focus:outline-none focus:border-brand-dark transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                        <thead>
                          <tr className="border-b border-brand-card/30 text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-grey font-bold bg-[#FAF8F5]/50">
                            <th className="py-4 px-6 w-10">
                              {filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length ? (
                                <CheckCircle size={16} fill="#333" color="white" className="cursor-pointer" onClick={() => setSelectedOrders([])} />
                              ) : (
                                <Circle size={16} className="text-[#A0A0A0] cursor-pointer hover:text-brand-dark transition-colors" onClick={() => setSelectedOrders(filteredOrders.map(o => o.id || o._id))} />
                              )}
                            </th>
                            <th className="py-4 px-4">ORDER</th>
                            <th className="py-4 px-4">CUSTOMER</th>
                            <th className="py-4 px-4">PRODUCT</th>
                            <th className="py-4 px-4">QTY</th>
                            <th className="py-4 px-4">PAYMENT</th>
                            <th className="py-4 px-4">STATUS</th>
                            <th className="py-4 px-4">AMOUNT</th>
                            <th className="py-4 px-6">DATE</th>
                            <th className="py-4 px-4">FULFILLMENT</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs sm:text-sm">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="py-12 text-center text-brand-grey">No orders found.</td>
                            </tr>
                          ) : (
                            filteredOrders.map((o, idx) => {
                              // Derive some statuses if not strictly mapped to the design, just to make it look good like the image
                              let displayStatus = o.status;
                              if(displayStatus === 'pending') displayStatus = 'Confirmed';
                              else if(displayStatus === 'shipped') displayStatus = 'Out For Delivery';
                              else if(displayStatus === 'cancelled') displayStatus = 'Cancelled';
                              else if(displayStatus === 'delivered') displayStatus = 'Delivered';
                              else displayStatus = 'Confirmed'; // Fallback

                              let paymentMethodDisplay = "Razorpay";
                              if (o.paymentMethod === 'cod') paymentMethodDisplay = 'COD';
                              else if (o.paymentMethod === 'prepaid') paymentMethodDisplay = activeGateway ? (activeGateway.charAt(0).toUpperCase() + activeGateway.slice(1)) : 'Razorpay';
                              else if (o.paymentMethod) paymentMethodDisplay = o.paymentMethod.charAt(0).toUpperCase() + o.paymentMethod.slice(1);

                              let paymentStatusDisplay = o.paymentStatus;
                              if (!paymentStatusDisplay) {
                                paymentStatusDisplay = (o.paymentMethod === 'cod') ? 'Pending' : 'Paid';
                              } else {
                                paymentStatusDisplay = paymentStatusDisplay.charAt(0).toUpperCase() + paymentStatusDisplay.slice(1);
                              }
                              
                              const isSelected = selectedOrders.includes(o.id || o._id);
                              
                              const toggleSelection = () => {
                                if (isSelected) {
                                  setSelectedOrders(selectedOrders.filter(id => id !== (o.id || o._id)));
                                } else {
                                  setSelectedOrders([...selectedOrders, (o.id || o._id)]);
                                }
                              };

                              return (
                                <tr key={(o.id || o._id)} className={`border-b border-brand-card/20 hover:bg-brand-bg/40 transition-colors ${isSelected ? 'bg-[#FAF8F5]' : 'bg-white'}`}>
                                  <td className="py-4 px-6">
                                    {isSelected ? (
                                      <CheckCircle size={16} fill="#333" color="white" className="cursor-pointer" onClick={toggleSelection} />
                                    ) : (
                                      <Circle size={16} className="text-[#A0A0A0] cursor-pointer hover:text-brand-dark transition-colors" onClick={toggleSelection} />
                                    )}
                                  </td>
                                  <td className="py-4 px-4 font-semibold text-brand-dark">
                                    {o.order_number}
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="font-semibold text-brand-dark">{o.name}</div>
                                    <div className="text-[10px] sm:text-xs text-brand-grey mt-0.5">{o.phone} • {o.city}</div>
                                  </td>
                                  <td className="py-4 px-4 text-brand-grey">
                                    {o.items && o.items.length > 0 ? o.items[0].name : "Unknown Product"}
                                    {o.items && o.items.length > 1 && ` +${o.items.length - 1} more`}
                                  </td>
                                  <td className="py-4 px-4 text-brand-dark font-medium text-center sm:text-left">
                                    {o.items ? o.items.reduce((acc, item) => acc + item.quantity, 0) : 1}
                                  </td>
                                  <td className="py-4 px-4 align-top">
                                    <div className="text-brand-dark mb-1.5 text-[13px] font-medium">{paymentMethodDisplay}</div>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-medium border ${getPaymentColor(paymentStatusDisplay)}`}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
                                      {paymentStatusDisplay}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${getStatusColor(displayStatus)}`}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                                      {displayStatus}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 font-bold text-brand-dark">
                                    ₹{(Number(o.totalPrice) || 0).toLocaleString("en-IN")}
                                  </td>
                                  <td className="py-4 px-6 text-brand-grey">
                                    {o.created_at ? new Date(o.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' }) : "Today"}
                                  </td>
                                  <td className="py-4 px-4">
                                    {o.tracking_number ? (
                                      <div className="flex flex-col gap-2 relative">
                                        <div className="flex items-center gap-3">
                                          <span className="px-2.5 py-0.5 rounded-md border border-[#cbd8d2] text-[10px] font-bold text-[#4d7d6f] bg-[#e6edeb]">
                                            DELHIVERY
                                          </span>
                                          <span className="text-[10px] font-bold text-[#184976]">
                                            {o.tracking_number}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-[#6b6b6b] font-medium">
                                          Status: <span className="text-[#184976] font-bold">Manifested</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <button 
                                            onClick={() => handleSchedulePickup(o.id || o._id)}
                                            className="px-3 py-1 rounded-full bg-[#7a8a72] text-white text-[9px] font-bold tracking-wider hover:bg-[#687661] transition-colors"
                                          >
                                            PICKUP
                                          </button>
                                          <button 
                                            onClick={() => handleGetLabel(o.id || o._id)}
                                            className="px-3 py-1 rounded-full border border-[#e8dccb] bg-white text-[#b8602c] text-[9px] font-bold tracking-wider flex items-center gap-1.5 hover:bg-brand-bg transition-colors"
                                          >
                                            <Printer size={10} className="text-[#7a8a72]" /> LABEL
                                          </button>
                                          <button 
                                            onClick={() => handleCancelShipment(o.id || o._id)}
                                            className="px-3 py-1 rounded-full bg-[#fdf6ec] text-[#b8602c] text-[9px] font-bold tracking-wider hover:bg-[#ffeac4] transition-colors"
                                          >
                                            CANCEL
                                          </button>
                                        </div>
                                        <button 
                                          onClick={async () => {
                                            if(window.confirm('Move this order to trash?')) {
                                              await fetchAuth(`${API_URL}/api/admin/orders/${o.id || o._id}/soft-delete`, { method: 'PUT' });
                                              fetchDashboardData();
                                            }
                                          }}
                                          className="absolute right-0 -bottom-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                          title="Delete Order"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => handleShipOrder(o.id || o._id)}
                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#3d312c] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#2c221e] transition-colors shadow-sm"
                                      >
                                        <Truck size={12} /> SHIP ORDER
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeTab === "inventory" && (
              <InventoryTab 
                productsList={productsList} 
                inventoryList={inventoryList} 
                inventoryHistory={inventoryHistory} 
                API_URL={API_URL} 
                fetchAuth={fetchAuth} 
                fetchDashboardData={fetchDashboardData}
              />
            )}

            {activeTab === "payments" && (
              <PaymentsTab orders={orders} />
            )}


            {activeTab === "reports" && (
              <ReportsTab 
                orders={orders} 
                productsList={productsList} 
                inventoryList={inventoryList} 
                usersList={usersList} 
              />
            )}

            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-medium text-brand-dark mb-1">Products</h2>
                    <p className="text-xs sm:text-sm text-brand-grey">{productsList.length} products • Manage your store catalog</p>
                  </div>
                  <Button variant="primary" onClick={handleAddNewProductClick} className="text-xs py-2 px-4 bg-brand-dark text-white hover:bg-black flex items-center gap-1.5 shadow-sm rounded-full h-[36px]">
                    <Plus size={14} /> Add Product
                  </Button>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-medium text-brand-dark mb-1">
                      {showDeletedUsers ? "Deleted Accounts" : "Customers"}
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-grey">{filteredUsers.length} accounts • View and manage registered users</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowDeletedUsers(!showDeletedUsers)} className="text-xs py-2 px-4 rounded-full border border-brand-card/60 bg-white hover:bg-brand-bg transition shadow-sm h-[36px]">
                    {showDeletedUsers ? "Show Active Users" : "Show Deleted Users"}
                  </Button>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-medium text-brand-dark mb-1">Coupons</h2>
                    <p className="text-xs sm:text-sm text-brand-grey">{couponsList.length} active codes • Manage discounts and promotions</p>
                  </div>
                  <Button onClick={handleAddNewCouponClick} className="text-xs py-2 px-4 bg-brand-dark text-white hover:bg-black rounded-full shadow-sm flex items-center gap-1.5 h-[36px]">
                    <Plus size={14} /> Create Coupon
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-medium text-brand-dark mb-1">Integrations</h2>
                    <p className="text-xs sm:text-sm text-brand-grey">Configure third-party APIs and gateways</p>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Global Online Payment Toggle & Active Gateway Selector */}
                  <div className="p-5 bg-brand-bg/50 border border-brand-card/45 rounded-2xl space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-brand-card/30 pb-2">
                      <h4 className="font-serif text-sm font-semibold text-brand-dark">Online Payment Settings</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onlinePaymentEnabled}
                          onChange={(e) => setOnlinePaymentEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <span className="mr-2 text-[11px] uppercase tracking-wider font-bold text-brand-grey">
                          Online Payments: <span className={onlinePaymentEnabled ? "text-brand-green" : "text-red-500"}>{onlinePaymentEnabled ? "Active" : "Disabled"}</span>
                        </span>
                        <div className="w-8 h-4 bg-brand-card/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand-dark relative"></div>
                      </label>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-xs text-brand-dark">Active Payment Gateway</label>
                      <select
                        value={activeGateway}
                        onChange={(e) => setActiveGateway(e.target.value)}
                        className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                      >
                        <option value="cashfree">Cashfree Payment Gateway</option>
                        <option value="razorpay">Razorpay Payment Gateway</option>
                      </select>
                    </div>
                  </div>

                  {/* Cashfree Segment */}
                  <div className="p-5 bg-brand-bg/50 border border-brand-card/45 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-brand-card/30 pb-2">
                      <h4 className="font-serif text-sm font-semibold text-brand-dark">Cashfree Credentials</h4>
                    </div>
                    
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

                  {/* Razorpay Segment */}
                  <div className="p-5 bg-brand-bg/50 border border-brand-card/45 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-brand-card/30 pb-2">
                      <h4 className="font-serif text-sm font-semibold text-brand-dark">Razorpay Credentials</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold block mb-1 text-xs text-brand-dark">Razorpay Key ID</label>
                        <input
                          type="text"
                          value={razorpayKeyId}
                          onChange={(e) => setRazorpayKeyId(e.target.value)}
                          placeholder="e.g. rzp_test_..."
                          className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1 text-xs text-brand-dark">Razorpay Environment Mode</label>
                        <select
                          value={razorpayEnv}
                          onChange={(e) => setRazorpayEnv(e.target.value)}
                          className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                        >
                          <option value="sandbox">Sandbox (Testing)</option>
                          <option value="production">Production (Live)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-xs text-brand-dark">Razorpay Key Secret</label>
                      <div className="relative">
                        <input
                          type={showRazorpaySecret ? "text" : "password"}
                          value={razorpayKeySecret}
                          onChange={(e) => setRazorpayKeySecret(e.target.value)}
                          placeholder="••••••••••••••••••••••••••••••••"
                          className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs pr-16"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-brand-grey hover:text-brand-dark"
                        >
                          {showRazorpaySecret ? "Hide" : "View"}
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

                  {/* Social Media Links Segment */}
                  <div className="p-5 bg-brand-bg/50 border border-brand-card/45 rounded-2xl space-y-4">
                    <h4 className="font-serif text-sm font-semibold text-brand-dark border-b border-brand-card/30 pb-2">Social Media Links</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold block mb-1 text-xs text-brand-dark">Instagram URL</label>
                        <input
                          type="url"
                          value={socialInstagram}
                          onChange={(e) => setSocialInstagram(e.target.value)}
                          placeholder="https://instagram.com/luscentglow"
                          className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1 text-xs text-brand-dark">Facebook URL</label>
                        <input
                          type="url"
                          value={socialFacebook}
                          onChange={(e) => setSocialFacebook(e.target.value)}
                          placeholder="https://facebook.com/luscentglow"
                          className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1 text-xs text-brand-dark">Twitter / X URL</label>
                        <input
                          type="url"
                          value={socialTwitter}
                          onChange={(e) => setSocialTwitter(e.target.value)}
                          placeholder="https://twitter.com/luscentglow"
                          className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1 text-xs text-brand-dark">YouTube URL</label>
                        <input
                          type="url"
                          value={socialYoutube}
                          onChange={(e) => setSocialYoutube(e.target.value)}
                          placeholder="https://youtube.com/@luscentglow"
                          className="w-full p-2.5 bg-white border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                        />
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

            {activeTab === "reviews" && (() => {
              const filteredReviews = reviewsList.filter((rev) => {
                const matchesSearch = (
                  (rev.name || "").toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
                  (rev.title || "").toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
                  (rev.comment || "").toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
                  (rev.product_id || "").toLowerCase().includes(reviewSearchQuery.toLowerCase())
                );
                const matchesRating = reviewRatingFilter === "all" || rev.rating === parseInt(reviewRatingFilter);
                return matchesSearch && matchesRating;
              });

              return (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-brand-dark">Product Reviews</h3>
                      <p className="text-sm text-brand-grey">Manage, create, update and delete customer reviews across products.</p>
                    </div>
                    <Button 
                      variant="primary" 
                      className="flex items-center gap-2 bg-brand-dark text-white hover:bg-black py-2.5 px-5 rounded-xl text-xs font-semibold"
                      onClick={handleOpenAddReviewModal}
                    >
                      <Plus size={16} /> Add Review
                    </Button>
                  </div>

                  {/* Search and Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Search by reviewer, title, comment or product ID..."
                        value={reviewSearchQuery}
                        onChange={(e) => setReviewSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 bg-brand-bg/50 border border-brand-card/40 rounded-xl text-xs focus:outline-none focus:border-brand-dark"
                      />
                    </div>
                    <select
                      value={reviewRatingFilter}
                      onChange={(e) => setReviewRatingFilter(e.target.value)}
                      className="w-full sm:w-44 px-3 py-2 bg-brand-bg/50 border border-brand-card/40 rounded-xl text-xs focus:outline-none focus:border-brand-dark cursor-pointer"
                    >
                      <option value="all">All Star Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>

                  <div className="bg-white rounded-3xl border border-brand-card/50 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-brand-bg/50 border-b border-brand-card/50 text-brand-dark/70 uppercase text-[10px] font-bold tracking-wider">
                          <tr>
                            <th className="p-5 w-48">Date</th>
                            <th className="p-5 w-32">Product ID</th>
                            <th className="p-5 w-40">User</th>
                            <th className="p-5 w-24">Rating</th>
                            <th className="p-5">Title & Comment</th>
                            <th className="p-5 w-24 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-card/30">
                          {filteredReviews.map((review) => (
                            <tr key={review._id || review.id} className="hover:bg-brand-bg/30 transition">
                              <td className="p-5 text-brand-grey whitespace-nowrap">
                                {review.created_at ? new Date(review.created_at.endsWith("Z") ? review.created_at : review.created_at + "Z").toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "N/A"}
                              </td>
                              <td className="p-5 font-medium text-brand-dark">
                                <span className="inline-block px-2.5 py-1 bg-brand-bg rounded-lg text-xs font-semibold border border-brand-card/30">
                                  {review.product_id}
                                </span>
                              </td>
                              <td className="p-5 text-brand-grey font-semibold">
                                {review.name || "Anonymous"}
                              </td>
                              <td className="p-5 font-bold text-yellow-500">
                                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} ({review.rating})
                              </td>
                              <td className="p-5 text-brand-grey whitespace-normal min-w-[300px]">
                                <strong className="text-brand-dark block text-xs mb-0.5">{review.title}</strong>
                                <span className="text-xs">{review.comment}</span>
                                {review.images && review.images.length > 0 && (
                                  <div className="flex gap-2 mt-2">
                                    {review.images.map((img, i) => (
                                      <div key={i} className="w-10 h-10 rounded-md overflow-hidden border border-brand-card/30">
                                        <img src={img} alt="Review attachment" className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="p-5 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleOpenEditReviewModal(review)}
                                    className="p-2 text-brand-dark hover:bg-brand-bg border border-brand-card/40 rounded-xl transition shadow-sm"
                                    title="Edit Review"
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review._id || review.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 border border-red-100 rounded-xl transition shadow-sm"
                                    title="Delete Review"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {filteredReviews.length === 0 && (
                            <tr>
                              <td colSpan="6" className="p-10 text-center text-brand-grey text-xs">
                                No reviews found matching your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}


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

            {/* Inquiries Tab */}
            {activeTab === "inquiries" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-medium text-brand-dark mb-1">Contact Inquiries</h2>
                    <p className="text-xs sm:text-sm text-brand-grey">{inquiriesList.length} inquiries • View messages submitted via the Contact Us form</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-brand-card/30 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="bg-brand-bg/50 border-b border-brand-card/30 text-brand-grey font-semibold uppercase tracking-wider text-[10px]">
                          <th className="p-5 w-48">Date</th>
                          <th className="p-5 w-48">Name</th>
                          <th className="p-5 w-48">Email</th>
                          <th className="p-5">Message</th>
                          <th className="p-5 w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-card/20">
                        {inquiriesList.map((inq) => (
                          <tr key={inq._id} className="hover:bg-brand-bg/30 transition">
                            <td className="p-5 text-brand-grey whitespace-nowrap">
                              {new Date(inq.created_at.endsWith("Z") ? inq.created_at : inq.created_at + "Z").toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                            </td>
                            <td className="p-5 font-medium text-brand-dark">
                              {inq.name}
                            </td>
                            <td className="p-5 text-brand-grey">
                              {inq.email}
                            </td>
                            <td className="p-5 text-brand-grey whitespace-normal min-w-[300px]">
                              {inq.message}
                            </td>
                            <td className="p-5 text-right">
                              <button
                                onClick={() => handleDeleteInquiry(inq._id)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 transition"
                                title="Delete Inquiry"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {inquiriesList.length === 0 && (
                          <tr>
                            <td colSpan="5" className="p-10 text-center text-brand-grey">
                              No inquiries found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit/Add Admin Review Dialog Modal */}
      <AnimatePresence>
        {showAdminReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] border border-brand-card/40 shadow-2xl max-w-md w-full flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-brand-card/40 p-6 flex-shrink-0">
                <h3 className="font-serif text-xl font-semibold text-brand-dark">
                  {editingAdminReview ? "Edit Product Review" : "Add Product Review"}
                </h3>
                <button onClick={() => setShowAdminReviewModal(false)} className="text-brand-grey hover:text-brand-dark p-1 rounded-full hover:bg-brand-bg transition">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveAdminReview} className="p-6 space-y-4 text-sm">
                <div>
                  <label className="font-semibold block mb-1">Target Product</label>
                  <select
                    value={adminReviewProductId}
                    onChange={(e) => setAdminReviewProductId(e.target.value)}
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs cursor-pointer font-medium"
                  >
                    {productsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                    {productsList.length === 0 && (
                      <>
                        <option value="sunscreen">Solar Radiance Sunscreen (sunscreen)</option>
                        <option value="face-wash">Luminous Cleanse Face Wash (face-wash)</option>
                        <option value="serum">Hydra Glow Serum (serum)</option>
                        <option value="combo">Complete Glow Set (combo)</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Reviewer Name</label>
                  <input
                    type="text"
                    required
                    value={adminReviewName}
                    onChange={(e) => setAdminReviewName(e.target.value)}
                    placeholder="e.g. Ananya S."
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={adminReviewRating}
                    onChange={(e) => setAdminReviewRating(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs font-semibold cursor-pointer"
                  >
                    <option value="5">★★★★★ (5 - Excellent)</option>
                    <option value="4">★★★★☆ (4 - Good)</option>
                    <option value="3">★★★☆☆ (3 - Average)</option>
                    <option value="2">★★☆☆☆ (2 - Poor)</option>
                    <option value="1">★☆☆☆☆ (1 - Terrible)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={adminReviewTitle}
                    onChange={(e) => setAdminReviewTitle(e.target.value)}
                    placeholder="e.g. Absolutely loved the glow!"
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Comment</label>
                  <textarea
                    required
                    rows="3"
                    value={adminReviewComment}
                    onChange={(e) => setAdminReviewComment(e.target.value)}
                    placeholder="Detailed feedback about the product experience..."
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark resize-none text-xs"
                  ></textarea>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Images (Optional, up to 3)</label>
                  <div className="flex flex-wrap gap-3 mb-1">
                    {adminReviewImages.map((imgStr, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-xl border border-brand-card/50 overflow-hidden group">
                        <img src={imgStr} alt="Review" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAdminReviewImages(adminReviewImages.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {adminReviewImages.length < 3 && (
                      <label className="w-14 h-14 rounded-xl border-2 border-dashed border-brand-card flex flex-col items-center justify-center text-brand-grey hover:bg-brand-bg/50 cursor-pointer transition">
                        <Plus size={14} />
                        <span className="text-[9px] font-bold mt-0.5">Add</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          multiple
                          onChange={handleAdminReviewImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowAdminReviewModal(false)} className="text-xs">Cancel</Button>
                  <Button type="submit" variant="primary" disabled={submittingAdminReview} className="text-xs font-bold bg-brand-dark text-white hover:bg-black">
                    {submittingAdminReview ? "Saving..." : (editingAdminReview ? "Update Review" : "Save Review")}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

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

                {/* Product FAQs */}
                <div className="md:col-span-2 mt-4 mb-2">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <label className="font-semibold block">Product FAQs</label>
                      <p className="text-xs text-brand-grey">Add frequently asked questions for this specific product.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addProdFAQ}
                      className="text-[10px] uppercase tracking-wider font-bold text-brand-accent hover:text-brand-dark transition flex items-center gap-1 bg-brand-accent/10 hover:bg-brand-accent/20 px-3 py-1.5 rounded-lg"
                    >
                      <Plus size={12} /> Add FAQ
                    </button>
                  </div>
                  {prodFaqs.length === 0 ? (
                    <div className="p-6 bg-brand-bg/50 border border-brand-card border-dashed rounded-xl text-center">
                      <p className="text-sm text-brand-dark/60 font-medium">No FAQs added yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {prodFaqs.map((faq, idx) => (
                        <div key={idx} className="p-4 bg-white border border-brand-card rounded-xl shadow-sm space-y-3 relative group transition-all hover:border-brand-dark/30">
                          <div className="flex justify-between items-center border-b border-brand-card/30 pb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-grey flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark">{idx + 1}</span>
                              FAQ Entry
                            </span>
                            <button
                              type="button"
                              onClick={() => removeProdFAQ(idx)}
                              className="text-[#c24b4b] hover:bg-[#c24b4b]/10 p-1.5 rounded-lg transition opacity-50 group-hover:opacity-100"
                              title="Remove FAQ"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-3 pt-1">
                            <div>
                              <label className="text-[11px] font-bold uppercase text-brand-grey/80 block mb-1.5">Question</label>
                              <input
                                type="text"
                                placeholder="e.g. Is this suitable for all skin types?"
                                value={faq.question}
                                onChange={(e) => updateProdFAQ(idx, "question", e.target.value)}
                                className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-lg text-sm focus:outline-none focus:border-brand-dark focus:bg-white transition"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold uppercase text-brand-grey/80 block mb-1.5">Answer</label>
                              <textarea
                                placeholder="e.g. Yes, it is dermatologically tested and suitable for sensitive skin."
                                value={faq.answer}
                                onChange={(e) => updateProdFAQ(idx, "answer", e.target.value)}
                                rows={2}
                                className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-lg text-sm focus:outline-none focus:border-brand-dark focus:bg-white resize-none transition"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* ═══════ MANUAL ORDER MODAL ═══════ */}
      <AnimatePresence>
        {showManualOrderModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-[#FAF8F5] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-brand-card/20"
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}>
              
              <div className="px-6 py-5 border-b border-brand-card/30 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="font-serif text-xl font-semibold text-brand-dark">Create Manual Order</h3>
                <button onClick={() => setShowManualOrderModal(false)} className="p-2 bg-brand-bg rounded-full text-brand-grey hover:text-brand-dark transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-grey uppercase tracking-wider mb-2">Customer Name *</label>
                    <input type="text" value={manualOrderName} onChange={e => setManualOrderName(e.target.value)} className="w-full px-4 py-3 bg-white border border-brand-card/60 rounded-xl focus:outline-none focus:border-brand-dark" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-grey uppercase tracking-wider mb-2">Phone Number *</label>
                    <input type="text" value={manualOrderPhone} onChange={e => setManualOrderPhone(e.target.value)} className="w-full px-4 py-3 bg-white border border-brand-card/60 rounded-xl focus:outline-none focus:border-brand-dark" placeholder="9876543210" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-brand-grey uppercase tracking-wider mb-2">Address *</label>
                    <textarea rows={2} value={manualOrderAddress} onChange={e => setManualOrderAddress(e.target.value)} className="w-full px-4 py-3 bg-white border border-brand-card/60 rounded-xl focus:outline-none focus:border-brand-dark resize-none" placeholder="123 Main St, Apartment 4B" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-grey uppercase tracking-wider mb-2">City *</label>
                    <input type="text" value={manualOrderCity} onChange={e => setManualOrderCity(e.target.value)} className="w-full px-4 py-3 bg-white border border-brand-card/60 rounded-xl focus:outline-none focus:border-brand-dark" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-grey uppercase tracking-wider mb-2">State *</label>
                    <input type="text" value={manualOrderState} onChange={e => setManualOrderState(e.target.value)} className="w-full px-4 py-3 bg-white border border-brand-card/60 rounded-xl focus:outline-none focus:border-brand-dark" placeholder="Maharashtra" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-grey uppercase tracking-wider mb-2">Pincode *</label>
                    <input type="text" value={manualOrderPincode} onChange={e => setManualOrderPincode(e.target.value)} className="w-full px-4 py-3 bg-white border border-brand-card/60 rounded-xl focus:outline-none focus:border-brand-dark" placeholder="400001" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-brand-grey uppercase tracking-wider mb-2">Payment Method *</label>
                    <select value={manualOrderPaymentMethod} onChange={e => setManualOrderPaymentMethod(e.target.value)} className="w-full px-4 py-3 bg-white border border-brand-card/60 rounded-xl focus:outline-none focus:border-brand-dark">
                      <option value="cod">Cash on Delivery (COD)</option>
                      <option value="prepaid">Prepaid</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-card/30">
                  <h4 className="text-sm font-semibold text-brand-dark mb-4">Select Products</h4>
                  <div className="space-y-3">
                    {productsList.map(prod => {
                      const qty = manualOrderItems[prod.id || prod._id] || 0;
                      return (
                        <div key={prod.id || prod._id} className="flex items-center justify-between p-3 bg-white border border-brand-card/40 rounded-xl hover:border-brand-card transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-brand-card/30 flex-shrink-0">
                              <img src={prod.images?.[0] || '/images/sunscreen.png'} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-brand-dark">{prod.name}</div>
                              <div className="text-[10px] text-brand-grey font-semibold">₹{prod.price}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-[#FAF8F5] px-2 py-1 rounded-lg border border-brand-card/30">
                            <button onClick={() => setManualOrderItems(prev => ({...prev, [prod.id || prod._id]: Math.max(0, qty - 1)}))} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white transition-colors text-brand-dark">-</button>
                            <span className="text-xs font-bold text-brand-dark w-4 text-center">{qty}</span>
                            <button onClick={() => setManualOrderItems(prev => ({...prev, [prod.id || prod._id]: qty + 1}))} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white transition-colors text-brand-dark">+</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-white border-t border-brand-card/30 flex justify-end gap-3 sticky bottom-0 z-10">
                <Button onClick={() => setShowManualOrderModal(false)} variant="outline" className="py-2.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-brand-grey border-brand-card/60 hover:bg-brand-bg transition-colors">
                  Cancel
                </Button>
                <Button onClick={handleManualOrderSubmit} disabled={submittingManualOrder} className="py-2.5 px-6 rounded-xl bg-brand-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-md">
                  {submittingManualOrder ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
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

const ReviewsTab = ({ API_URL, fetchAuth }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  
  const [formData, setFormData] = useState({
    product_id: "",
    user_name: "",
    rating: 5,
    comment: ""
  });

  const fetchReviews = async () => {
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenModal = (review = null) => {
    if (review) {
      setEditingReview(review);
      setFormData({
        product_id: review.product_id,
        user_name: review.user_name,
        rating: review.rating,
        comment: review.comment
      });
    } else {
      setEditingReview(null);
      setFormData({
        product_id: "",
        user_name: "",
        rating: 5,
        comment: ""
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingReview 
        ? `${API_URL}/api/admin/reviews/${editingReview._id || editingReview.id}`
        : `${API_URL}/api/admin/reviews`;
      
      const method = editingReview ? "PUT" : "POST";
      
      const res = await fetchAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        fetchReviews();
        setShowModal(false);
      } else {
        alert("Failed to save review");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving review");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchReviews();
      } else {
        alert("Failed to delete review");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10 text-brand-grey text-sm">Loading reviews...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-brand-card/30 pb-4">
        <div>
          <h3 className="font-serif text-2xl font-bold text-brand-dark">Customer Reviews</h3>
          <p className="text-xs text-brand-grey mt-1">Manage and moderate product reviews</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="py-2 px-4 bg-brand-dark text-white rounded-xl text-xs font-semibold hover:bg-black flex items-center gap-2">
          <Plus size={16} /> Add Review
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-brand-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-bg/50 border-b border-brand-card">
              <tr>
                <th className="px-6 py-4 font-semibold text-brand-dark uppercase text-[10px] tracking-wider">Customer</th>
                <th className="px-6 py-4 font-semibold text-brand-dark uppercase text-[10px] tracking-wider">Product ID</th>
                <th className="px-6 py-4 font-semibold text-brand-dark uppercase text-[10px] tracking-wider">Rating</th>
                <th className="px-6 py-4 font-semibold text-brand-dark uppercase text-[10px] tracking-wider">Comment</th>
                <th className="px-6 py-4 font-semibold text-brand-dark uppercase text-[10px] tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold text-brand-dark uppercase text-[10px] tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-card/50">
              {reviews.map(review => (
                <tr key={review._id || review.id} className="hover:bg-brand-bg/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-brand-dark text-xs">{review.user_name}</div>
                    <div className="text-[10px] text-brand-grey">{review.user_email}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-brand-dark">{review.product_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex text-yellow-500">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[11px] text-brand-grey max-w-xs truncate">{review.comment}</td>
                  <td className="px-6 py-4 text-[11px] text-brand-grey">{new Date(review.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(review)} className="text-brand-dark hover:text-brand-grey transition p-1">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(review._id || review.id)} className="text-red-500 hover:text-red-700 transition p-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-brand-grey text-xs">No reviews found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-xl font-semibold text-brand-dark">{editingReview ? "Edit Review" : "Add Review"}</h3>
              <button onClick={() => setShowModal(false)} className="text-brand-grey hover:text-brand-dark"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-brand-grey uppercase tracking-wide mb-1.5 block">Product ID</label>
                <input required type="text" value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})} disabled={!!editingReview} className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-brand-grey uppercase tracking-wide mb-1.5 block">Customer Name</label>
                <input required type="text" value={formData.user_name} onChange={e => setFormData({...formData, user_name: e.target.value})} className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-brand-grey uppercase tracking-wide mb-1.5 block">Rating (1-5)</label>
                <input required type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-brand-grey uppercase tracking-wide mb-1.5 block">Comment</label>
                <textarea required value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark min-h-[100px]" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="py-2 px-4 border text-xs">Cancel</Button>
                <Button type="submit" className="py-2 px-5 bg-brand-dark text-white hover:bg-black text-xs font-semibold">Save Review</Button>
              </div>
            </form>
          </div>
        </div>
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

  // Homepage Banner & Announcement
  const homepageBanner = contentBlocks.homepage_banner || { title: "Powerful Protection. Effective Gentle Care.", subtitle: "We focus on formulation efficacy. Minimal products, maximal results." };
  const announcementBar = contentBlocks.announcement_bar || { text: "GOLD JEWELLERY 💰 \u2022 VISIT SHOWROOM TODAY \u2022 LIMITED TIME OFFER! GET 2% MAKING CHARGES ON GOLD JEWELLERY - SHOP NOW \u2022 TRUSTED JEWELLERY IN NADIAD ✨ \u2022" };

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
  
  // Auth Poster
  const authPoster = contentBlocks.auth_poster || { image: "/images/combo.png", tagline: "Powerful Protection. Effective Gentle Care.", description: "Formulated in clinical labs to protect and cleanse your skin without compromise." };

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
  const [localAnnouncement, setLocalAnnouncement] = useState(announcementBar);
  const [localTestimonials, setLocalTestimonials] = useState(testimonials);
  const [localFAQ, setLocalFAQ] = useState(faqCategories);
  const [localStory, setLocalStory] = useState(ourStory);
  const [localContact, setLocalContact] = useState(contactInfo);
  const [localAuthPoster, setLocalAuthPoster] = useState(authPoster);
  const [localBeforeAfter, setLocalBeforeAfter] = useState(contentBlocks.before_after || { beforeImage: "/before-skin.png", afterImage: "/after-skin.png" });
  const [showStoryPreview, setShowStoryPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  const tabs = [
    { id: "hero", label: "Hero Carousel Slides" },
    { id: "banner", label: "Homepage Banner" },
    { id: "testimonials", label: "Testimonials" },
    { id: "faq", label: "FAQ Categories" },
    { id: "story", label: "Our Story Page" },
    { id: "contact", label: "Contact Info" },
    { id: "auth", label: "Login / Signup Poster" },
    { id: "before_after", label: "Before & After Images" },
  ];

  // Sync with parent when contentBlocks change
  React.useEffect(() => {
    if (contentBlocks.hero_slides) setLocalHero(contentBlocks.hero_slides);
    if (contentBlocks.homepage_banner) setLocalBanner(contentBlocks.homepage_banner);
    if (contentBlocks.announcement_bar) setLocalAnnouncement(contentBlocks.announcement_bar);
    if (contentBlocks.testimonials) setLocalTestimonials(contentBlocks.testimonials);
    if (contentBlocks.faq_categories) setLocalFAQ(contentBlocks.faq_categories);
    if (contentBlocks.our_story) setLocalStory(contentBlocks.our_story);
    if (contentBlocks.contact_info) setLocalContact(contentBlocks.contact_info);
    if (contentBlocks.auth_poster) setLocalAuthPoster(contentBlocks.auth_poster);
    if (contentBlocks.before_after) setLocalBeforeAfter(contentBlocks.before_after);
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-3 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id 
                  ? "bg-brand-dark text-white shadow-md" 
                  : "bg-white border border-brand-card/40 text-brand-dark hover:bg-brand-bg"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-9 space-y-8">
          {/* ═══════ 1. HERO SLIDES ═══════ */}
          {activeTab === "hero" && (
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
      )}

      {/* ═══════ 2. HOMEPAGE BANNER ═══════ */}
      {activeTab === "banner" && (
        <div className={sectionCardClass}>
        <h4 className={sectionTitleClass}>Homepage "Our Essentials" Banner Text</h4>
        <div><label className={labelClass}>Heading</label><input type="text" value={localBanner.title} onChange={(e) => setLocalBanner({ ...localBanner, title: e.target.value })} className={inputClass} /></div>
        <div><label className={labelClass}>Subtitle</label><textarea rows={2} value={localBanner.subtitle} onChange={(e) => setLocalBanner({ ...localBanner, subtitle: e.target.value })} className={inputClass + " resize-none"} /></div>
        <div className="flex justify-end">
          <Button onClick={() => saveSection("homepage_banner", localBanner)} disabled={contentSaving} className="py-2.5 px-6 bg-brand-dark text-white hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl">
            {contentSaving ? "Saving..." : "Save Banner"}
          </Button>
        </div>

        <div className="mt-10 border-t border-brand-card/30 pt-8">
          <h4 className={sectionTitleClass}>Top Announcement Bar (Marquee)</h4>
          <div>
            <label className={labelClass}>Scrolling Text</label>
            <textarea rows={2} value={localAnnouncement.text} onChange={(e) => setLocalAnnouncement({ text: e.target.value })} className={inputClass + " resize-none"} />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => saveSection("announcement_bar", localAnnouncement)} disabled={contentSaving} className="py-2.5 px-6 bg-brand-dark text-white hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl">
              {contentSaving ? "Saving..." : "Save Announcement"}
            </Button>
          </div>
        </div>
      </div>
      )}

      {/* ═══════ 3. TESTIMONIALS ═══════ */}
      {activeTab === "testimonials" && (
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
      )}

      {/* ═══════ 4. FAQ CATEGORIES ═══════ */}
      {activeTab === "faq" && (
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
      )}

      {/* ═══════ 5. OUR STORY ═══════ */}
      {activeTab === "story" && (
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
      )}

      {/* ═══════ 6. CONTACT INFO ═══════ */}
      {activeTab === "contact" && (
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
      )}

      {/* ═══════ 7. AUTH POSTER ═══════ */}
      {activeTab === "auth" && (
        <div className={sectionCardClass}>
        <h4 className={sectionTitleClass}>Login / Signup Poster</h4>
        <div className="space-y-4">
          <ImageUploader 
            label="Poster Image" 
            value={localAuthPoster.image} 
            onChange={(url) => setLocalAuthPoster({ ...localAuthPoster, image: url })} 
          />
          <div><label className={labelClass}>Tagline</label><input type="text" value={localAuthPoster.tagline} onChange={(e) => setLocalAuthPoster({ ...localAuthPoster, tagline: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Description</label><textarea value={localAuthPoster.description} onChange={(e) => setLocalAuthPoster({ ...localAuthPoster, description: e.target.value })} className={inputClass} rows={3} /></div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => saveSection("auth_poster", localAuthPoster)} disabled={contentSaving} className="py-2.5 px-6 bg-brand-dark text-white hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl">
            {contentSaving ? "Saving..." : "Save Auth Poster"}
          </Button>
        </div>
      </div>
      )}

      {/* ═══════ 8. BEFORE & AFTER IMAGES ═══════ */}
      {activeTab === "before_after" && (
        <div className={sectionCardClass}>
          <h4 className={sectionTitleClass}>Before & After Images</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <ImageUploader 
              label="Before Image (Slider)" 
              value={localBeforeAfter.beforeImage} 
              onChange={(url) => setLocalBeforeAfter({ ...localBeforeAfter, beforeImage: url })} 
            />
            <ImageUploader 
              label="After Image (Slider)" 
              value={localBeforeAfter.afterImage} 
              onChange={(url) => setLocalBeforeAfter({ ...localBeforeAfter, afterImage: url })} 
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => saveSection("before_after", localBeforeAfter)} disabled={contentSaving} className="py-2.5 px-6 bg-brand-dark text-white hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl">
              {contentSaving ? "Saving..." : "Save Images"}
            </Button>
          </div>
        </div>
      )}



        </div> {/* End of Main Content Area */}
      </div> {/* End of Grid Layout */}
    </div>
  );
};

const InventoryTab = ({ productsList, inventoryList, inventoryHistory, API_URL, fetchAuth, fetchDashboardData }) => {
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [adjustAction, setAdjustAction] = useState("adjust");
  const [adjustPool, setAdjustPool] = useState("available");
  const [targetPool, setTargetPool] = useState("marketing");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);

  const handleAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustAmount || !adjustReason) return alert("Fill all fields");
    
    setAdjusting(true);
    try {
      const res = await fetchAuth(`${API_URL}/api/admin/inventory/${selectedProduct}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pool: adjustPool,
          target_pool: adjustAction === "move" ? targetPool : undefined,
          amount: parseInt(adjustAmount, 10),
          reason: adjustReason
        })
      });
      if (res.ok) {
        setShowAdjustModal(false);
        setAdjustAmount("");
        setAdjustReason("");
        setAdjustAction("adjust");
        fetchDashboardData();
      } else {
        const err = await res.json();
        alert(err.detail || "Error adjusting inventory");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-brand-card/30 pb-4">
        <div>
          <h3 className="font-serif text-2xl font-bold text-brand-dark">Inventory</h3>
          <p className="text-xs text-brand-grey mt-1">Combo-aware stock tracking with damaged and marketing pools.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowHistoryModal(true)} variant="outline" className="py-2 px-4 rounded-xl text-xs font-semibold text-brand-dark border-brand-card/60 bg-white hover:bg-brand-bg flex items-center gap-2">
            <Clock size={14} /> Stock history
          </Button>
          <Button onClick={() => setShowAdjustModal(true)} className="py-2 px-4 rounded-xl bg-brand-dark text-white text-xs font-semibold hover:bg-black shadow-sm flex items-center gap-2">
            <Plus size={14} /> Manual adjustment
          </Button>
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 flex gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
          <Boxes size={16} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-brand-dark">Combo logic</h4>
          <p className="text-xs text-brand-grey mt-1 leading-relaxed">
            Selling <span className="font-bold text-brand-dark">1 Combo</span> deducts <span className="font-bold text-brand-dark">1 Facewash</span> and <span className="font-bold text-brand-dark">1 Sunscreen</span> automatically. Cancellations before dispatch restore both.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsList.map(prod => {
          const inv = inventoryList.find(i => i.product_id === (prod.id || prod._id)) || { current: 0, available: 0, reserved: 0, marketing: 0, damaged: 0 };
          const isCombo = prod.id === "combo";
          
          return (
            <div key={prod.id || prod._id} className="bg-white border border-brand-card/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl border border-brand-card/30 overflow-hidden bg-brand-bg flex-shrink-0 relative">
                  <img src={prod.images?.[0] || "/images/sunscreen.png"} alt={prod.name} className="w-full h-full object-cover" />
                  {isCombo && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-dark line-clamp-1">{prod.name}</h4>
                  <div className="text-xs text-brand-grey mt-1">Value <span className="font-semibold text-brand-dark">₹{((inv.available || 0) * prod.price).toLocaleString()}</span></div>
                </div>
                {inv.available < 50 && (
                  <span className="ml-auto flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase">
                    <ShieldAlert size={10} /> Low
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-brand-bg/40 border border-brand-card/40 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-brand-grey uppercase tracking-wider mb-1">Current</div>
                  <div className="text-xl font-bold text-brand-dark">{inv.current}</div>
                </div>
                <div className="bg-green-50/50 border border-green-100 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-green-700/70 uppercase tracking-wider mb-1">Available</div>
                  <div className="text-xl font-bold text-green-600">{inv.available}</div>
                </div>
                <div className="bg-brand-bg/40 border border-brand-card/40 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-brand-grey uppercase tracking-wider mb-1">Reserved</div>
                  <div className="text-sm font-bold text-brand-dark mt-1">{inv.reserved}</div>
                </div>
                <div className="bg-brand-bg/40 border border-brand-card/40 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-brand-grey uppercase tracking-wider mb-1">Marketing</div>
                  <div className="text-sm font-bold text-brand-dark mt-1">{inv.marketing}</div>
                </div>
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-red-700/70 uppercase tracking-wider mb-1">Damaged</div>
                  <div className="text-sm font-bold text-red-600 mt-1">{inv.damaged}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => { setSelectedProduct(prod.id || prod._id); setShowAdjustModal(true); }} variant="outline" className="flex-1 py-2 text-xs font-bold border-brand-card text-brand-dark hover:bg-brand-bg rounded-xl">
                  Adjust
                </Button>
                <button onClick={() => { setHistoryProduct(prod.id || prod._id); setShowHistoryModal(true); }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-grey hover:text-brand-dark transition-colors">
                  History <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-brand-card/20">
            <div className="px-5 py-4 border-b border-brand-card/30 flex justify-between items-center bg-[#FAF8F5]">
              <h3 className="font-serif text-lg font-bold text-brand-dark">Manual Adjustment</h3>
              <button onClick={() => setShowAdjustModal(false)} className="p-1.5 hover:bg-brand-card/40 rounded-full text-brand-grey transition"><X size={16} /></button>
            </div>
            <form onSubmit={handleAdjustment} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-brand-grey uppercase tracking-wide mb-1.5">Product</label>
                <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} required className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark">
                  <option value="">Select Product...</option>
                  {productsList.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex border border-brand-card rounded-xl overflow-hidden text-sm mb-2">
                <button type="button" onClick={() => setAdjustAction("adjust")} className={`flex-1 py-2 font-bold transition-colors ${adjustAction === "adjust" ? "bg-brand-dark text-white" : "bg-brand-bg/50 text-brand-grey hover:bg-brand-bg"}`}>
                  Add / Subtract
                </button>
                <button type="button" onClick={() => setAdjustAction("move")} className={`flex-1 py-2 font-bold transition-colors ${adjustAction === "move" ? "bg-brand-dark text-white" : "bg-brand-bg/50 text-brand-grey hover:bg-brand-bg"}`}>
                  Move Stock
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-brand-grey uppercase tracking-wide mb-1.5">{adjustAction === "move" ? "From Pool" : "Inventory Pool"}</label>
                  <select value={adjustPool} onChange={e => setAdjustPool(e.target.value)} className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark">
                    <option value="available">Available (Sellable)</option>
                    <option value="reserved">Reserved (Orders)</option>
                    <option value="marketing">Marketing (PR)</option>
                    <option value="damaged">Damaged (Loss)</option>
                  </select>
                </div>
                {adjustAction === "move" ? (
                  <div>
                    <label className="block text-[11px] font-bold text-brand-grey uppercase tracking-wide mb-1.5">To Pool</label>
                    <select value={targetPool} onChange={e => setTargetPool(e.target.value)} className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark">
                      <option value="available" disabled={adjustPool === "available"}>Available (Sellable)</option>
                      <option value="reserved" disabled={adjustPool === "reserved"}>Reserved (Orders)</option>
                      <option value="marketing" disabled={adjustPool === "marketing"}>Marketing (PR)</option>
                      <option value="damaged" disabled={adjustPool === "damaged"}>Damaged (Loss)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-brand-grey uppercase tracking-wide mb-1.5">Amount (+ or -)</label>
                    <input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} required placeholder="e.g. 50 or -10" className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark" />
                  </div>
                )}
              </div>
              {adjustAction === "move" && (
                <div>
                  <label className="block text-[11px] font-bold text-brand-grey uppercase tracking-wide mb-1.5">Quantity to Move</label>
                  <input type="number" value={adjustAmount} min="1" onChange={e => setAdjustAmount(e.target.value)} required placeholder="e.g. 5" className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark" />
                </div>
              )}
              <div>
                <label className="block text-[11px] font-bold text-brand-grey uppercase tracking-wide mb-1.5">Reason</label>
                <input type="text" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} required placeholder="e.g. New stock arrived" className="w-full p-2.5 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" onClick={() => setShowAdjustModal(false)} variant="outline" className="py-2 px-5 text-xs">Cancel</Button>
                <Button type="submit" disabled={adjusting} className="py-2 px-6 text-xs bg-brand-dark text-white hover:bg-black">{adjusting ? "Saving..." : "Apply Adjustment"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-brand-card/20">
            <div className="px-5 py-4 border-b border-brand-card/30 flex justify-between items-center bg-[#FAF8F5]">
              <h3 className="font-serif text-lg font-bold text-brand-dark">Stock History {historyProduct && "- Filtered"}</h3>
              <div className="flex items-center gap-3">
                {historyProduct && (
                  <button onClick={() => setHistoryProduct(null)} className="text-[10px] text-brand-grey hover:text-brand-dark font-bold uppercase tracking-wide underline underline-offset-2">Clear Filter</button>
                )}
                <button onClick={() => setShowHistoryModal(false)} className="p-1.5 hover:bg-brand-card/40 rounded-full text-brand-grey transition"><X size={16} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr>
                    <th className="p-3 text-[10px] font-bold text-brand-grey uppercase tracking-wider border-b border-brand-card/40">Date</th>
                    <th className="p-3 text-[10px] font-bold text-brand-grey uppercase tracking-wider border-b border-brand-card/40">Product</th>
                    <th className="p-3 text-[10px] font-bold text-brand-grey uppercase tracking-wider border-b border-brand-card/40">Action</th>
                    <th className="p-3 text-[10px] font-bold text-brand-grey uppercase tracking-wider border-b border-brand-card/40">Amount</th>
                    <th className="p-3 text-[10px] font-bold text-brand-grey uppercase tracking-wider border-b border-brand-card/40">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-card/20">
                  {inventoryHistory
                    .filter(h => !historyProduct || h.product_id === historyProduct)
                    .map(item => (
                    <tr key={item.id || item._id} className="hover:bg-brand-bg/30">
                      <td className="p-3 text-xs text-brand-dark whitespace-nowrap">{new Date(item.created_at).toLocaleString()}</td>
                      <td className="p-3 text-xs font-semibold text-brand-dark">{productsList.find(p => (p.id || p._id) === item.product_id)?.name || item.product_id}</td>
                      <td className="p-3 text-xs text-brand-grey capitalize">{item.action.replace("_", " ")} <span className="text-[10px] bg-brand-bg px-1.5 py-0.5 rounded ml-1">{item.pool}</span></td>
                      <td className="p-3 text-xs font-bold">
                        <span className={item.amount > 0 ? "text-green-600" : item.amount < 0 ? "text-red-600" : "text-brand-dark"}>
                          {item.amount > 0 ? "+" : ""}{item.amount}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-brand-grey">{item.reason}</td>
                    </tr>
                  ))}
                  {inventoryHistory.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-sm text-brand-grey">No history recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentsTab = ({ orders }) => {
  const nonCancelledOrders = orders.filter(o => o.status !== "cancelled");
  
  const razorpayVolume = nonCancelledOrders
    .filter(o => o.paymentMethod === "prepaid")
    .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    
  const codPending = nonCancelledOrders
    .filter(o => o.paymentMethod === "cod" && o.status !== "delivered")
    .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    
  const codCollected = nonCancelledOrders
    .filter(o => o.paymentMethod === "cod" && o.status === "delivered")
    .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    
  const totalRevenue = razorpayVolume + codCollected;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-2xl font-bold text-brand-dark">Payments</h3>
        <p className="text-xs text-brand-grey mt-1">Online transactions and COD collections.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-brand-card/60 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-[10px] font-bold text-brand-grey uppercase tracking-wider">Razorpay Volume</h4>
            <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center">
              <CreditCard size={14} />
            </div>
          </div>
          <div className="text-3xl font-bold text-brand-dark">₹{razorpayVolume.toLocaleString()}</div>
        </div>
        
        <div className="bg-white border border-brand-card/60 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-[10px] font-bold text-brand-grey uppercase tracking-wider">COD Pending</h4>
            <div className="w-8 h-8 rounded-full bg-brand-bg text-brand-dark flex items-center justify-center border border-brand-card">
              <Clock size={14} />
            </div>
          </div>
          <div className="text-3xl font-bold text-brand-dark">₹{codPending.toLocaleString()}</div>
        </div>

        <div className="bg-white border border-brand-card/60 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-[10px] font-bold text-brand-grey uppercase tracking-wider">COD Collected</h4>
            <div className="w-8 h-8 rounded-full bg-brand-bg text-brand-dark flex items-center justify-center border border-brand-card">
              <Wallet size={14} />
            </div>
          </div>
          <div className="text-3xl font-bold text-brand-dark">₹{codCollected.toLocaleString()}</div>
        </div>

        <div className="bg-white border border-brand-card/60 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-[10px] font-bold text-brand-grey uppercase tracking-wider">Total Revenue</h4>
            <div className="w-8 h-8 rounded-full bg-brand-bg text-brand-dark flex items-center justify-center border border-brand-card">
              <IndianRupee size={14} />
            </div>
          </div>
          <div className="text-3xl font-bold text-brand-dark">₹{totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white border border-brand-card/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-card/40">
          <h4 className="font-semibold text-brand-dark">Recent transactions</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAF8F5]">
              <tr>
                <th className="p-4 text-[10px] font-bold text-brand-grey uppercase tracking-wider border-b border-brand-card/40">Order</th>
                <th className="p-4 text-[10px] font-bold text-brand-grey uppercase tracking-wider border-b border-brand-card/40">Customer</th>
                <th className="p-4 text-[10px] font-bold text-brand-grey uppercase tracking-wider border-b border-brand-card/40">Method</th>
                <th className="p-4 text-[10px] font-bold text-brand-grey uppercase tracking-wider border-b border-brand-card/40">Status</th>
                <th className="p-4 text-[10px] font-bold text-brand-grey uppercase tracking-wider border-b border-brand-card/40">Amount</th>
                <th className="p-4 text-[10px] font-bold text-brand-grey uppercase tracking-wider border-b border-brand-card/40">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-card/20">
              {orders.slice(0, 50).map(order => {
                const method = order.paymentMethod === "prepaid" ? "Razorpay" : "COD";
                let statusLabel = "Pending";
                let statusColor = "bg-amber-100 text-amber-800";
                
                if (order.status === "cancelled") {
                  statusLabel = "Failed";
                  statusColor = "bg-red-100 text-red-800";
                } else if (order.paymentMethod === "prepaid" || (order.paymentMethod === "cod" && order.status === "delivered")) {
                  statusLabel = "Paid";
                  statusColor = "bg-green-100 text-green-800";
                }

                return (
                  <tr key={order.id || order._id} className="hover:bg-brand-bg/30">
                    <td className="p-4 text-xs font-semibold text-brand-dark">{order.order_number}</td>
                    <td className="p-4 text-xs text-brand-dark">{order.name}</td>
                    <td className="p-4 text-xs text-brand-grey">{method}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColor}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span> {statusLabel}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-brand-dark">₹{(Number(order.totalPrice) || 0).toLocaleString()}</td>
                    <td className="p-4 text-xs text-brand-grey whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-sm text-brand-grey">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DashboardOverview = ({ orders, productsList, inventoryList, setShowManualOrderModal }) => {
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
  const todayRevenue = todayOrders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
  
  const monthlyOrders = orders.filter(o => new Date(o.created_at).getMonth() === new Date().getMonth() && new Date(o.created_at).getFullYear() === new Date().getFullYear());
  const monthlyRevenue = monthlyOrders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

  const onlinePaidCount = orders.filter(o => o.paymentMethod === "prepaid" && o.status !== "cancelled").length;
  const codOrdersCount = orders.filter(o => o.paymentMethod === "cod" && o.status !== "cancelled").length;
  const pendingDispatchCount = orders.filter(o => o.status === "pending").length;
  const deliveredCount = orders.filter(o => o.status === "delivered").length;
  const cancelledCount = orders.filter(o => o.status === "cancelled").length;
  const inventoryValue = productsList.reduce((sum, p) => {
    const inv = inventoryList.find(i => i.product_id === (p.id || p._id));
    const available = inv ? inv.available : 0;
    return sum + (Number(p.price) * available);
  }, 0);

  const productsSoldToday = todayOrders.filter(o => o.status !== "cancelled").reduce((sum, o) => {
    const items = o.items || [];
    return sum + items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0);
  }, 0);

  const StatCard = ({ title, value, icon: Icon, trendStr, isPositive, hideTrend = false }) => (
    <div className="bg-white border border-brand-card/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-[10px] font-bold text-brand-grey uppercase tracking-wider">{title}</h4>
        <div className="w-8 h-8 rounded-full bg-brand-bg text-brand-dark flex items-center justify-center border border-brand-card">
          <Icon size={14} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-brand-dark">{value}</div>
        {!hideTrend && (
          <div className={`text-[10px] font-bold mt-1.5 flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
            {trendStr} <span className="text-brand-grey font-normal">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-brand-dark">Good morning, Admin</h2>
          <p className="text-xs text-brand-grey mt-1">Here's what's happening across your store today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewTab("reports")} className="text-xs py-2 px-4 border border-brand-card/60 bg-white hover:bg-brand-bg rounded-full flex items-center gap-2 shadow-sm h-[36px]">
            <Download size={14} /> Export
          </Button>
          <Button variant="primary" onClick={() => setShowManualOrderModal(true)} className="text-xs py-2 px-5 bg-brand-dark text-white hover:bg-black rounded-full flex items-center gap-1.5 shadow-sm h-[36px]">
            <Sparkles size={14} strokeWidth={2.5} /> <span className="font-semibold tracking-wide">New order</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Orders" value={todayOrders.length} icon={ShoppingBag} trendStr="12%" isPositive={true} />
        <StatCard title="Today's Revenue" value={`₹${todayRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} trendStr="8%" isPositive={true} />
        <StatCard title="Monthly Revenue" value={`₹${monthlyRevenue.toLocaleString('en-IN')}`} icon={TrendingUp} trendStr="22%" isPositive={true} />
        <StatCard title="Online Paid" value={onlinePaidCount} icon={CreditCard} trendStr="6%" isPositive={true} />
        
        <StatCard title="COD Orders" value={codOrdersCount} icon={Wallet} trendStr="3%" isPositive={false} />
        <StatCard title="Pending Dispatch" value={pendingDispatchCount} icon={Clock} hideTrend={true} />
        <StatCard title="Delivered" value={deliveredCount} icon={Package} trendStr="15%" isPositive={true} />
        <StatCard title="Cancelled" value={cancelledCount} icon={XCircle} trendStr="4%" isPositive={false} />

        <StatCard title="Inventory Value" value={`₹${inventoryValue.toLocaleString('en-IN')}`} icon={Boxes} hideTrend={true} />
        <StatCard title="Products Sold Today" value={productsSoldToday} icon={Truck} trendStr="9%" isPositive={true} />
      </div>
    </div>
  );
};

const ReportsTab = ({ orders, productsList, inventoryList, usersList }) => {

  const downloadCSV = (filename, data, headers) => {
    let csv = headers.join(",") + "\n";
    data.forEach(row => {
      csv += row.map(r => `"${String(r).replace(/"/g, '""')}"`).join(",") + "\n";
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = (filename, data, headers) => {
    const ws_data = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, filename);
  };

  const downloadPDF = (filename, title, data, headers) => {
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 20,
    });
    doc.save(filename);
  };

  const [previewReport, setPreviewReport] = useState(null);

  const getReportData = (type) => {
    let headers = [];
    let data = [];
    let title = "";

    switch (type) {
      case "sales":
        title = "Sales Report";
        headers = ["Order ID", "Date", "Customer", "Total Items", "Gross Revenue (INR)", "Status"];
        data = orders.map(o => [
          o.order_number || o._id,
          new Date(o.created_at).toLocaleDateString(),
          o.name || "N/A",
          (o.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0),
          o.totalPrice || 0,
          o.status
        ]);
        break;
      case "revenue":
        title = "Revenue Report";
        headers = ["Order ID", "Date", "Payment Method", "Gross Revenue", "Discount", "Net Revenue"];
        data = orders.filter(o => o.status !== "cancelled").map(o => [
          o.order_number || o._id,
          new Date(o.created_at).toLocaleDateString(),
          o.paymentMethod || "N/A",
          (o.totalPrice || 0) + (o.discountAmount || 0),
          o.discountAmount || 0,
          o.totalPrice || 0
        ]);
        break;
      case "products":
        title = "Product Report";
        headers = ["Product Name", "Units Sold", "Revenue Generated"];
        const prodStats = {};
        orders.filter(o => o.status !== "cancelled").forEach(o => {
          (o.items || []).forEach(i => {
            if(!prodStats[i.name]) prodStats[i.name] = { units: 0, revenue: 0 };
            prodStats[i.name].units += (i.quantity || 1);
            prodStats[i.name].revenue += ((i.price || 0) * (i.quantity || 1));
          });
        });
        data = Object.keys(prodStats).map(k => [k, prodStats[k].units, prodStats[k].revenue]);
        break;
      case "coupons":
        title = "Coupon Report";
        headers = ["Coupon Code", "Usage Count", "Total Discount Value"];
        const couponStats = {};
        orders.filter(o => o.couponApplied).forEach(o => {
           if(!couponStats[o.couponApplied]) couponStats[o.couponApplied] = { count: 0, discount: 0 };
           couponStats[o.couponApplied].count += 1;
           couponStats[o.couponApplied].discount += (o.discountAmount || 0);
        });
        data = Object.keys(couponStats).map(k => [k, couponStats[k].count, couponStats[k].discount]);
        break;
      case "customers":
        title = "Customer Report";
        headers = ["Customer Name", "Email", "Phone", "Total Orders", "Total Spent"];
        const custStats = {};
        orders.forEach(o => {
           const key = o.email || o.phone || "Unknown";
           if(!custStats[key]) custStats[key] = { name: o.name, email: o.email || "N/A", phone: o.phone || "N/A", orders: 0, spent: 0 };
           custStats[key].orders += 1;
           if(o.status !== "cancelled") custStats[key].spent += (o.totalPrice || 0);
        });
        data = Object.values(custStats).map(c => [c.name, c.email, c.phone, c.orders, c.spent]);
        break;
      case "cod":
        title = "COD Report";
        headers = ["Order ID", "Date", "Customer", "Status", "Amount to Collect"];
        data = orders.filter(o => o.paymentMethod === "cod").map(o => [
          o.order_number || o._id,
          new Date(o.created_at).toLocaleDateString(),
          o.name,
          o.status,
          o.totalPrice
        ]);
        break;
      case "online":
        title = "Online Payment Report";
        headers = ["Order ID", "Date", "Customer", "Gateway", "Status", "Amount Paid"];
        data = orders.filter(o => o.paymentMethod === "prepaid").map(o => [
          o.order_number || o._id,
          new Date(o.created_at).toLocaleDateString(),
          o.name,
          o.gateway || "Razorpay",
          o.status,
          o.totalPrice
        ]);
        break;
      case "cancelled":
        title = "Cancelled Report";
        headers = ["Order ID", "Date", "Customer", "Payment Method", "Amount", "Reason"];
        data = orders.filter(o => o.status === "cancelled").map(o => [
          o.order_number || o._id,
          new Date(o.created_at).toLocaleDateString(),
          o.name,
          o.paymentMethod,
          o.totalPrice,
          o.cancelReason || "User Request"
        ]);
        break;

      case "inventory":
        title = "Inventory Report";
        headers = ["Product Name", "Available", "Reserved", "Marketing", "Damaged", "Inventory Value"];
        data = productsList.map(p => {
          const inv = inventoryList.find(i => i.product_id === (p.id || p._id)) || {};
          return [
            p.name,
            inv.available || 0,
            inv.reserved || 0,
            inv.marketing || 0,
            inv.damaged || 0,
            (inv.available || 0) * (p.price || 0)
          ];
        });
        break;
    }
    
    return { title, headers, data };
  };

  const handleDownload = (type, format) => {
    const { title, headers, data } = getReportData(type);
    let filename = `${type}_report_${new Date().toISOString().split('T')[0]}`;
    if (format === 'csv') downloadCSV(`${filename}.csv`, data, headers);
    else if (format === 'excel') downloadExcel(`${filename}.xlsx`, data, headers);
    else if (format === 'pdf') downloadPDF(`${filename}.pdf`, title, data, headers);
  };

  const ReportCard = ({ id, title, desc, icon: Icon }) => (
    <div className="bg-white border border-brand-card/60 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
      <div>
        <div className="w-10 h-10 rounded-xl bg-brand-bg text-brand-dark flex items-center justify-center border border-brand-card/80 mb-5">
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <h4 className="font-semibold text-brand-dark">{title}</h4>
        <p className="text-xs text-brand-grey mt-1.5 leading-relaxed">{desc}</p>
      </div>
      
      <div className="mt-8 pt-4 border-t border-brand-card/40 flex items-center justify-between group">
        <div className="text-xs font-semibold text-brand-grey flex gap-1.5 items-center">
          <button onClick={() => handleDownload(id, 'csv')} className="hover:text-brand-dark hover:underline transition">CSV</button> 
          <span>•</span> 
          <button onClick={() => handleDownload(id, 'excel')} className="hover:text-brand-dark hover:underline transition">Excel</button> 
          <span>•</span> 
          <button onClick={() => handleDownload(id, 'pdf')} className="hover:text-brand-dark hover:underline transition">PDF</button>
        </div>
        <button onClick={() => setPreviewReport(id)} className="text-brand-grey group-hover:text-brand-dark transition-colors transform group-hover:translate-x-1 duration-200 p-1">
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-brand-dark tracking-tight">Reports</h2>
          <p className="text-sm text-brand-grey mt-1.5">Everything you need to understand your business.</p>
        </div>
        <Button variant="outline" onClick={() => generateReport('sales', 'excel')} className="border-brand-card shadow-sm hover:bg-brand-bg rounded-full px-5 h-[40px] flex gap-2 items-center text-brand-dark">
          <Download size={16} /> <span className="font-semibold tracking-wide text-sm">Export all</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <ReportCard id="sales" title="Sales Report" desc="Order volume, AOV and conversion trends" icon={BarChart3} />
        <ReportCard id="revenue" title="Revenue Report" desc="Gross and net revenue by day / month" icon={IndianRupee} />
        <ReportCard id="products" title="Product Report" desc="Units sold and revenue by SKU" icon={Package} />
        <ReportCard id="coupons" title="Coupon Report" desc="Usage, redemptions and lift" icon={Ticket} />
        <ReportCard id="customers" title="Customer Report" desc="New vs returning, LTV, cohorts" icon={Users} />
        <ReportCard id="cod" title="COD Report" desc="COD collected, pending and RTO" icon={Wallet} />
        <ReportCard id="online" title="Online Payment Report" desc="Razorpay success rate & fees" icon={CreditCard} />
        <ReportCard id="cancelled" title="Cancelled Report" desc="Cancellations by reason & stage" icon={XCircle} />
        <ReportCard id="inventory" title="Inventory Report" desc="Stock, aging and damaged inventory" icon={Boxes} />
      </div>

      <AnimatePresence>
        {previewReport && (() => {
          const { title, headers, data } = getReportData(previewReport);
          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-serif font-semibold text-brand-dark">{title}</h3>
                    <p className="text-sm text-brand-grey mt-1">Showing {data.length} records</p>
                  </div>
                  <button onClick={() => setPreviewReport(null)} className="p-2 hover:bg-brand-bg rounded-full transition-colors text-brand-grey">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-auto border border-brand-card/40 rounded-xl relative">
                  <table className="w-full text-sm text-left relative">
                    <thead className="bg-brand-bg text-brand-dark sticky top-0 shadow-sm z-10">
                      <tr>
                        {headers.map((h, i) => (
                          <th key={i} className="py-3 px-4 font-semibold whitespace-nowrap bg-brand-bg">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-card/40">
                      {data.length > 0 ? data.map((row, i) => (
                        <tr key={i} className="hover:bg-brand-bg/50 transition-colors">
                          {row.map((cell, j) => (
                            <td key={j} className="py-3 px-4 text-brand-grey whitespace-nowrap">{cell}</td>
                          ))}
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={headers.length} className="py-12 text-center text-brand-grey">No data available for this report.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-brand-card/40">
                  <Button variant="outline" onClick={() => handleDownload(previewReport, 'csv')} className="text-xs px-4 h-[36px]">CSV</Button>
                  <Button variant="outline" onClick={() => handleDownload(previewReport, 'excel')} className="text-xs px-4 h-[36px]">Excel</Button>
                  <Button variant="primary" onClick={() => handleDownload(previewReport, 'pdf')} className="text-xs px-4 h-[36px] flex items-center gap-1.5"><Download size={14} /> PDF</Button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
