import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import { ordersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useOrders = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders]       = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Fetch user orders when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    ordersApi.getByUser(user.id)
      .then((data) => { if (!cancelled) setOrders(data); })
      .catch((err) => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id, isAuthenticated]);

  const placeOrder = useCallback(async (order: Omit<Order, 'id'>): Promise<Order> => {
    const created = await ordersApi.create(order);
    setOrders((prev) => [created, ...prev]);
    return created;
  }, []);

  const cancelOrder = useCallback(async (orderId: string) => {
    const updated = await ordersApi.updateStatus(orderId, 'cancelled');
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
  }, []);

  // Admin: fetch all orders
  const getAllOrders = useCallback(async (): Promise<Order[]> => {
    return ordersApi.getAll();
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    const updated = await ordersApi.updateStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    return updated;
  }, []);

  return { orders, isLoading, error, placeOrder, cancelOrder, getAllOrders, updateOrderStatus };
};
