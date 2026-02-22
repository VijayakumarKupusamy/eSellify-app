import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { MOCK_ORDERS } from '../../data/mockData';

const orderStatusVariant: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  delivered: 'success', shipped: 'info', processing: 'warning', pending: 'default', cancelled: 'danger',
};

type Tab = 'profile' | 'orders' | 'address';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saved, setSaved] = useState(false);

  if (!isAuthenticated) {
    navigate('/auth/login', { state: { from: '/profile' } });
    return null;
  }

  const handleSave = () => {
    updateProfile({ name: form.name, email: form.email });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'orders', label: 'My Orders' },
    { key: 'address', label: 'Address' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="card p-5 text-center mb-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-brand/20"
            />
            <h2 className="font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <Badge variant="purple" className="mt-2">{user?.role}</Badge>
          </div>

          {/* Tab Nav */}
          <div className="card overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-b last:border-b-0 border-gray-100 ${
                  activeTab === tab.key ? 'bg-brand/5 text-brand border-l-2 border-l-brand' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                {!editing && (
                  <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>

              {saved && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 mb-5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Profile updated successfully!
                </div>
              )}

              {editing ? (
                <div className="space-y-4">
                  <Input label="Full Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                  <Input label="Email Address" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Full Name', value: user?.name },
                    { label: 'Email Address', value: user?.email },
                    { label: 'Role', value: user?.role },
                    { label: 'Member Since', value: user?.joinedAt },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-500 sm:w-36">{label}</span>
                      <span className="text-sm text-gray-900 font-medium">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="card animate-fade-in overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Order History</h2>
              </div>
              {MOCK_ORDERS.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="text-5xl mb-3">📦</div>
                  <p className="text-gray-500">No orders yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {MOCK_ORDERS.map((order) => (
                    <div key={order.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 font-mono text-sm">{order.id}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{order.createdAt}</p>
                        </div>
                        <Badge variant={orderStatusVariant[order.status]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {order.items.map(({ product }) => (
                          <img key={product.id} src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100" />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                        <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>
              {user?.address ? (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.address.street}</p>
                      <p className="text-sm text-gray-600">{user.address.city}, {user.address.state} {user.address.zip}</p>
                      <p className="text-sm text-gray-600">{user.address.country}</p>
                    </div>
                    <Badge variant="success">Default</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3">📍</div>
                  <p className="text-gray-500 mb-4">No address saved yet</p>
                  <Button variant="secondary">Add Address</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
