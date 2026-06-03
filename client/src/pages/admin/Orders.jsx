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
          <span className="inline-block bg-emerald-950/40 text-emerald-400 border border-emerald-800 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
            Confirmed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-block bg-red-950/40 text-red-400 border border-red-850 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-block bg-yellow-950/40 text-yellow-400 border border-yellow-800 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full animate-pulse">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Quotations & Orders</h1>
          <p className="mt-2 text-sm text-slate-400">Review seller quotation requests, approve/reject orders and inspect unit details.</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Orders</span>
            <span className="text-3xl font-extrabold">{stats.total}</span>
          </div>
          <div className="bg-slate-850 border border-yellow-900/30 p-5 rounded-2xl">
            <span className="text-xs text-yellow-400/80 font-bold uppercase tracking-wider block mb-1">Pending approval</span>
            <span className="text-3xl font-extrabold text-yellow-450">{stats.pending}</span>
          </div>
          <div className="bg-slate-850 border border-emerald-900/30 p-5 rounded-2xl">
            <span className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider block mb-1">Confirmed</span>
            <span className="text-3xl font-extrabold text-emerald-450">{stats.confirmed}</span>
          </div>
          <div className="bg-slate-850 border border-red-900/30 p-5 rounded-2xl">
            <span className="text-xs text-red-400/80 font-bold uppercase tracking-wider block mb-1">Rejected</span>
            <span className="text-3xl font-extrabold text-red-450">{stats.rejected}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-800 border border-slate-750 text-center py-12 rounded-2xl text-slate-500">
            No orders placed in system.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg overflow-hidden">
                
                {/* Header info */}
                <div className="p-6 border-b border-slate-700/60 bg-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-base font-bold text-slate-200">Order #{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-slate-400">
                      Seller: <span className="font-bold text-slate-300">{order.seller_name}</span> ({order.seller_email}) | Date: {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-left lg:text-right">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Order Total</span>
                      <span className="text-2xl font-extrabold text-emerald-400">{formatINR(Number(order.total_amount_inr))}</span>
                    </div>

                    {/* Actions Panel */}
                    {order.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-4.5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-950/20"
                        >
                          Confirm
                        </button>
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold px-4.5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-red-950/20"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Notes */}
                {order.notes && (
                  <div className="px-6 py-3 border-b border-slate-700/40 text-xs bg-slate-850/20">
                    <span className="font-bold text-slate-400 mr-2">Order Notes:</span>
                    <span className="text-slate-300 italic">"{order.notes}"</span>
                  </div>
                )}

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-850 border-b border-slate-750">
                        <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider">Ordered Qty</th>
                        <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider">Conversion / Stored Base</th>
                        <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider text-right">Unit Price</th>
                        <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-750 bg-slate-900/10">
                      {order.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-750/10 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-200">{item.product_name}</td>
                          <td className="px-6 py-4 font-medium text-slate-300">
                            {Number(item.ordered_quantity).toLocaleString(undefined, { maximumFractionDigits: 3 })} {item.ordered_unit}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-900 border border-slate-700/60 text-[10px] text-slate-400 px-2 py-0.5 rounded font-mono">
                              {Number(item.ordered_quantity).toLocaleString()} {item.ordered_unit} → {Number(item.base_quantity).toLocaleString()} {item.base_unit}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-slate-300 font-mono">
                            {formatINR(Number(item.unit_price_inr))}/{item.ordered_unit}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-400 font-mono">
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
