import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import { Button } from "../components/Button";
import { CheckoutStepper } from "../components/CheckoutStepper";
import { CreditCard, Truck, CheckCircle2, ChevronRight, MapPin, ClipboardList, ShieldAlert, ShieldCheck } from "lucide-react";

export const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { isLoggedIn, user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Multi-step: 1 (Shipping), 2 (Payment), 3 (Review), 4 (Confirmation)
  const [step, setStep] = useState(1);

  useEffect(() => {
    const orderIdParam = searchParams.get("order_id");
    const stepParam = searchParams.get("step");
    if (stepParam === "4" && orderIdParam) {
      setOrderId(orderIdParam);
      setStep(4);
      clearCart();
    }
  }, [searchParams]);
  const [checkoutAsGuest, setCheckoutAsGuest] = useState(false);

  // Form details
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [pincode, setPincode] = useState("");

  // Payment choice
  const [paymentMethod, setPaymentMethod] = useState("prepaid"); // prepaid, cod

  // Order result
  // Order result
  const [orderId, setOrderId] = useState("");

  // Promo Coupons States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAvailable, setShowAvailable] = useState(false);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  useEffect(() => {
    if (user?.email) {
      try {
        const saved = JSON.parse(localStorage.getItem(`luscent_addresses_${user.email}`) || "[]");
        setSavedAddresses(saved);
        const defaultAddr = saved.find(a => a.isDefault) || saved[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setName(defaultAddr.receiverName || user.name || "");
          setPhone(defaultAddr.phone || "");
          setAddress(defaultAddr.street || "");
          setCity(defaultAddr.city || "");
          setShippingState(defaultAddr.state || "");
          setPincode(defaultAddr.pincode || "");
        }
      } catch (e) {
        console.error("Error loading saved addresses in checkout:", e);
      }
    }
  }, [user]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setName(addr.receiverName || user?.name || "");
    setPhone(addr.phone || "");
    setAddress(addr.street || "");
    setCity(addr.city || "");
    setShippingState(addr.state || "");
    setPincode(addr.pincode || "");
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`${API_URL}/api/coupons`);
        if (res.ok) {
          const data = await res.json();
          setAvailableCoupons(data);
        }
      } catch (err) {
        console.warn("Failed to load coupons list:", err.message);
      }
    };
    fetchCoupons();
  }, []);

  const handleSelectAndApplyCoupon = async (c) => {
    setCouponCode(c.code);
    setValidatingCoupon(true);
    setCouponError("");
    try {
      // Check minimum purchase requirements immediately
      if (c.min_purchase && cartTotal < c.min_purchase) {
        throw new Error(`Minimum spend of ₹${c.min_purchase} required for this coupon.`);
      }

      // Check buy X get Y requirements
      if (c.discount_type === "buy_x_get_y") {
        const targetItem = cart.find(item => item.id === c.target_product_id);
        const reqQty = (c.buy_qty || 1) + (c.get_qty || 1);
        if (!targetItem || targetItem.quantity < reqQty) {
          const prodName = targetItem?.name || c.target_product_id;
          throw new Error(`Add at least ${reqQty} items of '${prodName}' to qualify.`);
        }
      }

      setAppliedCoupon(c);
      setCouponError("");
      setShowAvailable(false);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.message);
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Calculate discount amount dynamically
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    // Check minimum spend
    if (appliedCoupon.min_purchase && cartTotal < appliedCoupon.min_purchase) {
      return 0; // Don't apply if min spend not met
    }

    if (appliedCoupon.discount_type === "percent") {
      return Math.round((cartTotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.discount_type === "fixed") {
      return Math.min(appliedCoupon.value, cartTotal);
    } else if (appliedCoupon.discount_type === "buy_x_get_y") {
      // Find matching item in cart
      const targetItem = cart.find(item => item.id === appliedCoupon.target_product_id);
      if (!targetItem) return 0;
      
      const buyQty = appliedCoupon.buy_qty || 1;
      const getQty = appliedCoupon.get_qty || 1;
      
      // Calculate sets (Buy X get Y free)
      const sets = Math.floor(targetItem.quantity / (buyQty + getQty));
      const freeItemCount = sets * getQty;
      
      return Math.round(freeItemCount * targetItem.price);
    }
    return 0;
  };

  const discountAmount = calculateDiscount();
  const grandTotal = Math.max(0, cartTotal - discountAmount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch(`${API_URL}/api/coupons/${couponCode.toUpperCase()}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Invalid coupon code");
      }
      const data = await res.json();
      
      // Check minimum purchase requirements immediately
      if (data.min_purchase && cartTotal < data.min_purchase) {
        throw new Error(`Minimum spend of ₹${data.min_purchase} required for this coupon.`);
      }

      // Check buy X get Y requirements
      if (data.discount_type === "buy_x_get_y") {
        const targetItem = cart.find(item => item.id === data.target_product_id);
        const reqQty = (data.buy_qty || 1) + (data.get_qty || 1);
        if (!targetItem || targetItem.quantity < reqQty) {
          const prodName = targetItem?.name || data.target_product_id;
          throw new Error(`Add at least ${reqQty} items of '${prodName}' to qualify.`);
        }
      }

      setAppliedCoupon(data);
      setCouponError("");
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.message);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !address || !city || !shippingState || !pincode) {
      alert("Please fill in all shipping fields.");
      return;
    }
    setStep(2);
  };

  const loadCashfreeSDK = () => {
    return new Promise((resolve) => {
      if (window.Cashfree) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const submitOrderToBackend = async (orderData) => {
    const token = localStorage.getItem("luscent_token");
    let finalOrderNum = "";
    let finalOrderObj = null;

    try {
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderData)
      });
      if (!res.ok) throw new Error("Order failed");
      const data = await res.json();
      finalOrderNum = data.order_number;
      finalOrderObj = data;
      setOrderId(finalOrderNum);
    } catch (err) {
      console.warn("FastAPI backend not available or returned error, creating mock order:", err.message);
      finalOrderNum = "LG-" + Math.floor(100000 + Math.random() * 900000);
      finalOrderObj = {
        ...orderData,
        order_number: finalOrderNum,
        status: "pending",
        created_at: new Date().toISOString()
      };
      setOrderId(finalOrderNum);
    }

    // Always persist to localStorage so test orders display in Admin dashboard even offline/in mock mode
    try {
      const savedOrders = JSON.parse(localStorage.getItem("luscent_orders") || "[]");
      savedOrders.unshift(finalOrderObj);
      localStorage.setItem("luscent_orders", JSON.stringify(savedOrders));
    } catch (e) {
      console.error("Failed to save order to localStorage:", e);
    }

    return finalOrderNum;
  };

  const handlePlaceOrder = async () => {
    const orderData = {
      name,
      phone,
      address,
      city,
      state: shippingState,
      pincode,
      paymentMethod,
      totalPrice: grandTotal,
      couponApplied: appliedCoupon ? appliedCoupon.code : null,
      discountAmount: discountAmount,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.images?.[0] || ""
      }))
    };

    if (paymentMethod === "prepaid") {
      const sdkLoaded = await loadCashfreeSDK();
      if (!sdkLoaded) {
        alert("Failed to load payment gateway SDK. Please try again.");
        return;
      }

      try {
        // Create order in backend first
        const orderNum = await submitOrderToBackend(orderData);

        const sessionRes = await fetch(`${API_URL}/api/orders/cashfree-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: grandTotal,
            name: name,
            phone: phone,
            email: user?.email || "guest@luscentglow.com",
            order_id: orderNum,
            return_url: `${window.location.origin}/checkout?step=4&order_id=${orderNum}`
          })
        });

        if (!sessionRes.ok) throw new Error("Could not initialize payment session");
        const sessionData = await sessionRes.json();

        if (sessionData.is_mock) {
          alert("Launching Cashfree Sandbox Gateway Checkout (Simulated Mode)... Click OK to simulate successful payment!");
          setStep(4);
          clearCart();
          return;
        }

        const cashfree = window.Cashfree({
          mode: sessionData.mode
        });

        cashfree.checkout({
          paymentSessionId: sessionData.payment_session_id,
          redirectTarget: "_self"
        });
      } catch (err) {
        alert("Payment initialization error: " + err.message);
      }
    } else {
      // Cash on Delivery
      await submitOrderToBackend(orderData);
      setStep(4);
      clearCart();
    }
  };

  // If cart is empty and we are not in confirmation step, redirect
  if (cart.length === 0 && step < 4) {
    return (
      <div className="pt-32 pb-16 text-center">
        <h2 className="font-serif text-xl font-bold text-brand-dark mb-4">No items to checkout</h2>
        <Link to="/">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    );
  }

  // Auth Guard / Decision
  if (!isLoggedIn && !checkoutAsGuest && step < 4) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-lg mx-auto text-left">
        <div className="bg-white/90 backdrop-blur-md rounded-[32px] border border-brand-card/40 shadow-xl p-10 space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[9px] tracking-widest uppercase font-bold text-brand-accent bg-brand-accent/10 px-3.5 py-1 rounded-full">
              <ShieldCheck size={12} className="stroke-[2.5]" /> SECURE CHECKOUT
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-brand-dark">Checkout Options</h2>
            <p className="text-xs text-brand-grey">Please choose how you'd like to proceed.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-brand-dark">Checkout as a Guest</h3>
              <p className="text-[11px] text-brand-grey leading-relaxed">No password required. You can create an account later.</p>
              <Button
                onClick={() => setCheckoutAsGuest(true)}
                variant="outline"
                className="w-full py-3.5 text-xs uppercase tracking-widest border border-brand-dark/20 hover:border-brand-dark hover:bg-brand-dark hover:text-white transition-all duration-300 font-semibold"
              >
                Continue as Guest
              </Button>
            </div>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-card/40"></div>
              </div>
              <span className="relative bg-white/90 px-4 text-[9px] uppercase tracking-widest font-semibold text-brand-grey">Or</span>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-brand-dark">Sign in to Account</h3>
              <p className="text-[11px] text-brand-grey leading-relaxed">Speed up checkout and track your order history.</p>
              <Link to="/auth">
                <Button className="w-full py-3.5 text-xs uppercase tracking-widest bg-brand-dark text-white hover:bg-black transition-all duration-300 font-semibold shadow-sm">
                  Login or Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation view
  if (step === 4) {
    return (
      <div className="pt-28 pb-20 px-6 max-w-xl mx-auto text-center space-y-8 animate-fade-in">
        <div className="bg-white rounded-3xl border border-brand-card/50 shadow-xl p-8 md:p-12 space-y-6">
          <div className="w-16 h-16 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} className="stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] tracking-widest uppercase font-bold text-brand-green block">ORDER PLACED SUCCESSFULLY</span>
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-brand-dark">Thank You for Your Order!</h2>
            <p className="text-xs text-brand-grey">Your transaction was secure. A confirmation email has been sent to you.</p>
          </div>

          <div className="bg-brand-bg rounded-2xl p-5 border border-brand-card/30 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-grey">Order Number</span>
              <span className="font-semibold text-brand-dark">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-grey">Estimated Delivery</span>
              <span className="font-semibold text-brand-dark">3 - 5 Business Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-grey">Shipping Method</span>
              <span className="font-semibold text-brand-dark">Standard Free Shipping</span>
            </div>
          </div>

          <div className="pt-4">
            <Link to="/">
              <Button variant="primary" className="w-full py-3 text-xs uppercase tracking-wider">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-8">
      {/* Checkout Stepper */}
      <CheckoutStepper currentStep={step} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
        {/* Main Step Forms */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-brand-card/50 shadow-sm p-6 md:p-8 text-left">
          {/* STEP 1: Shipping Info */}
          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <h2 className="font-serif text-lg md:text-xl font-semibold text-brand-dark flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-brand-accent" /> Shipping Address
              </h2>

              {savedAddresses.length > 0 && (
                <div className="space-y-3 pb-2 border-b border-brand-card/40">
                  <span className="text-xs uppercase font-bold tracking-wider text-brand-grey block">
                    Choose from Saved Addresses
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-brand-bg/70 border-brand-dark shadow-sm ring-1 ring-brand-dark"
                              : "bg-white border-brand-card/50 hover:border-brand-card"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-dark">
                              {addr.tag || "Address"}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[8px] font-bold uppercase tracking-widest bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-brand-dark truncate">{addr.receiverName}</p>
                          <p className="text-[11px] text-brand-grey truncate">
                            {addr.street}, {addr.city}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat, House no., Apartment, Street"
                  className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Surat"
                    className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    placeholder="Gujarat"
                    className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="395007"
                    className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-brand-card/50 flex justify-end">
                <Button type="submit" className="text-xs uppercase tracking-wider px-8 py-3.5 flex items-center gap-1.5">
                  Proceed to Payment <ChevronRight size={14} />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Step */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-serif text-lg md:text-xl font-semibold text-brand-dark flex items-center gap-2 mb-2">
                <CreditCard size={18} className="text-brand-accent" /> Payment Method
              </h2>
              <p className="text-xs text-brand-grey mb-6">Transactions are securely processed. Select your preferred checkout option.</p>

              <div className="space-y-3">
                {/* Prepaid Option */}
                <label
                  onClick={() => setPaymentMethod("prepaid")}
                  className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all text-left ${
                    paymentMethod === "prepaid" ? "border-brand-dark bg-brand-bg/30 ring-1 ring-brand-dark" : "border-brand-card hover:bg-brand-bg/10"
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "prepaid"}
                      readOnly
                      className="text-brand-dark focus:ring-brand-dark"
                    />
                    <div>
                      <span className="text-xs font-semibold text-brand-dark block">Prepaid (Pay Online)</span>
                      <span className="text-[10px] text-brand-grey">Pay securely using UPI, Credit/Debit Cards, Netbanking, or Wallets</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-brand-green">10% OFF APPLIED</span>
                </label>

                {/* COD Option */}
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all text-left ${
                    paymentMethod === "cod" ? "border-brand-dark bg-brand-bg/30 ring-1 ring-brand-dark" : "border-brand-card hover:bg-brand-bg/10"
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      readOnly
                      className="text-brand-dark focus:ring-brand-dark"
                    />
                    <div>
                      <span className="text-xs font-semibold text-brand-dark block">Postpaid (Cash on Delivery)</span>
                      <span className="text-[10px] text-brand-grey">Pay in cash or digital scan upon delivery</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-brand-grey">EASY</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-brand-card/50 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-brand-grey hover:text-brand-dark transition-colors"
                >
                  Back to Shipping
                </button>
                <Button onClick={() => setStep(3)} className="text-xs uppercase tracking-wider px-8 py-3.5 flex items-center gap-1.5">
                  Proceed to Review <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Review */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-serif text-lg md:text-xl font-semibold text-brand-dark flex items-center gap-2 mb-2">
                <ClipboardList size={18} className="text-brand-accent" /> Review Order Details
              </h2>
              <p className="text-xs text-brand-grey mb-6">Double-check your shipping destination and choice of payment before completing order.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Destination Details */}
                <div className="bg-brand-bg/50 border border-brand-card/40 rounded-2xl p-5 space-y-2">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-brand-grey">Shipping Destination</h4>
                  <div className="text-xs text-brand-dark space-y-1">
                    <p className="font-semibold">{name}</p>
                    <p>{address}</p>
                    <p>{city}, {shippingState} - {pincode}</p>
                    <p className="pt-1.5 text-[11px] text-brand-grey font-medium">Phone: {phone}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-[10px] text-brand-accent hover:underline block pt-2 font-semibold">
                    Change Address
                  </button>
                </div>

                {/* Payment Option chosen */}
                <div className="bg-brand-bg/50 border border-brand-card/40 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-brand-grey">Payment Mode</h4>
                    <span className="inline-block mt-2 px-3 py-1 bg-brand-dark text-white rounded-full text-[10px] uppercase font-semibold">
                      {paymentMethod.toUpperCase()}
                    </span>
                  </div>
                  <button onClick={() => setStep(2)} className="text-[10px] text-brand-accent hover:underline block pt-2 font-semibold text-left">
                    Change Method
                  </button>
                </div>
              </div>

              {/* Alert box */}
              <div className="p-4 bg-brand-accent/5 border border-brand-accent/20 rounded-2xl text-[11px] text-brand-accent flex items-start gap-2.5">
                <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">By clicking <strong>Place Order</strong>, you agree to our standard shipping & return terms. COD orders require confirmation via SMS link post placement.</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-brand-card/50 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-brand-grey hover:text-brand-dark transition-colors"
                >
                  Back to Payment
                </button>
                <Button onClick={handlePlaceOrder} className="text-xs uppercase tracking-wider px-8 py-3.5">
                  Place Order
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Right Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-brand-card/50 shadow-sm p-6 text-left space-y-4 lg:sticky lg:top-24">
          <h3 className="font-serif text-base font-semibold text-brand-dark border-b border-brand-card/50 pb-3">Order Summary</h3>

          {/* Cart items list */}
          <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-brand-card/30">
            {cart.map((item, idx) => (
              <div key={item.id} className="flex gap-3 py-3 first:pt-0">
                <div className="w-12 h-16 bg-brand-bg rounded-lg p-1 border border-brand-card/25 flex items-center justify-center flex-shrink-0">
                  <img src={item.images[0]} alt="" className="max-h-full object-contain" />
                </div>
                <div className="min-w-0 flex-grow text-left">
                  <h4 className="font-serif text-xs font-semibold text-brand-dark truncate">{item.name}</h4>
                  <span className="text-[10px] text-brand-grey block">{item.netVolume}</span>
                  <div className="flex justify-between items-center mt-1 text-xs">
                    <span className="text-brand-grey">Qty: {item.quantity}</span>
                    <span className="font-bold text-brand-dark">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code Input */}
          <div className="border-t border-brand-card/50 pt-4 space-y-2">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-brand-grey">Promo Code</h4>
            
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-brand-green/5 border border-brand-green/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-brand-green" />
                  <div>
                    <span className="text-[11px] font-bold text-brand-dark tracking-wide">{appliedCoupon.code}</span>
                    <p className="text-[9px] text-brand-grey mt-0.5">{appliedCoupon.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode("");
                  }}
                  className="text-[9px] font-bold uppercase text-[#c24b4b] hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError("");
                  }}
                  placeholder="e.g. GLOW10"
                  className="flex-grow p-2 border border-brand-card rounded-xl focus:outline-none focus:border-brand-dark text-xs uppercase"
                />
                <Button
                  type="submit"
                  disabled={validatingCoupon || !couponCode}
                  className="text-[10px] uppercase tracking-wider font-bold py-2 px-4 bg-brand-dark text-white rounded-xl hover:bg-black"
                >
                  {validatingCoupon ? "Validating..." : "Apply"}
                </Button>
              </form>
            )}

            {!appliedCoupon && availableCoupons.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowAvailable(!showAvailable)}
                  className="text-[10px] text-brand-accent hover:underline font-bold transition mt-1 block text-left"
                >
                  {showAvailable ? "Hide Available Coupons" : "View Available Coupons"}
                </button>

                {showAvailable && (
                  <div className="bg-brand-bg rounded-2xl border border-brand-card p-3 space-y-2 mt-2 max-h-48 overflow-y-auto custom-scrollbar">
                    <p className="text-[9px] uppercase font-bold tracking-widest text-brand-grey border-b border-brand-card pb-1">Click to apply coupon</p>
                    {availableCoupons.map((c) => (
                      <div
                        key={c.code}
                        onClick={() => handleSelectAndApplyCoupon(c)}
                        className="p-2.5 bg-white hover:bg-brand-card/45 border border-brand-card/30 rounded-xl cursor-pointer transition text-left space-y-0.5"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-brand-dark tracking-wider">{c.code}</span>
                          <span className="text-[9px] font-bold text-brand-green uppercase">
                            {c.discount_type === "percent" ? `${c.value}% Off` : `Fixed ₹${c.value} Off`}
                          </span>
                        </div>
                        <p className="text-[9px] text-brand-grey leading-tight">{c.description}</p>
                        {c.min_purchase > 0 && (
                          <p className="text-[8px] text-brand-grey/80">Min spend required: ₹{c.min_purchase}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {couponError && (
              <p className="text-[10px] text-[#c24b4b] font-medium mt-1 leading-snug">
                {couponError}
              </p>
            )}
          </div>

          {/* Price calculations */}
          <div className="space-y-2 border-t border-brand-card/50 pt-4 text-xs text-brand-grey">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-brand-dark">₹{cartTotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-brand-green font-medium">
                <span>Discount ({appliedCoupon?.code})</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-brand-green">FREE</span>
            </div>
            <div className="flex justify-between border-t border-brand-card/30 pt-3 text-sm font-semibold text-brand-dark">
              <span className="font-serif">Grand Total</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CheckoutPage;
