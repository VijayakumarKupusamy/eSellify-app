import React from 'react';
import { SellerProfile } from '../../../types';

interface SellerOverviewProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    averageRating: number;
    revenueGrowth: number;
  };
  store: SellerProfile;
  onTabChange: (tab: string) => void;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}> = ({ title, value, sub, icon, color, trend }) => (
  <div className="card p-5 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {trend !== undefined && (
        <span className={`text-xs font-medium flex items-center gap-0.5 mt-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d={trend >= 0 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
          </svg>
          {Math.abs(trend)}% vs last month
        </span>
      )}
      {sub && !trend && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SellerOverview: React.FC<SellerOverviewProps> = ({ stats, store, onTabChange }) => {
  const topProduct = null; // placeholder

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Store Banner Card */}
      <div className="card overflow-hidden">
        {store.banner && (
          <div className="h-32 w-full overflow-hidden relative">
            <img src={store.banner} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
        <div className="p-5 flex items-center gap-4">
          <img
            src={store.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.storeName)}&background=6366f1&color=fff&size=80`}
            alt={store.storeName}
            className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow -mt-8 relative ring-2 ring-brand/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{store.storeName}</h2>
              {store.isVerified && (
                <span className="flex items-center gap-1 text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{store.category} · Member since {new Date(store.joinedAt).getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          icon={<svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>}
          color="bg-brand/10"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          sub={`${stats.pendingOrders} pending`}
          icon={<svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          color="bg-emerald-50"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
          trend={stats.revenueGrowth}
          icon={<svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="bg-amber-50"
        />
        <StatCard
          title="Avg. Rating"
          value={stats.averageRating.toFixed(1)}
          sub={`${store.totalSales.toLocaleString()} total sales`}
          icon={<svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
          color="bg-yellow-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', icon: '➕', tab: 'products' },
            { label: 'View Orders', icon: '📦', tab: 'orders' },
            { label: 'Analytics', icon: '📊', tab: 'analytics' },
            { label: 'Settings', icon: '⚙️', tab: 'settings' },
          ].map((a) => (
            <button
              key={a.tab}
              onClick={() => onTabChange(a.tab)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-brand/30 hover:bg-brand/5 transition-all text-sm font-medium text-gray-700"
            >
              <span className="text-2xl">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue mini-chart */}
      {store.salesData && store.salesData.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue This Period</h3>
          <div className="flex items-end gap-2 h-24">
            {store.salesData.map((d, i) => {
              const max = Math.max(...store.salesData.map((x) => x.revenue));
              const pct = max > 0 ? (d.revenue / max) * 100 : 0;
              const isLast = i === store.salesData.length - 1;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative">
                    <div
                      className={`w-full rounded-t transition-all duration-500 ${isLast ? 'bg-brand' : 'bg-brand/30'}`}
                      style={{ height: `${Math.max(pct * 0.9, 4)}px` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {topProduct && null}
    </div>
  );
};

export default SellerOverview;
