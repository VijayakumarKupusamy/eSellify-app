import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilters } from '../types';
import { productsApi } from '../services/api';

export const useProducts = () => {
  const [products, setProducts]   = useState<Product[]>([]);
  const [featured, setFeatured]   = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [filters, setFilters]     = useState<ProductFilters>({});

  // Fetch filtered products whenever filters change
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    productsApi.getAll(filters)
      .then((data) => { if (!cancelled) setProducts(data); })
      .catch((err) => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [filters]);

  // Fetch featured products once on mount
  useEffect(() => {
    productsApi.getFeatured()
      .then(setFeatured)
      .catch(() => { /* ignore */ });
  }, []);

  const getProductById = useCallback((id: string): Promise<Product> => {
    return productsApi.getById(id);
  }, []);

  return { products, featuredProducts: featured, isLoading, error, filters, setFilters, getProductById };
};
