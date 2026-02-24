import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../../types';

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

interface AdminProductsProps {
  products: Product[];
  onUpdate: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ products, onUpdate, onDelete }) => {
  const [search, setSearch]   = useState('');
  const [category, setCat]    = useState('All');
  const [busy, setBusy]       = useState<string | null>(null);
  const [confirmDel, setDel]  = useState<Product | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification({ type, message });
    timerRef.current = setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.seller.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  const toggleFeatured = async (p: Product) => {
    setBusy(p.id);
    const result = await onUpdate(p.id, { featured: !p.featured });
    setBusy(null);
    result.success
      ? notify('success', `${p.name} ${!p.featured ? 'added to' : 'removed from'} featured.`)
      : notify('error', result.error ?? 'Failed to update product.');
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setBusy(confirmDel.id);
    const result = await onDelete(confirmDel.id);
    setBusy(null);
    setDel(null);
    result.success
      ? notify('success', `${confirmDel.name} removed from platform.`)
      : notify('error', result.error ?? 'Failed to delete product.');
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products or sellers…" className="input-field pl-10" />
        </div>
        <select value={category} onChange={(e) => setCat(e.target.value)} className="input-field w-auto">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <span className="self-center text-sm text-gray-500">{filtered.length} products</span>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Seller</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Rating</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Featured</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                    />
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                      <span className="text-xs text-gray-400">{p.category}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{p.seller}</td>
                <td className="px-4 py-3 font-medium text-gray-900 hidden md:table-cell">${p.price}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs font-medium ${p.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                    {p.stock} units
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-amber-500">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-xs text-gray-700">{p.rating}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleFeatured(p)}
                    disabled={busy === p.id}
                    className={`w-10 h-5 rounded-full transition-colors relative inline-flex items-center disabled:opacity-50 ${
                      p.featured ? 'bg-brand' : 'bg-gray-200'
                    }`}
                    title={p.featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    {busy === p.id
                      ? <span className="absolute inset-0 flex items-center justify-center"><Spinner /></span>
                      : <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform absolute ${
                          p.featured ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                    }
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setDel(p)}
                    disabled={busy === p.id}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No products found</div>
        )}
      </div>

      {/* Delete Modal */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 mb-1">Remove Product</h3>
            <p className="text-sm text-gray-500 mb-4">
              Remove <strong>{confirmDel.name}</strong> from the platform? This action is permanent.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDel(null)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={busy === confirmDel.id} className="btn-danger px-4 py-2 text-sm">
                {busy === confirmDel.id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
