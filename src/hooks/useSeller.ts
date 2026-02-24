import { useState, useEffect, useCallback } from 'react';
import { SellerProfile, Product, Order, ProductFormData } from '../types';
import { sellerApi, ordersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useSeller = () => {
  const { user } = useAuth();

  const [store, setStore]           = useState<SellerProfile | null>(null);
  const [products, setProducts]     = useState<Product[]>([]);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // ── Load seller store + products + orders ─────────────────────────────────
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setIsLoading(true);

    sellerApi.getByUser(user.id)
      .then(async (stores) => {
        if (cancelled) return;
        const s = stores[0] ?? null;
        setStore(s);
        if (s) {
          const [prods, ords] = await Promise.all([
            sellerApi.getProducts(s.id),
            ordersApi.getAll(),               // filter client-side by sellerId
          ]);
          if (!cancelled) {
            setProducts(prods);
            // orders that contain at least one product belonging to this seller
            setOrders(ords.filter((o) =>
              o.items.some((i) => prods.some((p) => p.id === i.product.id))
            ));
          }
        }
      })
      .catch((err) => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [user?.id]);

  // ── Computed seller stats ──────────────────────────────────────────────────
  const stats = store
    ? {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: store.totalRevenue,
        pendingOrders: orders.filter((o) => o.status === 'pending' || o.status === 'processing').length,
        averageRating:
          products.length > 0
            ? products.reduce((s, p) => s + p.rating, 0) / products.length
            : 0,
        revenueGrowth: 12.4, // could be computed from salesData in a real app
      }
    : null;

  // ── Product CRUD ─────────────────────────────────────────────────────────
  const addProduct = useCallback(async (data: ProductFormData) => {
    if (!store || !user) return { success: false, error: 'Not a seller' };
    try {
      const created = await sellerApi.createProduct(store.id, store.storeName, data);
      setProducts((prev) => [created, ...prev]);
      await sellerApi.updateStore(store.id, { totalProducts: products.length + 1 });
      setStore((prev) => prev ? { ...prev, totalProducts: products.length + 1 } : prev);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, [store, user, products.length]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const updated = await sellerApi.updateProduct(id, updates);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await sellerApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  // ── Store settings ────────────────────────────────────────────────────────
  const updateStore = useCallback(async (updates: Partial<SellerProfile>) => {
    if (!store) return { success: false, error: 'No store found' };
    try {
      const updated = await sellerApi.updateStore(store.id, updates);
      setStore(updated);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, [store]);

  // ── Create store (first time seller) ─────────────────────────────────────
  const createStore = useCallback(async (storeName: string, storeDescription: string, category: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const newStore: Omit<SellerProfile, 'id'> = {
        userId: user.id,
        storeName,
        storeDescription,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=6366f1&color=fff&size=128`,
        category,
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
        averageRating: 0,
        joinedAt: new Date().toISOString().split('T')[0],
        isVerified: false,
        salesData: [],
      };
      const created = await sellerApi.createStore(newStore);
      setStore(created);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, [user]);

  // ── Order management ──────────────────────────────────────────────────────
  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    try {
      const updated = await ordersApi.updateStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  return {
    store,
    products,
    orders,
    stats,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStore,
    createStore,
    updateOrderStatus,
    setProducts,
  };
};
