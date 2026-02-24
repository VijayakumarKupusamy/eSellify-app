import React, { useState, useEffect } from 'react';
import { SellerProfile } from '../../../types';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

interface SellerSettingsProps {
  store: SellerProfile;
  onUpdate: (updates: Partial<SellerProfile>) => Promise<{ success: boolean; error?: string }>;
}

const CATEGORIES = ['Electronics', 'Accessories', 'Furniture', 'Kitchen', 'Fashion', 'Books', 'Other'];

const SellerSettings: React.FC<SellerSettingsProps> = ({ store, onUpdate }) => {
  const [form, setForm] = useState({
    storeName: store.storeName,
    storeDescription: store.storeDescription,
    category: store.category,
    logo: store.logo ?? '',
    banner: store.banner ?? '',
    website: store.socialLinks?.website ?? '',
    instagram: store.socialLinks?.instagram ?? '',
    twitter: store.socialLinks?.twitter ?? '',
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    setForm({
      storeName: store.storeName,
      storeDescription: store.storeDescription,
      category: store.category,
      logo: store.logo ?? '',
      banner: store.banner ?? '',
      website: store.socialLinks?.website ?? '',
      instagram: store.socialLinks?.instagram ?? '',
      twitter: store.socialLinks?.twitter ?? '',
    });
  }, [store.id]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeName.trim()) { setError('Store name is required.'); return; }
    setLoading(true);
    setError('');
    setSuccess(false);
    const res = await onUpdate({
      storeName: form.storeName.trim(),
      storeDescription: form.storeDescription.trim(),
      category: form.category,
      logo: form.logo.trim() || store.logo,
      banner: form.banner.trim() || store.banner,
      socialLinks: {
        website: form.website.trim() || undefined,
        instagram: form.instagram.trim() || undefined,
        twitter: form.twitter.trim() || undefined,
      },
    });
    setLoading(false);
    if (res.success) setSuccess(true);
    else setError(res.error ?? 'Failed to update store.');
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Identity */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 text-base">Store Identity</h3>
          <div className="flex items-center gap-4">
            <img
              src={form.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.storeName)}&background=6366f1&color=fff&size=80`}
              alt="Store Logo"
              className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm flex-shrink-0"
            />
            <Input
              label="Logo URL"
              value={form.logo}
              onChange={(e) => set('logo', e.target.value)}
              placeholder="https://..."
              className="flex-1"
            />
          </div>
          <Input
            label="Store Name *"
            value={form.storeName}
            onChange={(e) => set('storeName', e.target.value)}
            placeholder="Your store name"
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Store Description</label>
            <textarea
              rows={3}
              value={form.storeDescription}
              onChange={(e) => set('storeDescription', e.target.value)}
              placeholder="Tell customers about your store..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Primary Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Input
            label="Banner Image URL"
            value={form.banner}
            onChange={(e) => set('banner', e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        {/* Social Links */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 text-base">Links & Social</h3>
          <Input
            label="Website"
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="https://yourstore.com"
            leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>}
          />
          <Input
            label="Instagram"
            value={form.instagram}
            onChange={(e) => set('instagram', e.target.value)}
            placeholder="@yourstore"
            leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" /></svg>}
          />
          <Input
            label="Twitter / X"
            value={form.twitter}
            onChange={(e) => set('twitter', e.target.value)}
            placeholder="@yourstore"
            leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>}
          />
        </div>

        {/* Feedback */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Store settings saved successfully!
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" loading={loading}>
          Save Changes
        </Button>
      </form>

      {/* Verification Status */}
      <div className={`card p-5 flex items-start gap-4 ${store.isVerified ? 'border-emerald-200' : 'border-amber-200'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${store.isVerified ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          <svg className={`w-5 h-5 ${store.isVerified ? 'text-emerald-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {store.isVerified
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            }
          </svg>
        </div>
        <div>
          <p className={`font-semibold text-sm ${store.isVerified ? 'text-emerald-900' : 'text-amber-900'}`}>
            {store.isVerified ? 'Verified Seller' : 'Verification Pending'}
          </p>
          <p className="text-xs mt-0.5 text-gray-500">
            {store.isVerified
              ? 'Your store is verified. Customers see a verified badge on your products.'
              : 'Complete your store profile and submit for verification to gain buyer trust.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerSettings;
