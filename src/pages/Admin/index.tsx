import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../hooks/useAdmin';
import AdminOverview from './components/AdminOverview';
import AdminUsers from './components/AdminUsers';
import AdminSellers from './components/AdminSellers';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import AdminReports from './components/AdminReports';

/* ── Skeleton placeholder ─────────────────────────────────────────────── */
const Sk: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);
const SkeletonOverview: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card p-5 flex items-start gap-4">
          <Sk className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1"><Sk className="h-3 w-20" /><Sk className="h-6 w-16" /><Sk className="h-2.5 w-24" /></div>
        </div>
      ))}
    </div>
    <div className="grid lg:grid-cols-3 gap-6">
      <Sk className="h-56 rounded-2xl lg:col-span-2" />
      <Sk className="h-56 rounded-2xl" />
    </div>
    <Sk className="h-64 rounded-2xl" />
  </div>
);
const SkeletonTable: React.FC = () => (
  <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Sk key={i} className="h-14 w-full" />)}</div>
);

/* ── Inline error banner ──────────────────────────────────────────────── */
const ErrorBanner: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
    <svg className="w-5 h-5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <p className="flex-1 text-sm font-medium">{message}</p>
    <button onClick={onRetry}
      className="text-sm font-semibold text-red-600 hover:text-red-800 border border-red-300 rounded-lg px-3 py-1 hover:bg-red-100 transition-colors">
      Retry
    </button>
  </div>
);


type Tab = 'overview' | 'users' | 'sellers' | 'products' | 'orders' | 'reports';

interface TabCounts { users: number; unverifiedSellers: number; pendingReports: number; }

const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: (c: TabCounts) => number }[] = [
  {
    id: 'overview', label: 'Overview',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  },
  {
    id: 'users', label: 'Users',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    badge: (c) => c.users,
  },
  {
    id: 'sellers', label: 'Sellers',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    badge: (c) => c.unverifiedSellers,
  },
  {
    id: 'products', label: 'Products',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>,
  },
  {
    id: 'orders', label: 'Orders',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  {
    id: 'reports', label: 'Reports',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    badge: (c) => c.pendingReports,
  },
];

/* ── Main Page ────────────────────────────────────────────────────────── */
const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const {
    stats, users, products, orders, sellers,
    activityLogs, reports, isLoading, error, refetch,
    updateUser, deleteUser, updateProduct, deleteProduct,
    verifySeller, suspendSeller, updateOrderStatus, resolveReport,
  } = useAdmin();

  /* ── Access guards (these can still block before the scaffold) ── */
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="card p-8 max-w-sm text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Only</h2>
          <p className="text-gray-500 text-sm">You need admin privileges to access this area.</p>
        </div>
      </div>
    );
  }

  const tabCounts: TabCounts = {
    users: users.length,
    unverifiedSellers: sellers.filter((s) => !s.isVerified).length,
    pendingReports: reports.filter((r) => r.status === 'pending').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
            <p className="text-sm text-gray-500">Platform management &amp; oversight</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live count pills — visible once data loads */}
          {!isLoading && !error && (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <button onClick={() => setActiveTab('users')} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors">{users.length} users</button>
              <button onClick={() => setActiveTab('sellers')} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium hover:bg-emerald-100 transition-colors">{sellers.length} sellers</button>
              <button onClick={() => setActiveTab('products')} className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium hover:bg-amber-100 transition-colors">{products.length} products</button>
              {tabCounts.pendingReports > 0 && (
                <button onClick={() => setActiveTab('reports')} className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors">{tabCounts.pendingReports} pending reports</button>
              )}
            </div>
          )}
          {isLoading && <span className="text-xs text-gray-400 animate-pulse">Loading platform data…</span>}

          {/* Admin identity */}
          <div className="flex items-center gap-2 text-sm border-l border-gray-200 pl-3">
            <img
              src={user.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ef4444&color=fff`}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden sm:block">
              <p className="font-medium text-gray-900 leading-none">{user.name}</p>
              <span className="text-xs text-red-600 font-semibold">Super Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Inline error (non-blocking) ── */}
      {error && <ErrorBanner message={`Failed to load admin data: ${error}`} onRetry={refetch} />}

      {/* ── Tab Nav (always visible) ── */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const count = tab.badge?.(tabCounts) ?? 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
                {count > 0 && (
                  <span className="ml-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Content: show skeleton while loading, real data after ── */}
      {isLoading && activeTab === 'overview' && <SkeletonOverview />}
      {isLoading && activeTab !== 'overview' && <SkeletonTable />}

      {!isLoading && activeTab === 'overview' && stats && (
        <AdminOverview
          stats={stats}
          users={users}
          products={products}
          orders={orders}
          sellers={sellers}
          activityLogs={activityLogs}
          reports={reports}
          onTabChange={(tab) => setActiveTab(tab as Tab)}
        />
      )}
      {!isLoading && activeTab === 'users' && (
        <AdminUsers users={users} onUpdate={updateUser} onDelete={deleteUser} />
      )}
      {!isLoading && activeTab === 'sellers' && (
        <AdminSellers sellers={sellers} users={users} onVerify={verifySeller} onSuspend={suspendSeller} />
      )}
      {!isLoading && activeTab === 'products' && (
        <AdminProducts products={products} onUpdate={updateProduct} onDelete={deleteProduct} />
      )}
      {!isLoading && activeTab === 'orders' && (
        <AdminOrders orders={orders} onUpdateStatus={updateOrderStatus} />
      )}
      {!isLoading && activeTab === 'reports' && (
        <AdminReports reports={reports} onResolve={resolveReport} />
      )}
    </div>
  );
};

export default AdminPage;

