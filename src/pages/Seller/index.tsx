import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSeller } from '../../hooks/useSeller';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import SellerOverview from './components/SellerOverview';
import SellerProducts from './components/SellerProducts';
import SellerOrders from './components/SellerOrders';
import SellerAnalytics from './components/SellerAnalytics';
import SellerSettings from './components/SellerSettings';

type Tab = 'overview' | 'products' | 'orders' | 'analytics' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'products',
    label: 'Products',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    ),
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

/* ── Onboarding: create store ─────────────────────────────── */
const CATEGORIES = ['Electronics', 'Accessories', 'Furniture', 'Kitchen', 'Fashion', 'Books', 'Other'];

interface CreateStoreFormProps {
  onSubmit: (data: { storeName: string; storeDescription: string; category: string }) => Promise<{ success: boolean; error?: string }>;
}

const CreateStoreForm: React.FC<CreateStoreFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat]   = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Store name is required.'); return; }
    setLoading(true);
    setError('');
    const res = await onSubmit({ storeName: name.trim(), storeDescription: desc.trim(), category: cat });
    setLoading(false);
    if (!res.success) setError(res.error ?? 'Failed to create store.');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="card p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Open Your Store</h2>
        <p className="text-gray-500 text-sm mb-6">Set up your seller profile to start listing products and making sales.</p>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <Input
            label="Store Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. TechGadgets Pro"
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Tell customers about your store..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Launch My Store
          </Button>
        </form>
      </div>
    </div>
  );
};

/* ── Main Seller Page ─────────────────────────────────────── */
const SellerPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const {
    store, products, orders, stats, isLoading, error,
    addProduct, updateProduct, deleteProduct, updateStore, createStore, updateOrderStatus,
  } = useSeller();

  /* Access control */
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== 'seller' && user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="card p-8 max-w-sm text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-500 text-sm">The Seller Portal is only available for seller and admin accounts.</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loading size="lg" text="Loading your store…" /></div>;

  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="card p-8 max-w-sm text-center">
        <p className="text-red-500 font-medium mb-2">Failed to load store</p>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  );

  /* No store yet → onboarding */
  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreateStoreForm onSubmit={({ storeName, storeDescription, category }) => createStore(storeName, storeDescription, category)} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Portal</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage <span className="font-medium text-gray-700">{store.storeName}</span>
            {store.isVerified && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Verified
              </span>
            )}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Joined {new Date(store.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <SellerOverview store={store} stats={stats!} onTabChange={(tab) => setActiveTab(tab as Tab)} />
      )}
      {activeTab === 'products' && (
        <SellerProducts
          products={products}
          onAdd={addProduct}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
        />
      )}
      {activeTab === 'orders' && (
        <SellerOrders orders={orders} onUpdateStatus={updateOrderStatus} />
      )}
      {activeTab === 'analytics' && (
        <SellerAnalytics salesData={store.salesData ?? []} products={products} totalRevenue={stats!.totalRevenue} />
      )}
      {activeTab === 'settings' && (
        <SellerSettings store={store} onUpdate={updateStore} />
      )}
    </div>
  );
};

export default SellerPage;
