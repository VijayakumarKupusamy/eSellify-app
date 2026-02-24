import React from 'react';
import { AdminStats, ActivityLog, Report, User, Product, Order, SellerProfile } from '../../../types';

interface AdminOverviewProps {
  stats: AdminStats;
  users: User[];
  products: Product[];
  orders: Order[];
  sellers: SellerProfile[];
  activityLogs: ActivityLog[];
  reports: Report[];
  onTabChange: (tab: string) => void;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  sub?: string;
  trend?: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}> = ({ title, value, sub, trend, icon, color, onClick }) => (
  <div
    className={`card p-5 flex items-start gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    onClick={onClick}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {trend !== undefined && (
        <span className={`text-xs font-medium flex items-center gap-0.5 mt-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={trend >= 0 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
          </svg>
          {Math.abs(trend)}% this month
        </span>
      )}
      {sub && trend === undefined && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const LOG_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  user_registered:   { color: 'bg-blue-100 text-blue-600',    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  seller_verified:   { color: 'bg-emerald-100 text-emerald-600', icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> },
  product_flagged:   { color: 'bg-amber-100 text-amber-600',   icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H21l-3 6 3 6H11l-1-2H5a2 2 0 00-2 2zm6-12h.01" /></svg> },
  order_placed:      { color: 'bg-purple-100 text-purple-600', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  report_resolved:   { color: 'bg-teal-100 text-teal-600',     icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> },
  seller_suspended:  { color: 'bg-red-100 text-red-600',       icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg> },
  admin_action:      { color: 'bg-gray-100 text-gray-600',     icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg> },
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats, users, products, orders, sellers, activityLogs, reports, onTabChange,
}) => {
  const maxRev = Math.max(...stats.monthlyRevenue.map((d) => d.revenue), 1);
  const pendingReports = reports.filter((r) => r.status === 'pending');

  // ── Derived breakdowns ────────────────────────────────────────────────────
  const orderStatusCounts: Record<string, number> = {};
  orders.forEach((o) => { orderStatusCounts[o.status] = (orderStatusCounts[o.status] ?? 0) + 1; });

  const roleCounts: Record<string, number> = {};
  users.forEach((u) => { roleCounts[u.role] = (roleCounts[u.role] ?? 0) + 1; });

  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    const cat = p.category ?? 'Other';
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const recentUsers = [...users].sort(
    (a, b) => new Date(b.joinedAt ?? 0).getTime() - new Date(a.joinedAt ?? 0).getTime(),
  ).slice(0, 5);

  const verifiedSellers = sellers.filter((s) => s.isVerified).length;
  const unverifiedSellers = sellers.filter((s) => !s.isVerified).length;

  const ORDER_STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-400',
    processing: 'bg-blue-400',
    shipped: 'bg-purple-400',
    delivered: 'bg-emerald-400',
    cancelled: 'bg-red-400',
  };

  const QUICK_ACTIONS = [
    { label: 'Manage Users', tab: 'users', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, count: users.length },
    { label: 'Verify Sellers', tab: 'sellers', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>, count: unverifiedSellers, badge: unverifiedSellers > 0 },
    { label: 'Review Products', tab: 'products', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>, count: products.length },
    { label: 'Track Orders', tab: 'orders', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, count: orders.length },
    { label: 'Resolve Reports', tab: 'reports', color: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>, count: pendingReports.length, badge: pendingReports.length > 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Quick Actions ── */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <button key={a.tab} onClick={() => onTabChange(a.tab)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center ${a.color}`}>
              {a.badge && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {a.count}
                </span>
              )}
              {a.icon}
              <span className="text-xs font-semibold leading-tight">{a.label}</span>
              <span className="text-lg font-bold leading-none">{a.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} sub={`+${stats.newUsersThisMonth} this month`}
          icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          color="bg-blue-100" onClick={() => onTabChange('users')} />
        <StatCard title="Active Sellers" value={stats.totalSellers.toString()}
          icon={<svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          color="bg-emerald-100" onClick={() => onTabChange('sellers')} />
        <StatCard title="Platform Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} trend={stats.revenueGrowth}
          icon={<svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="bg-brand/10" />
        <StatCard title="Pending Reports" value={stats.pendingReports.toString()} sub="Needs attention"
          icon={<svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          color="bg-red-100" onClick={() => onTabChange('reports')} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={stats.totalOrders.toLocaleString()}
          icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          color="bg-purple-100" onClick={() => onTabChange('orders')} />
        <StatCard title="Total Products" value={stats.totalProducts.toString()}
          icon={<svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>}
          color="bg-amber-100" onClick={() => onTabChange('products')} />
        <StatCard title="Platform Fees" value={`$${stats.platformFee.toLocaleString()}`} sub="5% commission"
          icon={<svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
          color="bg-teal-100" />
        <StatCard title="New Users" value={stats.newUsersThisMonth.toString()} sub="This month"
          icon={<svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
          color="bg-pink-100" />
      </div>

      {/* ── Revenue Chart + Pending Reports ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Platform Revenue</h3>
          <div className="flex items-end gap-2 h-36">
            {stats.monthlyRevenue.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-brand rounded-t-sm min-h-[4px] transition-all"
                  style={{ height: `${(d.revenue / maxRev) * 128}px` }} />
                <span className="text-[10px] text-gray-400">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Total: ${stats.totalRevenue.toLocaleString()}</span>
            <span className="text-emerald-600 font-medium">+{stats.revenueGrowth}% growth</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pending Reports</h3>
            {pendingReports.length > 0 && (
              <span className="text-xs font-medium text-white bg-red-500 rounded-full px-2 py-0.5">{pendingReports.length}</span>
            )}
          </div>
          {pendingReports.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No pending reports</p>
          ) : (
            <div className="space-y-3">
              {pendingReports.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase ${
                    r.type === 'product' ? 'bg-amber-100 text-amber-700' :
                    r.type === 'seller'  ? 'bg-red-100 text-red-700' :
                    r.type === 'user'    ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>{r.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.targetName}</p>
                    <p className="text-xs text-gray-500 truncate">{r.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => onTabChange('reports')}
            className="mt-4 text-xs text-brand font-medium hover:underline">View all reports →</button>
        </div>
      </div>

      {/* ── Platform Snapshot ── */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Order status breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
            Order Status
            <button onClick={() => onTabChange('orders')} className="text-xs text-brand hover:underline">View all</button>
          </h3>
          <div className="space-y-2.5">
            {Object.entries(orderStatusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ORDER_STATUS_COLORS[status] ?? 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600 flex-1 capitalize">{status}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${ORDER_STATUS_COLORS[status] ?? 'bg-gray-300'}`}
                    style={{ width: `${(count / orders.length) * 100}%` }} />
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-sm text-gray-400 text-center py-3">No orders yet</p>}
          </div>
        </div>

        {/* User role breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
            User Roles
            <button onClick={() => onTabChange('users')} className="text-xs text-brand hover:underline">View all</button>
          </h3>
          <div className="space-y-2.5">
            {Object.entries(roleCounts).map(([role, count]) => {
              const pct = Math.round((count / users.length) * 100);
              const color = role === 'admin' ? 'bg-red-400' : role === 'seller' ? 'bg-emerald-400' : 'bg-blue-400';
              return (
                <div key={role} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
                  <span className="text-sm text-gray-600 flex-1 capitalize">{role}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {/* Seller verification status */}
            <div className="pt-2 border-t border-gray-100 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-gray-500 flex-1">Verified sellers</span>
                <span className="text-xs font-semibold text-gray-700">{verifiedSellers}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="text-xs text-gray-500 flex-1">Pending verification</span>
                <span className="text-xs font-semibold text-gray-700">{unverifiedSellers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top product categories */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
            Top Categories
            <button onClick={() => onTabChange('products')} className="text-xs text-brand hover:underline">View all</button>
          </h3>
          <div className="space-y-2.5">
            {topCategories.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 flex-1 capitalize truncate">{cat}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(count / products.length) * 100}%` }} />
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-sm text-gray-400 text-center py-3">No products yet</p>}
          </div>
        </div>
      </div>

      {/* ── Recent Users + Activity Feed ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Users</h3>
            <button onClick={() => onTabChange('users')} className="text-xs text-brand font-medium hover:underline">Manage all</button>
          </div>
          <div className="space-y-3">
            {recentUsers.length === 0 && <p className="text-sm text-gray-400 text-center py-3">No users yet</p>}
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <img
                  src={u.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff&size=32`}
                  alt={u.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  u.role === 'admin' ? 'bg-red-100 text-red-700' :
                  u.role === 'seller' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{u.role}</span>
                {u.status === 'suspended' && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">suspended</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activityLogs.slice(0, 6).map((log) => {
              const cfg = LOG_ICONS[log.type] ?? LOG_ICONS.admin_action;
              return (
                <div key={log.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}>{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{log.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(log.timestamp)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
