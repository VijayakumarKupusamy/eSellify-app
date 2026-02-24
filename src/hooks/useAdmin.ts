import { useState, useEffect, useCallback } from 'react';
import { User, Product, Order, SellerProfile, AdminStats, ActivityLog, Report } from '../types';
import { adminApi } from '../services/api';

export const useAdmin = () => {
  const [stats, setStats]           = useState<AdminStats | null>(null);
  const [users, setUsers]           = useState<User[]>([]);
  const [products, setProducts]     = useState<Product[]>([]);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [sellers, setSellers]       = useState<SellerProfile[]>([]);
  const [activityLogs, setLogs]     = useState<ActivityLog[]>([]);
  const [reports, setReports]       = useState<Report[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [fetchKey, setFetchKey]     = useState(0);

  const refetch = useCallback(() => {
    setError(null);
    setFetchKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([
      adminApi.getStats(),
      adminApi.getAllUsers(),
      adminApi.getAllProducts(),
      adminApi.getAllOrders(),
      adminApi.getAllSellers(),
      adminApi.getActivityLogs(),
      adminApi.getAllReports(),
    ])
      .then(([s, u, p, o, sl, logs, reps]) => {
        if (cancelled) return;
        setStats(s);
        setUsers(u);
        setProducts(p);
        setOrders(o);
        setSellers(sl);
        setLogs(logs);
        setReports(reps);
      })
      .catch((err) => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [fetchKey]);

  // ── User actions ──────────────────────────────────────────────────────────
  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      const updated = await adminApi.updateUser(id, updates);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  // ── Product actions ───────────────────────────────────────────────────────
  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const updated = await adminApi.updateProduct(id, updates);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  // ── Seller actions ────────────────────────────────────────────────────────
  const verifySeller = useCallback(async (id: string) => {
    try {
      const updated = await adminApi.verifySeller(id);
      setSellers((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  const suspendSeller = useCallback(async (_sellerId: string, userId: string) => {
    const owner = users.find((u) => u.id === userId);
    const newStatus: 'suspended' | 'active' = owner?.status === 'suspended' ? 'active' : 'suspended';
    try {
      await adminApi.updateUser(userId, { status: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, [users]);

  // ── Order actions ─────────────────────────────────────────────────────────
  const updateOrderStatus = useCallback(async (id: string, status: Order['status']) => {
    try {
      const updated = await adminApi.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  // ── Report actions ────────────────────────────────────────────────────────
  const resolveReport = useCallback(async (id: string, status: 'resolved' | 'dismissed') => {
    try {
      const updated = await adminApi.updateReport(id, {
        status,
        resolvedAt: new Date().toISOString(),
      });
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (stats) {
        setStats((prev) => prev ? { ...prev, pendingReports: Math.max(0, prev.pendingReports - 1) } : prev);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, [stats]);

  return {
    stats,
    users,
    products,
    orders,
    sellers,
    activityLogs,
    reports,
    isLoading,
    error,
    refetch,
    updateUser,
    deleteUser,
    updateProduct,
    deleteProduct,
    verifySeller,
    suspendSeller,
    updateOrderStatus,
    resolveReport,
  };
};
