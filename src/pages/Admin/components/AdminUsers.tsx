import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../../types';

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

interface AdminUsersProps {
  users: User[];
  onUpdate: (id: string, updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const ROLE_COLORS: Record<string, string> = {
  admin:    'bg-red-100 text-red-700',
  seller:   'bg-brand/10 text-brand',
  customer: 'bg-gray-100 text-gray-600',
};

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700',
  suspended: 'bg-amber-100 text-amber-700',
  banned:    'bg-red-100 text-red-700',
};

const AdminUsers: React.FC<AdminUsersProps> = ({ users, onUpdate, onDelete }) => {
  const [search, setSearch]   = useState('');
  const [roleFilter, setRole] = useState('All');
  const [busy, setBusy]       = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [notification, setNotification]   = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification({ type, message });
    timerRef.current = setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleRoleChange = async (user: User, role: User['role']) => {
    setBusy(user.id);
    const result = await onUpdate(user.id, { role });
    setBusy(null);
    result.success
      ? notify('success', `${user.name}'s role changed to ${role}.`)
      : notify('error', result.error ?? 'Failed to update role.');
  };

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    setBusy(user.id);
    const result = await onUpdate(user.id, { status: newStatus });
    setBusy(null);
    result.success
      ? notify('success', `${user.name} has been ${newStatus === 'suspended' ? 'suspended' : 'restored'}.`)
      : notify('error', result.error ?? 'Failed to update status.');
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusy(confirmDelete.id);
    const result = await onDelete(confirmDelete.id);
    setBusy(null);
    setConfirmDelete(null);
    result.success
      ? notify('success', `User deleted successfully.`)
      : notify('error', result.error ?? 'Failed to delete user.');
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
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="input-field pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRole(e.target.value)}
          className="input-field w-auto"
        >
          <option>All</option>
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
        <span className="self-center text-sm text-gray-500">{filtered.length} users</span>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Joined</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=40`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    disabled={busy === user.id}
                    onChange={(e) => handleRoleChange(user, e.target.value as User['role'])}
                    className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand ${ROLE_COLORS[user.role] ?? 'bg-gray-100'}`}
                  >
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[user.status ?? 'active']}`}>
                    {user.status ?? 'active'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                  {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleStatusToggle(user)}
                      disabled={busy === user.id || user.role === 'admin'}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-40 ${
                        user.status === 'suspended'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      {busy === user.id ? <Spinner /> : null}
                      {user.status === 'suspended' ? 'Restore' : 'Suspend'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(user)}
                      disabled={busy === user.id || user.role === 'admin'}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No users found</div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 mb-1">Delete User</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to permanently delete <strong>{confirmDelete.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={busy === confirmDelete.id} className="btn-danger px-4 py-2 text-sm">
                {busy === confirmDelete.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
