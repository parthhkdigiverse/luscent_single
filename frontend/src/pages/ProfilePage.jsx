import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import { Button } from "../components/Button";
import { 
  User, Package, MapPin, LogOut, ExternalLink, 
  ShoppingBag, ShieldCheck, CheckCircle2, Plus, Edit2, Trash2, Check, X, Building, Home
} from "lucide-react";

export const ProfilePage = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Details Form State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressMessage, setAddressMessage] = useState("");

  // Address Form State
  const [addrTag, setAddrTag] = useState("Home");
  const [receiverName, setReceiverName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      
      // Load saved addresses for current user
      const storageKey = `luscent_addresses_${user.email}`;
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (saved.length === 0) {
          // Default initial address
          const initial = [
            {
              id: "addr_default_1",
              tag: "Home",
              receiverName: user.name || "Customer",
              phone: "+91 98765 43210",
              street: "123 Solar Glow Way, Marine Drive",
              city: "Mumbai",
              state: "Maharashtra",
              pincode: "400002",
              isDefault: true
            }
          ];
          setAddresses(initial);
          localStorage.setItem(storageKey, JSON.stringify(initial));
        } else {
          setAddresses(saved);
        }
      } catch (e) {
        console.error("Error loading addresses:", e);
      }
    }
  }, [user]);

  // Save addresses to localStorage
  const saveAddressesToStorage = (newList) => {
    setAddresses(newList);
    if (user?.email) {
      const storageKey = `luscent_addresses_${user.email}`;
      localStorage.setItem(storageKey, JSON.stringify(newList));
    }
  };

  // Fetch Orders
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUserOrders = async () => {
      setLoadingOrders(true);
      try {
        const token = localStorage.getItem("luscent_token");
        let apiOrders = [];
        if (token) {
          const res = await fetch(`${API_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            apiOrders = await res.json();
          }
        }

        // Also merge local test orders saved in localStorage matching current email/phone/user
        let localOrders = [];
        try {
          localOrders = JSON.parse(localStorage.getItem("luscent_orders") || "[]");
        } catch (e) {
          console.error("Failed to parse local orders:", e);
        }

        const userLocalOrders = localOrders.filter(
          (o) => !o.user_id || o.user_id === user?.email || o.email === user?.email
        );

        // Deduplicate by order_number
        const orderMap = new Map();
        apiOrders.forEach((o) => {
          if (o.order_number) orderMap.set(o.order_number, o);
        });
        userLocalOrders.forEach((o) => {
          if (o.order_number && !orderMap.has(o.order_number)) {
            orderMap.set(o.order_number, o);
          }
        });

        const merged = Array.from(orderMap.values());
        merged.sort((a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now()));
        setOrders(merged);
      } catch (err) {
        console.error("Error fetching user orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [isLoggedIn, user]);

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  const getInitials = (fullName) => {
    if (!fullName) return "LG";
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setSaveSuccess("Profile details updated successfully!");
    setTimeout(() => setSaveSuccess(""), 4000);
  };

  // Address Actions
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddrTag("Home");
    setReceiverName(user?.name || "");
    setAddrPhone("+91 98765 43210");
    setStreet("");
    setCity("");
    setStateName("");
    setPincode("");
    setIsDefault(addresses.length === 0);
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddrTag(addr.tag || "Home");
    setReceiverName(addr.receiverName || user?.name || "");
    setAddrPhone(addr.phone || "");
    setStreet(addr.street || "");
    setCity(addr.city || "");
    setStateName(addr.state || "");
    setPincode(addr.pincode || "");
    setIsDefault(!!addr.isDefault);
    setShowAddressModal(true);
  };

  const handleSetDefaultAddress = (targetId) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === targetId
    }));
    saveAddressesToStorage(updated);
    setAddressMessage("Default address updated!");
    setTimeout(() => setAddressMessage(""), 3000);
  };

  const handleDeleteAddress = (targetId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    let updated = addresses.filter((a) => a.id !== targetId);
    // If we deleted the default address and have remaining, set the first as default
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveAddressesToStorage(updated);
    setAddressMessage("Address removed.");
    setTimeout(() => setAddressMessage(""), 3000);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const newAddrObj = {
      id: editingAddress ? editingAddress.id : `addr_${Date.now()}`,
      tag: addrTag,
      receiverName: receiverName || user?.name || "Customer",
      phone: addrPhone,
      street,
      city,
      state: stateName,
      pincode,
      isDefault: isDefault || addresses.length === 0
    };

    let newList = [];
    if (editingAddress) {
      newList = addresses.map((a) => (a.id === editingAddress.id ? newAddrObj : a));
    } else {
      newList = [...addresses, newAddrObj];
    }

    if (newAddrObj.isDefault) {
      newList = newList.map((a) => ({
        ...a,
        isDefault: a.id === newAddrObj.id
      }));
    }

    saveAddressesToStorage(newList);
    setShowAddressModal(false);
    setAddressMessage(editingAddress ? "Address updated successfully!" : "New address added successfully!");
    setTimeout(() => setAddressMessage(""), 3000);
  };

  return (
    <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto space-y-10 min-h-screen text-left">
      {/* ─── Profile Header Banner ─── */}
      <div className="bg-white rounded-[32px] border border-brand-card/40 p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-accent/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-serif text-2xl font-bold tracking-wider shadow-md flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-semibold text-brand-dark">{user?.name}</h1>
              <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-brand-green bg-brand-green/10 px-2.5 py-0.5 rounded-full">
                <ShieldCheck size={12} /> Active Member
              </span>
            </div>
            <p className="text-xs text-brand-grey mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <Button
            onClick={() => {
              logout();
              navigate("/auth");
            }}
            variant="outline"
            className="text-xs py-2.5 px-5 border border-red-200 text-red-650 hover:bg-red-50 transition flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <LogOut size={14} /> Log Out
          </Button>
        </div>
      </div>

      {/* ─── Main Tabs Content ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav Tabs */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-brand-card/40 p-3 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === "orders"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-brand-dark hover:bg-brand-bg/60"
            }`}
          >
            <Package size={16} /> My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === "details"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-brand-dark hover:bg-brand-bg/60"
            }`}
          >
            <User size={16} /> Account Details
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === "addresses"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-brand-dark hover:bg-brand-bg/60"
            }`}
          >
            <MapPin size={16} /> Saved Addresses ({addresses.length})
          </button>
        </div>

        {/* Tab Display Area */}
        <div className="lg:col-span-9 bg-white rounded-[32px] border border-brand-card/40 p-6 md:p-8 shadow-sm min-h-[450px]">
          {/* TAB 1: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-brand-card/30 pb-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-brand-dark">Order History</h2>
                  <p className="text-xs text-brand-grey mt-0.5">Track and review all your skincare orders.</p>
                </div>
                <Link to="/">
                  <Button variant="outline" className="text-xs py-2 px-4 border border-brand-dark/20 text-brand-dark hover:bg-brand-bg">
                    + Shop More
                  </Button>
                </Link>
              </div>

              {loadingOrders ? (
                <div className="py-20 text-center text-xs text-brand-grey">Loading your order history...</div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-brand-bg border border-brand-card/40 flex items-center justify-center mx-auto text-brand-grey">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-brand-dark">No Orders Placed Yet</h3>
                    <p className="text-xs text-brand-grey mt-1">Explore our high-performance formulas and place your first order.</p>
                  </div>
                  <Link to="/">
                    <Button variant="primary" className="py-2.5 px-6 text-xs uppercase tracking-wider bg-brand-dark text-white hover:bg-black">
                      Browse Shop
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order, idx) => {
                    const formattedDate = order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "Recently";

                    return (
                      <div key={order.order_number || idx} className="bg-brand-bg/30 border border-brand-card/50 rounded-2xl p-5 space-y-4 hover:border-brand-dark/30 transition">
                        {/* Order Header info */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-card/40 pb-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-brand-dark">Order #{order.order_number}</span>
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                                order.status === "delivered"
                                  ? "bg-brand-green/10 text-brand-green"
                                  : order.status === "shipped"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {order.status || "Processing"}
                              </span>
                            </div>
                            <span className="text-[11px] text-brand-grey block">Placed on {formattedDate}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <Link
                              to={`/track?query=${order.order_number}`}
                              className="text-xs font-semibold text-brand-accent hover:text-brand-dark flex items-center gap-1 transition"
                            >
                              Track Order <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-3">
                          {order.items?.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center justify-between gap-4 py-1">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image || "/images/sunscreen.png"}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-xl border border-brand-card/40 bg-white"
                                />
                                <div>
                                  <h4 className="text-xs font-semibold text-brand-dark">{item.name}</h4>
                                  <span className="text-[11px] text-brand-grey">Qty: {item.quantity} × ₹{item.price}</span>
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-brand-dark">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="pt-3 border-t border-brand-card/40 flex justify-between items-center text-xs">
                          <span className="text-brand-grey">
                            Payment: <strong className="text-brand-dark uppercase text-[11px]">{order.paymentMethod || "COD"}</strong>
                          </span>
                          <div>
                            <span className="text-brand-grey">Total: </span>
                            <strong className="font-serif text-sm text-brand-dark font-bold ml-1">
                              ₹{(Number(order.totalPrice) || 0).toLocaleString("en-IN")}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACCOUNT DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="border-b border-brand-card/30 pb-4">
                <h2 className="font-serif text-xl font-semibold text-brand-dark">Account Profile</h2>
                <p className="text-xs text-brand-grey mt-0.5">Manage your personal information and preferences.</p>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} /> {saveSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-3 bg-brand-bg/40 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full p-3 bg-gray-100 border border-brand-card/40 rounded-xl text-xs text-gray-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-brand-grey block mt-1">Email cannot be modified directly.</span>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full p-3 bg-brand-bg/40 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white transition"
                  />
                </div>

                <Button type="submit" className="py-3 px-6 text-xs uppercase tracking-wider bg-brand-dark text-white hover:bg-black font-semibold rounded-xl mt-4">
                  Save Profile Changes
                </Button>
              </form>
            </div>
          )}

          {/* TAB 3: SHIPPING ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-card/30 pb-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-brand-dark">Saved Addresses</h2>
                  <p className="text-xs text-brand-grey mt-0.5">Manage multiple shipping addresses and pick your default delivery location.</p>
                </div>
                <Button
                  onClick={handleOpenAddAddress}
                  className="py-2.5 px-4 bg-brand-dark text-white hover:bg-black text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} /> Add New Address
                </Button>
              </div>

              {addressMessage && (
                <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} /> {addressMessage}
                </div>
              )}

              {addresses.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-brand-bg border border-brand-card/40 flex items-center justify-center mx-auto text-brand-grey">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-brand-dark">No Saved Addresses</h3>
                    <p className="text-xs text-brand-grey mt-1">Add your shipping addresses for fast 1-click checkout.</p>
                  </div>
                  <Button onClick={handleOpenAddAddress} className="py-2.5 px-6 text-xs uppercase tracking-wider bg-brand-dark text-white hover:bg-black">
                    Add Address Now
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative ${
                        addr.isDefault
                          ? "bg-white border-brand-dark shadow-md"
                          : "bg-brand-bg/30 border border-brand-card/50 hover:border-brand-card"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-dark uppercase tracking-wider">
                            {addr.tag === "Home" ? <Home size={14} className="text-brand-accent" /> : <Building size={14} className="text-brand-secondary" />}
                            {addr.tag || "Address"}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] font-bold uppercase tracking-widest bg-brand-green/10 text-brand-green px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Check size={10} className="stroke-[3]" /> Default
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-semibold text-brand-dark">{addr.receiverName}</h4>
                        <p className="text-xs text-brand-grey leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-[11px] font-medium text-brand-dark/80">Phone: {addr.phone}</p>
                      </div>

                      <div className="pt-3 border-t border-brand-card/40 flex items-center justify-between gap-2">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-xs font-semibold text-brand-accent hover:text-brand-dark transition"
                          >
                            Set as Default
                          </button>
                        ) : (
                          <span className="text-[11px] text-brand-grey italic">Primary Delivery Location</span>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditAddress(addr)}
                            className="p-1.5 text-brand-grey hover:text-brand-dark hover:bg-brand-card/30 rounded-lg transition"
                            title="Edit Address"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Address"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Add/Edit Address Modal ─── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[32px] border border-brand-card/40 shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-brand-card/30 pb-3">
              <h3 className="font-serif text-lg font-semibold text-brand-dark">
                {editingAddress ? "Edit Shipping Address" : "Add New Shipping Address"}
              </h3>
              <button onClick={() => setShowAddressModal(false)} className="text-brand-grey hover:text-brand-dark p-1 rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark block mb-1">Address Label</label>
                <div className="flex gap-3">
                  {["Home", "Office", "Other"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setAddrTag(tag)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                        addrTag === tag
                          ? "bg-brand-dark text-white border-brand-dark"
                          : "bg-brand-bg/40 text-brand-dark border-brand-card/60 hover:bg-brand-bg"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark block mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  required
                  placeholder="Full Name"
                  className="w-full p-2.5 bg-brand-bg/40 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  required
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full p-2.5 bg-brand-bg/40 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark block mb-1">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  placeholder="House No, Building, Street Name"
                  className="w-full p-2.5 bg-brand-bg/40 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    placeholder="City"
                    className="w-full p-2.5 bg-brand-bg/40 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark block mb-1">State</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    required
                    placeholder="State"
                    className="w-full p-2.5 bg-brand-bg/40 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark block mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                  placeholder="6-digit Pincode"
                  className="w-full p-2.5 bg-brand-bg/40 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-brand-card text-brand-dark focus:ring-brand-dark"
                />
                <label htmlFor="defaultCheck" className="text-xs text-brand-dark font-medium cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-brand-card/30">
                <Button type="button" onClick={() => setShowAddressModal(false)} variant="outline" className="py-2 px-4 border text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="py-2 px-5 bg-brand-dark text-white hover:bg-black text-xs font-semibold">
                  {editingAddress ? "Save Changes" : "Add Address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
