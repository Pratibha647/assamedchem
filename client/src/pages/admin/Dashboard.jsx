import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders/all')
      ]);
      setProducts(prodRes.data);
      setOrders(orderRes.data);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
  const totalProducts = products.length;
  
  const totalStockValue = products.reduce((sum, p) => {
    return sum + (Number(p.base_price_per_unit) * Number(p.stock_quantity));
  }, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const totalRevenue = orders
    .filter(o => o.status === 'confirmed')
    .reduce((sum, o) => sum + Number(o.total_amount_inr), 0);

  const recentOrders = orders.slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
            Confirmed
          </span>
        );
      case 'rejected':
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fce4ec', color: '#c62828' }}>
            Rejected
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fdf0f0', color: '#2d5a9e', border: '1px solid #2d5a9e' }}>
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: '#d4d8e0', color: '#1a2744' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#1a2744' }}>Welcome, {user?.name || 'Admin'}</h1>
            <p className="mt-2 text-sm" style={{ color: '#2d5a9e' }}>System overview dashboard. Monitor stock, revenue, and pending orders.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8 text-sm">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="shadow-md" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', borderTop: '4px solid #1a2744', boxShadow: '0 2px 12px rgba(26,39,68,0.10)' }}>
                <span className="block mb-1" style={{ color: '#2d5a9e', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Total Products</span>
                <span style={{ color: '#1a2744', fontSize: '2rem', fontWeight: '800' }}>{totalProducts}</span>
              </div>
              <div className="shadow-md" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', borderTop: '4px solid #1a2744', boxShadow: '0 2px 12px rgba(26,39,68,0.10)' }}>
                <span className="block mb-1" style={{ color: '#2d5a9e', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Total Stock Value</span>
                <span style={{ color: '#1a2744', fontSize: '2rem', fontWeight: '800' }}>{formatINR(totalStockValue)}</span>
              </div>
              <div className="shadow-md" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', borderTop: '4px solid #1a2744', boxShadow: '0 2px 12px rgba(26,39,68,0.10)' }}>
                <span className="block mb-1" style={{ color: '#2d5a9e', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Pending Orders</span>
                <span style={{ color: '#1a2744', fontSize: '2rem', fontWeight: '800' }}>{pendingOrdersCount}</span>
              </div>
              <div className="shadow-md" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', borderTop: '4px solid #1a2744', boxShadow: '0 2px 12px rgba(26,39,68,0.10)' }}>
                <span className="block mb-1" style={{ color: '#2d5a9e', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Total Revenue</span>
                <span style={{ color: '#1a2744', fontSize: '2rem', fontWeight: '800' }}>{formatINR(totalRevenue)}</span>
              </div>
            </div>

            {/* Quick Links section */}
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1a2744' }}>Quick Links</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/admin/products"
                  className="flex items-center justify-between transition-all cursor-pointer group border border-transparent hover:border-[#e8a0b0] p-5 shadow-sm"
                  style={{ backgroundColor: '#fff', borderRadius: '16px' }}
                >
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: '#1a2744' }}>Manage Catalog</h3>
                    <p className="text-xs mt-1" style={{ color: '#2d5a9e' }}>Add, modify pricing, units, or stock quantities of products.</p>
                  </div>
                  <span className="group-hover:translate-x-1.5 transition-transform font-bold text-lg" style={{ color: '#2d5a9e' }}>&rarr;</span>
                </Link>
                
                <Link
                  to="/admin/orders"
                  className="flex items-center justify-between transition-all cursor-pointer group border border-transparent hover:border-[#e8a0b0] p-5 shadow-sm"
                  style={{ backgroundColor: '#fff', borderRadius: '16px' }}
                >
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: '#1a2744' }}>Review Quotations</h3>
                    <p className="text-xs mt-1" style={{ color: '#2d5a9e' }}>Review pending orders, inspect item details, and confirm bookings.</p>
                  </div>
                  <span className="group-hover:translate-x-1.5 transition-transform font-bold text-lg" style={{ color: '#2d5a9e' }}>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Recent Orders table */}
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1a2744' }}>Recent Orders</h2>
              <div className="rounded-2xl overflow-hidden shadow-md border border-slate-300/60" style={{ backgroundColor: '#fff' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr style={{ backgroundColor: '#1a2744', color: '#fff' }}>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Seller</th>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-right">Amount</th>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                            No orders placed yet.
                          </td>
                        </tr>
                      ) : (
                        recentOrders.map((order, idx) => (
                          <tr key={order.id} className="transition-colors" style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fdf0f0', color: '#1a2744' }}>
                            <td className="px-6 py-4 font-mono font-bold">#{order.id}</td>
                            <td className="px-6 py-4">
                              <span className="font-semibold">{order.seller_name}</span>
                            </td>
                            <td className="px-6 py-4">{formatDate(order.created_at)}</td>
                            <td className="px-6 py-4 text-right font-semibold font-mono">
                              {formatINR(Number(order.total_amount_inr))}
                            </td>
                            <td className="px-6 py-4 text-center">{getStatusBadge(order.status)}</td>
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
