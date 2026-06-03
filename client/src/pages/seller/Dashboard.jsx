import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSellerDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/orders/mine');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching seller orders:', err);
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerDashboard();
  }, []);

  const formatINR = (n) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(n);
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculations
  const totalOrders = orders.length;
  
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  const totalSpent = orders
    .filter(o => o.status === 'confirmed')
    .reduce((sum, o) => sum + Number(o.total_amount_inr), 0);

  const recentOrders = orders.slice(0, 3);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="bg-emerald-950/40 text-emerald-450 border border-emerald-900/40 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
            Confirmed
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-950/40 text-red-450 border border-red-900/40 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-yellow-950/40 text-yellow-450 border border-yellow-900/40 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user?.name || 'Seller'}</h1>
            <p className="mt-2 text-sm text-slate-400">Order management overview. Track spending, bookings, and draft quotes.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl mb-8 text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-md">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Orders Placed</span>
                <span className="text-3xl font-extrabold">{totalOrders}</span>
              </div>
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-md">
                <span className="text-xs text-slate-405 font-bold uppercase tracking-wider block mb-1">Pending Orders</span>
                <span className="text-3xl font-extrabold text-yellow-550">{pendingOrders}</span>
              </div>
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-md">
                <span className="text-xs text-slate-405 font-bold uppercase tracking-wider block mb-1">Total Spent</span>
                <span className="text-2xl font-extrabold text-emerald-400">{formatINR(totalSpent)}</span>
              </div>
            </div>

            {/* Quick Action link */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-slate-350">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4">
                <Link
                  to="/seller/browse"
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl p-5 flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">Browse Catalog & Place Order</h3>
                    <p className="text-xs text-slate-405 mt-1">Search chemical compounds, configure weights or volumes, preview costs, and submit order.</p>
                  </div>
                  <span className="text-indigo-400 group-hover:translate-x-1.5 transition-transform font-bold text-lg">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Recent Orders table */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-slate-350">My Recent Orders</h2>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-850 border-b border-slate-700">
                        <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                        <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                        <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                            You have not placed any orders yet.
                          </td>
                        </tr>
                      ) : (
                        recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-750/30 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-200">#{order.id}</td>
                            <td className="px-6 py-4 text-slate-400">{formatDate(order.created_at)}</td>
                            <td className="px-6 py-4 text-right font-semibold text-emerald-400 font-mono">
                              {formatINR(Number(order.total_amount_inr))}
                            </td>
                            <td className="px-6 py-4 text-center">{getStatusBadge(order.status)}</td>
                            <td className="px-6 py-4 text-center">
                              <Link
                                to="/seller/orders"
                                className="text-indigo-400 hover:text-indigo-350 font-bold"
                              >
                                View details
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
