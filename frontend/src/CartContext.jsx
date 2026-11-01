import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

function readCart() {
  try {
    return JSON.parse(localStorage.getItem("gadgetcrate_cart") || "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem("gadgetcrate_cart", JSON.stringify(items));
  }, [items]);

  function addToCart(product) {
    setItems((current) => {
      const found = current.find((item) => item._id === product._id);

      if (found) {
        return current.map((item) =>
          item._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId) {
    setItems((current) => current.filter((item) => item._id !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, total, count, addToCart, removeFromCart, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}