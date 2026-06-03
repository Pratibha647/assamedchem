import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({}); // order_id -> boolean

  const fetchMyOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/orders/mine');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">My Orders</h1>
          <p className="mt-2 text-sm text-slate-400">Track and view history of your placed inventory orders.</p>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-800 border border-slate-750 text-center py-12 rounded-2xl text-slate-500">
            You haven't placed any orders yet. Go to "Browse Products" to get started!
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = !!expandedOrders[order.id];
              return (
                <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg overflow-hidden transition-all duration-200">
                  
                  {/* Order Summary Row */}
                  <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-800">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Order ID</span>
                        <span className="font-mono text-sm font-bold text-slate-200">#{order.id}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Order Date</span>
                        <span className="text-sm font-medium text-slate-300">{formatDate(order.created_at)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Amount</span>
                        <span className="text-sm font-extrabold text-emerald-400">{formatINR(Number(order.total_amount_inr))}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 self-end md:self-center">
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="bg-slate-700 hover:bg-slate-650 active:scale-95 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer border border-slate-600"
                      >
                        {isExpanded ? 'Hide Items' : 'View Items'}
                      </button>
                    </div>
                  </div>

                  {/* Optional Notes */}
                  {order.notes && (
                    <div className="px-6 pb-4 border-t border-slate-700/30 pt-3 text-xs bg-slate-850/30">
                      <span className="font-bold text-slate-400 mr-2">Notes:</span>
                      <span className="text-slate-300 italic">"{order.notes}"</span>
                    </div>
                  )}

                  {/* Expandable Order Items Section */}
                  {isExpanded && (
                    <div className="border-t border-slate-700/60 bg-slate-900/40">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-850 border-b border-slate-700">
                              <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider">Product Name</th>
                              <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider">Ordered Qty</th>
                              <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider">Stored Base Qty</th>
                              <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider text-right">Unit Price</th>
                              <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-wider text-right">Line Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {order.items?.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-200">{item.product_name}</td>
                                <td className="px-6 py-4 font-medium text-slate-300">
                                  {Number(item.ordered_quantity).toLocaleString(undefined, { maximumFractionDigits: 3 })} {item.ordered_unit}
                                </td>
                                <td className="px-6 py-4 text-slate-400">
                                  {Number(item.base_quantity).toLocaleString(undefined, { maximumFractionDigits: 3 })} {item.base_unit}
                                </td>
                                <td className="px-6 py-4 text-right text-slate-300">
                                  {formatINR(Number(item.unit_price_inr))}/{item.ordered_unit}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-emerald-400">
                                  {formatINR(Number(item.line_total_inr))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
