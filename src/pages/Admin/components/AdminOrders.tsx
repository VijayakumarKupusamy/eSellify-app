import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../../../types';

const Spinner = () => (
  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const ActionBanner: React.FC<{ type: 'success' | 'error'; message: string; onClose: () => void }> = ({ type, message, onClose }) => (
  <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium border ${
    type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
  }`}>
    {type === 'success'
      ? <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      : <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    }
    <span className="flex-1">{message}</span>
    <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-1">✕</button>
  </div>
);

interface AdminOrdersProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: Order['status']) => Promise<{ success: boolean; error?: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-600',
};

const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onUpdateStatus }) => {
  const [search, setSearch]   = useState('');
  const [statusFilter, setSF] = useState('All');
  const [expanded, setExpX]   = useState<string | null>(null);
  const [busy, setBusy]       = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification({ type, message });
    timerRef.current = setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const STATUSES = ['All', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const counts = STATUSES.slice(1).reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
                        o.userId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatus = async (id: string, status: Order['status']) => {
    setBusy(id);
    const result = await onUpdateStatus(id, status);
    setBusy(null);
    result.success
      ? notify('success', `Order ${id} moved to ${status}.`)
      : notify('error', result.error ?? 'Failed to update order status.');
  };

  const NEXT_STATUS: Partial<Record<Order['status'], Order['status'][]>> = {
    pending:    ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped:    ['delivered'],
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {notification && <ActionBanner type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setSF(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              statusFilter === s
                ? 'bg-brand text-white border-brand'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {s === 'All' ? 'All Orders' : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'All' && counts[s] > 0 && (
              <span className={`ml-1.5 text-[10px] rounded-full px-1.5 ${statusFilter === s ? 'bg-white/20' : 'bg-gray-100'}`}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID…" className="input-field pl-10" />
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.map((order) => (
          <div key={order.id} className="card overflow-hidden">
            <button
              onClick={() => setExpX(expanded === order.id ? null : order.id)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Order</p>
                  <p className="font-medium text-gray-900 text-sm">{order.id}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="text-sm text-gray-700">{order.userId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-semibold text-gray-900 text-sm">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded === order.id ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expanded === order.id && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                {/* Items */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Items</p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={item.product.images?.[0]} alt={item.product.name} className="w-8 h-8 rounded object-cover border border-gray-100" />
                        <span className="text-sm text-gray-800 flex-1">{item.product.name}</span>
                        <span className="text-xs text-gray-500">×{item.quantity}</span>
                        <span className="text-sm font-medium">${item.product.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Ship to</p>
                  <p className="text-sm text-gray-700">
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                </div>

                {/* Dates */}
                <div className="flex gap-6 text-xs text-gray-500">
                  <span>Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(order.updatedAt).toLocaleDateString()}</span>
                </div>

                {/* Status Actions */}
                {NEXT_STATUS[order.status] && (
                      <div className="flex gap-2">
                        <p className="text-xs text-gray-500 self-center">Move to:</p>
                        {NEXT_STATUS[order.status]!.map((next) => (
                          <button
                            key={next}
                            onClick={() => handleStatus(order.id, next)}
                            disabled={busy === order.id}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                              next === 'cancelled' ? 'bg-red-100 text-red-600 hover:bg-red-200' :
                              next === 'delivered' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                              'bg-brand/10 text-brand hover:bg-brand/20'
                            }`}
                          >
                            {busy === order.id ? <Spinner /> : null}
                            {next}
                          </button>
                        ))}
                      </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card py-16 text-center text-gray-400">No orders found</div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
