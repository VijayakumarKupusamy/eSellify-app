import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import { DASHBOARD_STATS, SALES_DATA, PRODUCTS, MOCK_ORDERS } from '../../data/mockData';

interface StatCardProps {
  title: string;
  value: string;
  growth: number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, growth, icon, color }) => (
  <div className="card p-6">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-xl`}>
        {icon}
      </div>
    </div>
    <div className={`inline-flex items-center gap-1 text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
      {growth >= 0 ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17H5m0 0V9m0 8l8-8 4 4 6-6" /></svg>
      )}
      {Math.abs(growth)}% vs last month
    </div>
  </div>
);

const orderStatusVariant: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  delivered: 'success', shipped: 'info', processing: 'warning', pending: 'default', cancelled: 'danger',
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const maxRevenue = Math.max(...SALES_DATA.map((d) => d.revenue));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
        </div>
        <div className="flex gap-3">
          <Link to="/products" className="btn-secondary text-sm">View Store</Link>
          <button className="btn-primary text-sm">+ Add Product</button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Revenue" value={`$${DASHBOARD_STATS.totalRevenue.toLocaleString()}`} growth={DASHBOARD_STATS.revenueGrowth} icon="💰" color="bg-green-100" />
        <StatCard title="Total Orders" value={DASHBOARD_STATS.totalOrders.toLocaleString()} growth={DASHBOARD_STATS.ordersGrowth} icon="📦" color="bg-blue-100" />
        <StatCard title="Products" value={DASHBOARD_STATS.totalProducts.toString()} growth={5.2} icon="🏷️" color="bg-purple-100" />
        <StatCard title="Customers" value={DASHBOARD_STATS.totalCustomers.toLocaleString()} growth={15.3} icon="👥" color="bg-amber-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Revenue Chart ── */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">Revenue Overview</h2>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand">
              <option>Last 7 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="flex items-end gap-3 h-48">
            {SALES_DATA.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-600">${(d.revenue / 1000).toFixed(1)}k</span>
                <div className="w-full rounded-t-lg bg-brand/20 hover:bg-brand/40 transition-colors relative group cursor-pointer"
                  style={{ height: `${(d.revenue / maxRevenue) * 160}px` }}>
                  <div className="absolute inset-x-0 bottom-0 bg-brand rounded-t-lg" style={{ height: '60%' }} />
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    ${d.revenue.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Top Products ── */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4">Top Products</h2>
          <div className="space-y-3">
            {PRODUCTS.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
                <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.reviewCount} reviews</p>
                </div>
                <span className="text-sm font-bold text-gray-900">${p.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <button className="text-sm text-brand hover:underline font-medium">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                {['Order ID', 'Items', 'Total', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-800">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.items.length} item(s)</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={orderStatusVariant[order.status]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.createdAt}</td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-brand hover:underline font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
