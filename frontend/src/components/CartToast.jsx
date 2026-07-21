import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShoppingCart, X } from "lucide-react";
import { useCart } from "../context/CartContext";

export const CartToast = () => {
  const { toast, setToast } = useCart();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-24 right-6 z-50 w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl border border-brand-card/60 shadow-2xl p-4 flex gap-4 overflow-hidden"
        >
          {/* Animated Auto-dismiss duration bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 4, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-brand-dark/30"
          />

          {/* Product Thumbnail */}
          <div className="w-12 h-12 bg-brand-bg rounded-xl overflow-hidden flex-shrink-0 border border-brand-card/30">
            <img
              src={toast.product.images?.[0] || "/images/sunscreen.png"}
              alt={toast.product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Toast Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-bold text-brand-green tracking-wider uppercase mb-1">
              <CheckCircle2 size={12} className="stroke-[2.5]" />
              Added to Cart
            </div>
            <h4 className="text-xs font-semibold text-brand-dark truncate">
              {toast.product.name}
            </h4>
            <p className="text-[10px] text-brand-grey mt-0.5">
              Qty: {toast.quantity} • ₹{toast.product.price * toast.quantity}
            </p>
            
            <div className="mt-2.5 flex items-center gap-3">
              <Link
                to="/cart"
                onClick={() => setToast(null)}
                className="text-[10px] uppercase tracking-wider font-bold text-brand-dark hover:underline flex items-center gap-1"
              >
                <ShoppingCart size={11} /> View Cart
              </Link>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setToast(null)}
            className="text-brand-grey hover:text-brand-dark transition-colors self-start p-0.5 rounded-full hover:bg-brand-bg"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
