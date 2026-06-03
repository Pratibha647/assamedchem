import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const fetchAllOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/orders/all');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setError('');
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchAllOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || 'Failed to update order status');
      setUpdatingId(null);
    }
  };

  const formatINR = (n) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(n);
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Summarize stats for top cards
  const stats = orders.reduce(
    (acc, order) => {
      acc.total += 1;
      if (order.status === 'pending') acc.pending += 1;
      else if (order.status === 'confirmed') acc.confirmed += 1;
      else if (order.status === 'rejected') acc.rejected += 1;
      return acc;
    },
    { total: 0, pending: 0, confirmed: 0, rejected: 0 }
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
            Confirmed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor: '#fce4ec', color: '#c62828' }}>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full animate-pulse" style={{ backgroundColor: '#fdf0f0', color: '#2d5a9e', border: '1px solid #2d5a9e' }}>
            Pending
          </span>
        );
    }
  };

  const getBorderLeftColor = (status) => {
    switch (status) {
      case 'confirmed': return '#2e7d32';
      case 'rejected': return '#c62828';
      default: return '#2d5a9e';
    }
  };

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: '#d4d8e0', color: '#1a2744' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#1a2744' }}>Quotations & Orders</h1>
          <p className="mt-2 text-sm" style={{ color: '#2d5a9e' }}>Review seller quotation requests, approve/reject orders and inspect unit details.</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', borderTop: '4px solid #1a2744', boxShadow: '0 2px 12px rgba(26,39,68,0.10)' }}>
            <span className="block mb-1" style={{ color: '#2d5a9e', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '750' }}>Total Orders</span>
            <span style={{ color: '#1a2744', fontSize: '2rem', fontWeight: '800' }}>{stats.total}</span>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', borderTop: '4px solid #1a2744', boxShadow: '0 2px 12px rgba(26,39,68,0.10)' }}>
            <span className="block mb-1" style={{ color: '#2d5a9e', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '750' }}>Pending approval</span>
            <span style={{ color: '#1a2744', fontSize: '2rem', fontWeight: '800' }}>{stats.pending}</span>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', borderTop: '4px solid #1a2744', boxShadow: '0 2px 12px rgba(26,39,68,0.10)' }}>
            <span className="block mb-1" style={{ color: '#2d5a9e', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '750' }}>Confirmed</span>
            <span style={{ color: '#1a2744', fontSize: '2rem', fontWeight: '800' }}>{stats.confirmed}</span>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', borderTop: '4px solid #1a2744', boxShadow: '0 2px 12px rgba(26,39,68,0.10)' }}>
            <span className="block mb-1" style={{ color: '#2d5a9e', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '750' }}>Rejected</span>
            <span style={{ color: '#1a2744', fontSize: '2rem', fontWeight: '800' }}>{stats.rejected}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-750 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 rounded-2xl text-slate-500" style={{ backgroundColor: '#fff', border: '1px solid #d4d8e0' }}>
            No orders placed in system.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="shadow-lg overflow-hidden mb-6" style={{ backgroundColor: '#fff', borderRadius: '16px', borderLeft: `4px solid ${getBorderLeftColor(order.status)}` }}>
                
                {/* Header info */}
                <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" style={{ backgroundColor: '#fff' }}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-base" style={{ color: '#1a2744', fontWeight: '700' }}>Order #{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs" style={{ color: '#2d5a9e' }}>
                      Seller: <span className="font-bold" style={{ color: '#1a2744' }}>{order.seller_name}</span> ({order.seller_email}) | Date: {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-left lg:text-right">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Order Total</span>
                      <span className="text-2xl font-extrabold" style={{ color: '#1a2744' }}>{formatINR(Number(order.total_amount_inr))}</span>
                    </div>

                    {/* Actions Panel */}
                    {order.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                          className="disabled:opacity-50 text-xs font-bold transition-all cursor-pointer"
                          style={{ backgroundColor: '#1a2744', color: '#fff', borderRadius: '8px', padding: '8px 20px', border: 'none' }}
                        >
                          Confirm
                        </button>
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'rejected')}
                          className="disabled:opacity-50 text-xs font-bold transition-all cursor-pointer"
                          style={{ backgroundColor: 'transparent', color: '#1a2744', border: '2px solid #1a2744', borderRadius: '8px', padding: '8px 20px' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Notes */}
                {order.notes && (
                  <div className="px-6 py-3 border-b border-slate-100 text-xs" style={{ backgroundColor: '#fdf0f0', color: '#1a2744' }}>
                    <span className="font-bold text-slate-400 mr-2">Order Notes:</span>
                    <span className="italic">"{order.notes}"</span>
                  </div>
                )}

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr style={{ backgroundColor: '#1a2744', color: '#fff' }}>
                        <th className="px-6 py-3 font-bold uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 font-bold uppercase tracking-wider">Ordered Qty</th>
                        <th className="px-6 py-3 font-bold uppercase tracking-wider">Conversion / Stored Base</th>
                        <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Unit Price</th>
                        <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {order.items?.map((item, idx) => (
                        <tr key={item.id} className="transition-colors" style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fdf0f0', color: '#1a2744' }}>
                          <td className="px-6 py-4 font-semibold" style={{ color: '#1a2744' }}>{item.product_name}</td>
                          <td className="px-6 py-4 font-medium" style={{ color: '#1a2744' }}>
                            {Number(item.ordered_quantity).toLocaleString(undefined, { maximumFractionDigits: 3 })} {item.ordered_unit}
                          </td>
                          <td className="px-6 py-4">
                            <span className="border text-[10px] px-2 py-0.5 rounded font-mono" style={{ backgroundColor: '#fff', color: '#2d5a9e', borderColor: '#d4d8e0' }}>
                              {Number(item.ordered_quantity).toLocaleString()} {item.ordered_unit} → {Number(item.base_quantity).toLocaleString()} {item.base_unit}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono" style={{ color: '#1a2744' }}>
                            {formatINR(Number(item.unit_price_inr))}/{item.ordered_unit}
                          </td>
                          <td className="px-6 py-4 text-right font-bold font-mono" style={{ color: '#1a2744' }}>
                            {formatINR(Number(item.line_total_inr))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
