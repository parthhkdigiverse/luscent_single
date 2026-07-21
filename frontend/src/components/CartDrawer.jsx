import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { CartItem } from "./CartItem";
import { Button } from "./Button";
import { motion, AnimatePresence } from "framer-motion";

export const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCheckoutClick = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 transition-opacity"
          />

          {/* Slide-out Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-brand-bg shadow-2xl z-50 flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-card/50 bg-white">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-brand-dark" />
                <h2 className="font-serif text-lg font-semibold text-brand-dark">Your Cart</h2>
                <span className="bg-brand-card text-brand-dark text-xs px-2.5 py-0.5 rounded-full font-sans font-semibold">
                  {cartCount}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-brand-bg text-brand-grey hover:text-brand-dark transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto px-6 py-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-brand-card flex items-center justify-center text-brand-grey mb-4">
                    <ShoppingBag size={24} />
                  </div>
                  <h3 className="font-serif text-base font-semibold text-brand-dark mb-1">
                    Your cart is empty
                  </h3>
                  <p className="text-xs text-brand-grey max-w-[240px] mb-6">
                    Add our sunscreen or gentle face wash to start your daily skin ritual.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onClose();
                      navigate("/");
                    }}
                    size="sm"
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-brand-card/50">
                  {cart.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom summary / checkout actions */}
            {cart.length > 0 && (
              <div className="bg-white border-t border-brand-card/50 px-6 py-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-brand-grey">
                    <span>Shipping</span>
                    <span className="font-semibold text-brand-green">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-brand-dark">
                    <span className="font-serif">Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <p className="text-[10px] text-brand-grey text-right">
                    Taxes and discounts calculated at checkout.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onClose();
                      navigate("/cart");
                    }}
                    className="w-full py-3 text-xs"
                  >
                    View Full Cart
                  </Button>
                  <Button
                    onClick={handleCheckoutClick}
                    className="w-full py-3 text-xs"
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
