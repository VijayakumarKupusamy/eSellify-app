import React, { useState, useEffect, useRef } from 'react';
import { SellerProfile, User } from '../../../types';

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

interface AdminSellersProps {
  sellers: SellerProfile[];
  users: User[];
  onVerify: (id: string) => Promise<{ success: boolean; error?: string }>;
  onSuspend: (sellerId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
}

const AdminSellers: React.FC<AdminSellersProps> = ({ sellers, users, onVerify, onSuspend }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [busy, setBusy]     = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification({ type, message });
    timerRef.current = setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const filtered = sellers.filter((s) => {
    const matchSearch = s.storeName.toLowerCase().includes(search.toLowerCase()) ||
                        s.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true :
                        filter === 'verified' ? s.isVerified : !s.isVerified;
    return matchSearch && matchFilter;
  });

  const getUser = (userId: string) => users.find((u) => u.id === userId);

  const handleVerify = async (s: SellerProfile) => {
    setBusy(s.id);
    const result = await onVerify(s.id);
    setBusy(null);
    result.success
      ? notify('success', `${s.storeName} has been verified.`)
      : notify('error', result.error ?? 'Failed to verify seller.');
  };

  const handleSuspend = async (s: SellerProfile) => {
    const owner = getUser(s.userId);
    const isSuspended = owner?.status === 'suspended';
    setBusy(s.id);
    const result = await onSuspend(s.id, s.userId);
    setBusy(null);
    result.success
      ? notify('success', `${s.storeName} has been ${isSuspended ? 'restored' : 'suspended'}.`)
      : notify('error', result.error ?? 'Failed to update seller.');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {notification && <ActionBanner type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stores…" className="input-field pl-10" />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden self-start">
          {(['all', 'verified', 'unverified'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="self-center text-sm text-gray-500">{filtered.length} sellers</span>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((seller) => {
          const owner = getUser(seller.userId);
          const isSuspended = owner?.status === 'suspended';
          return (
            <div key={seller.id} className="card p-5 flex flex-col gap-3">
              {/* Banner + Logo */}
              <div className="relative h-20 rounded-lg overflow-hidden bg-gray-100">
                {seller.banner && (
                  <img src={seller.banner} alt="banner" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <img
                  src={seller.logo ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.storeName)}&background=6366f1&color=fff&size=56`}
                  alt={seller.storeName}
                  className="absolute bottom-2 left-3 w-10 h-10 rounded-lg border-2 border-white object-cover"
                />
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{seller.storeName}</h3>
                  {seller.isVerified && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">Verified</span>
                  )}
                  {isSuspended && (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">Suspended</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{seller.category} · {seller.totalProducts} products</p>
                {owner && (
                  <p className="text-xs text-gray-400 mt-0.5">Owner: {owner.name} ({owner.email})</p>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="text-sm font-bold text-gray-900">${seller.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Sales</p>
                  <p className="text-sm font-bold text-gray-900">{seller.totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="text-sm font-bold text-gray-900">★ {seller.averageRating}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {!seller.isVerified && (
                  <button
                    onClick={() => handleVerify(seller)}
                    disabled={busy === seller.id}
                    className="flex items-center justify-center gap-1.5 flex-1 text-xs font-medium py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                  >
                    {busy === seller.id ? <Spinner /> : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                    Verify
                  </button>
                )}
                <button
                  onClick={() => handleSuspend(seller)}
                  disabled={busy === seller.id}
                  className={`flex items-center justify-center gap-1.5 flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                    isSuspended
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  {busy === seller.id ? <Spinner /> : null}
                  {isSuspended ? 'Restore' : 'Suspend'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card py-16 text-center">
          <p className="text-gray-400">No sellers found</p>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;
