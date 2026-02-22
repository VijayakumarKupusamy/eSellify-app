/// <reference types="vite/client" />
import { Product, ProductFilters, User, Order, Review, DashboardStats, SalesData } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('esellify_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== 'All')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}

// ─── Products API ─────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (filters: ProductFilters = {}): Promise<Product[]> => {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters.category && filters.category !== 'All') params['category'] = filters.category;
    if (filters.minRating) params['rating_gte'] = filters.minRating;
    if (filters.minPrice !== undefined) params['price_gte'] = filters.minPrice;
    if (filters.maxPrice !== undefined) params['price_lte'] = filters.maxPrice;

    // Sorting
    if (filters.sortBy === 'price-asc') { params['_sort'] = 'price'; params['_order'] = 'asc'; }
    if (filters.sortBy === 'price-desc') { params['_sort'] = 'price'; params['_order'] = 'desc'; }
    if (filters.sortBy === 'rating') { params['_sort'] = 'rating'; params['_order'] = 'desc'; }

    // Full-text search via json-server
    if (filters.search) params['q'] = filters.search;

    return request<Product[]>(`/products${buildQuery(params)}`);
  },

  getById: (id: string): Promise<Product> =>
    request<Product>(`/products/${id}`),

  getFeatured: (): Promise<Product[]> =>
    request<Product[]>('/products?featured=true'),

  create: (product: Omit<Product, 'id'>): Promise<Product> =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(product) }),

  update: (id: string, updates: Partial<Product>): Promise<Product> =>
    request<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),

  delete: (id: string): Promise<void> =>
    request<void>(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, confirmPassword: string): Promise<AuthResponse> =>
    request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    }),

  getProfile: (): Promise<User> =>
    request<User>('/profile'),

  updateProfile: (id: string, updates: Partial<User>): Promise<User> =>
    request<User>(`/profile/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
};

// ─── Orders API ───────────────────────────────────────────────────────────────
export const ordersApi = {
  getByUser: (userId: string): Promise<Order[]> =>
    request<Order[]>(`/orders?userId=${userId}`),

  getById: (id: string): Promise<Order> =>
    request<Order>(`/orders/${id}`),

  getAll: (): Promise<Order[]> =>
    request<Order[]>('/orders'),

  create: (order: Omit<Order, 'id'>): Promise<Order> =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(order) }),

  updateStatus: (id: string, status: Order['status']): Promise<Order> =>
    request<Order>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status, updatedAt: new Date().toISOString() }) }),
};

// ─── Reviews API ──────────────────────────────────────────────────────────────
export const reviewsApi = {
  getByProduct: (productId: string): Promise<Review[]> =>
    request<Review[]>(`/reviews?productId=${productId}`),

  getAll: (): Promise<Review[]> =>
    request<Review[]>('/reviews'),

  create: (review: Omit<Review, 'id'>): Promise<Review> =>
    request<Review>('/reviews', { method: 'POST', body: JSON.stringify({ ...review, id: 'rev_' + Date.now() }) }),

  delete: (id: string): Promise<void> =>
    request<void>(`/reviews/${id}`, { method: 'DELETE' }),
};

// ─── Cart API (persisted per user) ───────────────────────────────────────────
export interface CartItemRecord {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  quantity: number;
}

export const cartApi = {
  getByUser: (userId: string): Promise<CartItemRecord[]> =>
    request<CartItemRecord[]>(`/cartItems?userId=${userId}`),

  addItem: (userId: string, product: Product, quantity: number): Promise<CartItemRecord> =>
    request<CartItemRecord>('/cartItems', {
      method: 'POST',
      body: JSON.stringify({ id: `cart_${userId}_${product.id}_${Date.now()}`, userId, productId: product.id, product, quantity }),
    }),

  updateItem: (id: string, quantity: number): Promise<CartItemRecord> =>
    request<CartItemRecord>(`/cartItems/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (id: string): Promise<void> =>
    request<void>(`/cartItems/${id}`, { method: 'DELETE' }),

  clearByUser: async (userId: string): Promise<void> => {
    const items = await cartApi.getByUser(userId);
    await Promise.all(items.map((i) => cartApi.removeItem(i.id)));
  },
};

// ─── Categories API ───────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: (): Promise<{ id: number; name: string }[]> =>
    request<{ id: number; name: string }[]>('/categories'),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    request<DashboardStats>('/dashboardStats'),

  getSalesData: (): Promise<SalesData[]> =>
    request<SalesData[]>('/salesData'),
};
