import React, { createContext, useContext, useReducer, useEffect, useState } from "react";

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        let newQty = newItems[existingItemIndex].quantity + quantity;
        if (product.available_stock !== undefined && newQty > product.available_stock) {
          newQty = product.available_stock;
        }
        newItems[existingItemIndex].quantity = newQty;
        return { ...state, items: newItems };
      }

      let newQty = quantity;
      if (product.available_stock !== undefined && newQty > product.available_stock) {
        newQty = product.available_stock;
      }

      return {
        ...state,
        items: [...state.items, { ...product, quantity: newQty }]
      };
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case "UPDATE_QTY": {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== productId)
        };
      }
      return {
        ...state,
        items: state.items.map(item => {
          if (item.id === productId) {
            let newQty = quantity;
            if (item.available_stock !== undefined && newQty > item.available_stock) {
              newQty = item.available_stock;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
};

const getInitialCartState = () => {
  try {
    const saved = localStorage.getItem("luscent_cart");
    return saved ? JSON.parse(saved) : { items: [] };
  } catch {
    return { items: [] };
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, null, getInitialCartState);

  useEffect(() => {
    localStorage.setItem("luscent_cart", JSON.stringify(state));
  }, [state]);

  const [toast, setToast] = useState(null);

  const addToCart = (product, quantity = 1) => {
    dispatch({ type: "ADD_TO_CART", payload: { product, quantity } });
    setToast({
      id: Date.now(),
      product,
      quantity
    });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
  };

  const updateQty = (productId, quantity) => {
    dispatch({ type: "UPDATE_QTY", payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const cartCount = state.items.reduce((acc, item) => acc + item.quantity, 0);
  
  const cartTotal = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart: state.items,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toast,
        setToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
