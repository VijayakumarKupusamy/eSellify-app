import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { Cart, CartItem, Product } from '../types';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartContextValue {
  cart: Cart;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

type CartAction =
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QTY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

// ─── Reducer ──────────────────────────────────────────────────────────────────
const cartReducer = (items: CartItem[], action: CartAction): CartItem[] => {
  switch (action.type) {
    case 'LOAD_CART':
      return action.payload;
    case 'ADD_ITEM': {
      const existing = items.find((i) => i.product.id === action.payload.product.id);
      if (existing) {
        return items.map((i) =>
          i.product.id === action.payload.product.id
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      }
      return [...items, { product: action.payload.product, quantity: action.payload.quantity }];
    }
    case 'REMOVE_ITEM':
      return items.filter((i) => i.product.id !== action.payload);
    case 'UPDATE_QTY':
      if (action.payload.quantity <= 0) {
        return items.filter((i) => i.product.id !== action.payload.productId);
      }
      return items.map((i) =>
        i.product.id === action.payload.productId
          ? { ...i, quantity: action.payload.quantity }
          : i
      );
    case 'CLEAR_CART':
      return [];
    default:
      return items;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, dispatch] = useReducer(cartReducer, []);
  const [isLoading, setIsLoading] = React.useState(false);

  // serverIds maps productId -> server cartItem record id (for PATCH/DELETE)
  const serverIds = useRef<Map<string, string>>(new Map());

  // ── Load cart from server when user logs in / changes ─────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) {
      dispatch({ type: 'CLEAR_CART' });
      serverIds.current.clear();
      return;
    }
    (async () => {
      setIsLoading(true);
      try {
        const records = await cartApi.getByUser(user.id);
        serverIds.current.clear();
        records.forEach((r) => serverIds.current.set(r.productId, r.id));
        dispatch({ type: 'LOAD_CART', payload: records.map((r) => ({ product: r.product, quantity: r.quantity })) });
      } catch { /* keep local state */ }
      finally { setIsLoading(false); }
    })();
  }, [user?.id, isAuthenticated]);

  const cart: Cart = useMemo(() => {
    const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    return { items, total, itemCount };
  }, [items]);

  // ── Add to Cart ───────────────────────────────────────────────────────────
  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    if (isAuthenticated && user) {
      try {
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
          const serverId = serverIds.current.get(product.id);
          if (serverId) {
            await cartApi.updateItem(serverId, existing.quantity + quantity);
          }
        } else {
          const record = await cartApi.addItem(user.id, product, quantity);
          serverIds.current.set(product.id, record.id);
        }
      } catch { /* silently fail — local state already updated */ }
    }
  }, [isAuthenticated, user, items]);

  // ── Remove from Cart ──────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    if (isAuthenticated) {
      const serverId = serverIds.current.get(productId);
      if (serverId) {
        try { await cartApi.removeItem(serverId); } catch { /* ignore */ }
        serverIds.current.delete(productId);
      }
    }
  }, [isAuthenticated]);

  // ── Update Quantity ───────────────────────────────────────────────────────
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QTY', payload: { productId, quantity } });
    if (isAuthenticated) {
      const serverId = serverIds.current.get(productId);
      if (serverId) {
        try {
          if (quantity <= 0) {
            await cartApi.removeItem(serverId);
            serverIds.current.delete(productId);
          } else {
            await cartApi.updateItem(serverId, quantity);
          }
        } catch { /* ignore */ }
      }
    }
  }, [isAuthenticated]);

  // ── Clear Cart ────────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    dispatch({ type: 'CLEAR_CART' });
    if (isAuthenticated && user) {
      try { await cartApi.clearByUser(user.id); } catch { /* ignore */ }
      serverIds.current.clear();
    }
  }, [isAuthenticated, user]);

  const isInCart = useCallback(
    (productId: string) => items.some((i) => i.product.id === productId),
    [items]
  );

  return (
    <CartContext.Provider value={{ cart, isLoading, addToCart, removeFromCart, updateQuantity, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
