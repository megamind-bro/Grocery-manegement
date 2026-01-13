import { createContext, useContext, useReducer, useEffect, useState } from "react";

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      let newItems;

      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      return calculateTotals({ ...state, items: newItems });
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(item => item.id !== action.payload);
      return calculateTotals({ ...state, items: newItems });
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);

      return calculateTotals({ ...state, items: newItems });
    }

    case "CLEAR_CART": {
      return calculateTotals({ ...state, items: [] });
    }

    case "LOAD_CART": {
      return calculateTotals({ ...state, items: action.payload });
    }

    default:
      return state;
  }
}

function calculateTotals(state) {
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate subtotal and per-item discounts
  let subtotal = 0;
  let discount = 0;

  for (const item of state.items) {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    // Apply per-product discount if available
    if (item.discount && item.discount > 0) {
      discount += item.discount * item.quantity;
    }
  }

  const deliveryFee = subtotal > 0 ? 50 : 0; // KSh 50 delivery fee
  const total = subtotal + deliveryFee - discount;

  return {
    ...state,
    itemCount,
    subtotal,
    deliveryFee,
    discount,
    total,
  };
}

const initialState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  deliveryFee: 0,
  discount: 0,
  total: 0,
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("local"); // "local" | "api"

  const loadCartFromLocal = () => {
    const savedCart = localStorage.getItem("freshmart-cart");
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: "LOAD_CART", payload: cartItems });
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    } else {
      dispatch({ type: "LOAD_CART", payload: [] });
    }
  };

  const fetchCartFromApi = async () => {
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      dispatch({ type: "LOAD_CART", payload: data.items || [] });
      setMode("api");
    } catch (error) {
      console.error("Failed to load cart from API:", error);
      setMode("local");
      loadCartFromLocal();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            // User is logged in - always use API cart
            await fetchCartFromApi();
            return;
          }
        }
      } catch (error) {
        console.error("Failed to determine auth state:", error);
      }
      // User is not logged in - use local storage
      setMode("local");
      loadCartFromLocal();
      setLoading(false);
    })();
  }, []);

  // Periodically sync cart from API if in API mode
  useEffect(() => {
    if (mode !== "api" || loading) return;

    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/cart", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          syncApiCart(data.items || []);
        }
      } catch (error) {
        console.error("Failed to sync cart:", error);
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, [mode, loading]);

  useEffect(() => {
    if (loading) return;
    if (mode === "local") {
      localStorage.setItem("freshmart-cart", JSON.stringify(state.items));
    }
  }, [state.items, loading, mode]);

  const syncApiCart = (items) => {
    dispatch({ type: "LOAD_CART", payload: items || [] });
  };

  const addToCart = async (product) => {
    if (mode === "api") {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }
      syncApiCart(data.items || []);
    } else {
      dispatch({ type: "ADD_ITEM", payload: product });
    }
  };

  const removeFromCart = async (id) => {
    if (mode === "api") {
      const res = await fetch(`/api/cart/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to remove from cart");
      }
      syncApiCart(data.items || []);
    } else {
      dispatch({ type: "REMOVE_ITEM", payload: id });
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (mode === "api") {
      const updatedItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0);
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: updatedItems }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to update cart");
      }
      syncApiCart(data.items || []);
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    }
  };

  const clearCart = async () => {
    if (mode === "api") {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to clear cart");
      }
      syncApiCart([]);
    } else {
      dispatch({ type: "CLEAR_CART" });
    }
  };

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: async () => {
          setLoading(true);
          try {
            const res = await fetch("/api/auth/me", { credentials: "include" });
            if (res.ok) {
              const data = await res.json();
              if (data && data.id) {
                await fetchCartFromApi();
                return;
              }
            }
          } catch (error) {
            console.error("Failed to refresh auth state:", error);
          }
          setMode("local");
          loadCartFromLocal();
          setLoading(false);
        },
        loading,
        mode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
