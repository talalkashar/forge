"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CART_STORAGE_KEY = "forge_cart";

/**
 * @typedef {{
 *   name: string;
 *   slug: string;
 *   price: number;
 *   images: string[];
 *   quantity: number;
 *   cartKey?: string;
 *   href?: string;
 * }} CartItem
 *
 * @typedef {{
 *   name?: string;
 *   slug?: string;
 *   price?: number;
 *   images?: string[];
 *   quantity?: number;
 *   cartKey?: string;
 *   href?: string;
 * }} CartProductInput
 *
 * @typedef {{
 *   cart: CartItem[];
 *   addToCart: (product: CartProductInput) => void;
 *   removeFromCart: (slugOrKey: string) => void;
 *   updateQuantity: (slugOrKey: string, nextQuantity: number) => void;
 *   clearCart: () => void;
 *   cartCount: number;
 *   cartSubtotal: number;
 *   isHydrated: boolean;
 * }} CartContextValue
 */

const CartContext = createContext(
  /** @type {CartContextValue | undefined} */ (undefined),
);

/**
 * @param {CartProductInput} product
 * @returns {CartItem | null}
 */
function normalizeCartItem(product) {
  if (!product || typeof product !== "object") {
    return null;
  }

  if (typeof product.name !== "string" || typeof product.slug !== "string") {
    return null;
  }

  return {
    name: product.name,
    slug: product.slug,
    price: Number(product.price) || 0,
    images: Array.isArray(product.images) ? product.images : [],
    quantity: Math.max(1, Number(product.quantity) || 1),
    cartKey:
      typeof product.cartKey === "string" && product.cartKey.length > 0
        ? product.cartKey
        : undefined,
    href:
      typeof product.href === "string" && product.href.length > 0
        ? product.href
        : undefined,
  };
}

function readStoredCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!rawCart) {
      return [];
    }

    const parsed = JSON.parse(rawCart);

    if (!Array.isArray(parsed?.items)) {
      return [];
    }

    return parsed.items
      .map((item) => normalizeCartItem(item))
      .filter((item) => item && item.images);
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(/** @type {CartItem[]} */ ([]));
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCart(readStoredCart());
      setIsHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: cart }));
  }, [cart, isHydrated]);

  useEffect(() => {
    const handleStorage = () => {
      setCart(readStoredCart());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCart((currentCart) => currentCart.filter((item) => item && item.images));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const addToCart = useCallback((product) => {
    const normalizedProduct = normalizeCartItem(product);

    if (!normalizedProduct) {
      return;
    }

    setCart((currentCart) => {
      const itemKey = normalizedProduct.cartKey ?? normalizedProduct.slug;
      const existingItem = currentCart.find(
        (item) => (item.cartKey ?? item.slug) === itemKey,
      );

      if (existingItem) {
        return currentCart.map((item) =>
          (item.cartKey ?? item.slug) === itemKey
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          ...normalizedProduct,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((slugOrKey) => {
    setCart((currentCart) =>
      currentCart.filter((item) => (item.cartKey ?? item.slug) !== slugOrKey),
    );
  }, []);

  const updateQuantity = useCallback((slugOrKey, nextQuantity) => {
    if (nextQuantity <= 0) {
      removeFromCart(slugOrKey);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        (item.cartKey ?? item.slug) === slugOrKey
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount: cart.reduce((total, item) => total + (item.quantity ?? 0), 0),
      cartSubtotal: cart.reduce(
        (total, item) => total + Number(item.price ?? 0) * Number(item.quantity ?? 0),
        0,
      ),
      isHydrated,
    }),
    [addToCart, cart, clearCart, isHydrated, removeFromCart, updateQuantity],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
