import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Trash2, ArrowRight, Tag, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Button } from "../components/Button";

export const CartPage = () => {
  const { cart, cartTotal, updateQty, removeFromCart, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const navigate = useNavigate();

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError("");
    if (promoCode.toUpperCase() === "GLOW10") {
      setDiscountApplied(true);
    } else {
      setPromoError("Invalid code. Try GLOW10 for 10% off.");
    }
  };

  const discountAmount = discountApplied ? Math.round(cartTotal * 0.1) : 0;
  const finalTotal = cartTotal - discountAmount;

  return (
    <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
      <div className="text-left mb-8 border-b border-brand-card/30 pb-4">
        <h1 className="font-serif text-2xl md:text-3xl font-medium text-brand-dark">Shopping Cart</h1>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-brand-card/50 shadow-sm max-w-xl mx-auto px-6">
          <div className="w-16 h-16 rounded-full bg-brand-card flex items-center justify-center text-brand-grey mb-6">
            <ShoppingBag size={24} />
          </div>
          <h2 className="font-serif text-lg md:text-xl font-semibold text-brand-dark mb-2">Your Cart is Empty</h2>
          <p className="text-xs md:text-sm text-brand-grey max-w-xs mb-8 leading-relaxed">
            Looks like you haven't added any products to your skincare ritual yet. Let's find some!
          </p>
          <Link to="/">
            <Button variant="primary" className="text-xs uppercase tracking-widest py-3.5 px-8">
              <ArrowLeft size={14} className="mr-1.5" /> Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-brand-card/50 shadow-sm overflow-hidden p-6">
              <div className="divide-y divide-brand-card/50">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-6 py-6 first:pt-0 last:pb-0">
                    {/* Image */}
                    <div className="w-24 h-28 bg-brand-bg rounded-2xl p-2 flex items-center justify-center border border-brand-card/30 flex-shrink-0 mx-auto sm:mx-0">
                      <img src={item.images[0]} alt={item.name} className="max-h-full object-contain" />
                    </div>

                    {/* Details */}
                    <div className="flex-grow flex flex-col justify-between text-left">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-brand-grey">{item.netVolume}</span>
                          <h3 className="font-serif text-base font-semibold text-brand-dark mt-0.5">{item.name}</h3>
                          <p className="text-xs text-brand-grey mt-1 line-clamp-1">{item.subtitle}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-brand-grey hover:text-[#c24b4b] p-1.5 hover:bg-brand-bg rounded-full transition-colors flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        {/* Stepper */}
                        <div className="flex items-center border border-brand-card rounded-full bg-brand-bg px-2.5 py-0.5">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center font-bold text-brand-grey hover:text-brand-dark"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-brand-dark">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center font-bold text-brand-grey hover:text-brand-dark"
                          >
                            +
                          </button>
                        </div>

                        {/* Total Price */}
                        <div className="text-right">
                          <span className="text-base font-bold text-brand-dark">₹{item.price * item.quantity}</span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-brand-grey block mt-0.5">₹{item.price} each</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="border-t border-brand-card/50 pt-6 mt-6 flex justify-between items-center">
                <Link to="/" className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1.5">
                  <ArrowLeft size={14} /> Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="text-xs text-brand-grey hover:text-brand-dark transition-colors flex items-center gap-1"
                >
                  <Trash2 size={14} /> Clear Cart
                </button>
              </div>
            </div>
          </div>

          {/* Cart Sidebar Summary */}
          <div className="lg:col-span-4 space-y-6">
            {/* Promo Code Card */}
            <div className="bg-white rounded-3xl border border-brand-card/50 shadow-sm p-6 text-left">
              <h3 className="font-serif text-sm font-semibold text-brand-dark flex items-center gap-1.5 mb-4">
                <Tag size={16} className="text-brand-accent" /> Promo / Discount Code
              </h3>
              
              {discountApplied ? (
                <div className="p-3.5 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check size={14} className="stroke-[3]" /> Code <strong>GLOW10</strong> applied</span>
                  <button onClick={() => setDiscountApplied(false)} className="underline font-semibold hover:text-brand-dark">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter GLOW10"
                    className="flex-grow px-4 py-2.5 bg-brand-bg/50 border border-brand-card rounded-xl text-xs uppercase focus:outline-none focus:border-brand-dark transition-colors"
                  />
                  <Button type="submit" variant="secondary" className="px-4 py-2.5 text-xs">
                    Apply
                  </Button>
                </form>
              )}
              {promoError && <p className="text-[10px] text-red-600 mt-1.5 font-medium">{promoError}</p>}
            </div>

            {/* Price Calculations Card */}
            <div className="bg-white rounded-3xl border border-brand-card/50 shadow-sm p-6 text-left space-y-4">
              <h3 className="font-serif text-base font-semibold text-brand-dark">Order Summary</h3>
              
              <div className="space-y-2 border-b border-brand-card/45 pb-4 text-xs text-brand-grey">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-brand-dark">₹{cartTotal}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-brand-green">
                    <span>Promo Discount (10%)</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span className="font-semibold text-brand-green">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline font-semibold text-brand-dark">
                <span className="font-serif text-base">Estimated Total</span>
                <span className="text-xl">₹{finalTotal}</span>
              </div>

              <Button
                onClick={() => navigate("/checkout")}
                className="w-full py-4 text-xs uppercase tracking-widest flex items-center justify-center gap-1.5"
              >
                Proceed to Checkout <ArrowRight size={14} />
              </Button>

              <div className="pt-2 text-center">
                <p className="text-[10px] text-brand-grey">Secure payments via UPI, Debit/Credit Card, and COD.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CartPage;
