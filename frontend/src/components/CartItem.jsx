import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export const CartItem = ({ item }) => {
  const { updateQty, removeFromCart } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b border-brand-card/50">
      {/* Product Image */}
      <div className="w-20 h-24 bg-brand-bg rounded-xl p-2 flex items-center justify-center flex-shrink-0 border border-brand-card/30">
        <img
          src={item.images[0]}
          alt={item.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Item Details */}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h4 className="font-serif text-sm font-semibold text-brand-dark line-clamp-1">
              {item.name}
            </h4>
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-brand-grey hover:text-[#c24b4b] p-1 transition-colors"
              title="Remove Item"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey block mt-0.5">
            {item.netVolume}
          </span>
        </div>

        {/* Stepper & Price */}
        <div className="flex justify-between items-end mt-2">
          {/* Qty Stepper */}
          <div className="flex items-center border border-brand-card rounded-full bg-brand-bg px-2 py-0.5">
            <button
              onClick={() => updateQty(item.id, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center text-brand-grey hover:text-brand-dark transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-xs font-semibold text-brand-dark">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQty(item.id, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-brand-grey hover:text-brand-dark transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Pricing */}
          <div className="text-right">
            <span className="text-sm font-semibold text-brand-dark block">
              ₹{item.price * item.quantity}
            </span>
            {item.quantity > 1 && (
              <span className="text-[10px] text-brand-grey">
                ₹{item.price} each
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CartItem;
