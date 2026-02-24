import React from 'react';
import { SalesData, Product } from '../../../types';

interface SellerAnalyticsProps {
  salesData: SalesData[];
  products: Product[];
  totalRevenue: number;
}

const SellerAnalytics: React.FC<SellerAnalyticsProps> = ({ salesData, products, totalRevenue }) => {
  const maxRevenue = Math.max(...salesData.map((d) => d.revenue), 1);
  const maxOrders  = Math.max(...salesData.map((d) => d.orders), 1);
  const totalOrders = salesData.reduce((s, d) => s + d.orders, 0);

  // Category breakdown
  const catMap: Record<string, number> = {};
  products.forEach((p) => { catMap[p.category] = (catMap[p.category] ?? 0) + 1; });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const catColors = ['bg-brand', 'bg-emerald-500', 'bg-amber-400', 'bg-sky-500', 'bg-purple-500', 'bg-rose-400'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Period Revenue', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}` },
          { label: 'Total Orders', value: totalOrders.toLocaleString() },
          { label: 'Avg Order', value: totalOrders > 0 ? `$${(totalRevenue / totalOrders).toFixed(2)}` : '—' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Bar Chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Monthly Revenue</h3>
        <p className="text-xs text-gray-400 mb-5">Last {salesData.length} months</p>
        <div className="space-y-2">
          {salesData.map((d) => {
            const pct = (d.revenue / maxRevenue) * 100;
            return (
              <div key={d.month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-7 flex-shrink-0">{d.month}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand to-brand-light rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  >
                    {pct > 20 && <span className="text-[10px] text-white font-medium">${d.revenue.toLocaleString()}</span>}
                  </div>
                </div>
                {pct <= 20 && <span className="text-xs text-gray-500 w-14 text-right">${d.revenue.toLocaleString()}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders Bar Chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Orders per Month</h3>
        <div className="flex items-end gap-2 h-28 mt-4">
          {salesData.map((d, i) => {
            const pct = (d.orders / maxOrders) * 100;
            const isLast = i === salesData.length - 1;
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full" title={`${d.orders} orders`}>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${isLast ? 'bg-emerald-500' : 'bg-emerald-200 group-hover:bg-emerald-400'}`}
                    style={{ height: `${Math.max(pct * 0.9, 3)}px` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Category Breakdown */}
      {catEntries.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Products by Category</h3>
          <div className="space-y-3">
            {catEntries.map(([cat, count], i) => {
              const pct = (count / products.length) * 100;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-28 flex-shrink-0 truncate">{cat}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${catColors[i % catColors.length]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 w-16 text-right flex-shrink-0">
                    {count} ({pct.toFixed(0)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top products by rating */}
      {products.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Rated Products</h3>
          <div className="space-y-3">
            {[...products].sort((a, b) => b.rating - a.rating).slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <svg key={s} className={`w-3 h-3 ${s <= Math.round(p.rating) ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{p.rating > 0 ? p.rating.toFixed(1) : 'No reviews'}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">${p.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{p.reviewCount} reviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerAnalytics;
