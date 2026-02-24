import React, { useState } from 'react';
import { Order, OrderStatus } from '../../../types';

interface SellerOrdersProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<{ success: boolean; error?: string }>;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  processing: { label: 'Processing', color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  shipped:    { label: 'Shipped',    color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  delivered:  { label: 'Delivered',  color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
};

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending:    ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
};

const SellerOrders: React.FC<SellerOrdersProps> = ({ orders, onUpdateStatus }) => {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const handleStatus = async (orderId: string, status: OrderStatus) => {
    setLoadingId(orderId);
    await onUpdateStatus(orderId, status);
    setLoadingId(null);
  };

  const counts: Record<string, number> = { all: orders.length };
  orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === s ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {(counts[s] ?? 0) > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                filter === s ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No orders found</p>
        </div>
      ) : (
        <div className="card overflow-hidden divide-y divide-gray-50">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const nextStatuses = NEXT_STATUSES[order.status] ?? [];
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="p-4">
                <div className="flex items-start gap-3 flex-wrap">
                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{order.id}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' · '}
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-auto">
                    {nextStatuses.length > 0 && (
                      <div className="flex gap-1">
                        {nextStatuses.map((ns) => (
                          <button
                            key={ns}
                            onClick={() => handleStatus(order.id, ns)}
                            disabled={loadingId === order.id}
                            className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            {loadingId === order.id ? '...' : `→ ${STATUS_CONFIG[ns].label}`}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="p-1.5 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                    >
                      <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity} · ${item.product.price.toFixed(2)} each</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <div className="flex text-xs text-gray-400 pt-1 border-t border-gray-50 mt-2">
                      <span>Ship to: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
