import { useState, useEffect } from 'react';
import { DashboardStats, SalesData } from '../types';
import { dashboardApi, ordersApi, productsApi } from '../services/api';

export const useDashboard = () => {
  const [stats, setStats]         = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getSalesData(),
    ])
      .then(([s, sd]) => {
        if (!cancelled) {
          setStats(s);
          setSalesData(sd);
        }
      })
      .catch((err) => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const refreshStats = async () => {
    try {
      const [s, sd] = await Promise.all([dashboardApi.getStats(), dashboardApi.getSalesData()]);
      setStats(s);
      setSalesData(sd);
    } catch { /* ignore */ }
  };

  return {
    stats,
    salesData,
    isLoading,
    error,
    refreshStats,
    ordersApi,
    productsApi,
  };
};
