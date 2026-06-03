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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#1a2744' }}>My Orders</h1>
          <p className="mt-2 text-sm" style={{ color: '#2d5a9e' }}>Track and view history of your placed inventory orders.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-750 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 rounded-2xl text-slate-500" style={{ backgroundColor: '#fff', border: '1px solid #d4d8e0' }}>
            You haven't placed any orders yet. Go to "Browse Products" to get started!
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = !!expandedOrders[order.id];
              return (
                <div key={order.id} className="shadow-lg overflow-hidden transition-all duration-200 mb-6" style={{ backgroundColor: '#fff', borderRadius: '16px', borderLeft: `4px solid ${getBorderLeftColor(order.status)}` }}>
                  
                  {/* Order Summary Row */}
                  <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4" style={{ backgroundColor: '#fff' }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#2d5a9e' }}>Order ID</span>
                        <span className="font-mono text-sm font-bold" style={{ color: '#1a2744' }}>#{order.id}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#2d5a9e' }}>Order Date</span>
                        <span className="text-sm font-medium" style={{ color: '#1a2744' }}>{formatDate(order.created_at)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#2d5a9e' }}>Total Amount</span>
                        <span className="text-sm font-extrabold" style={{ color: '#1a2744' }}>{formatINR(Number(order.total_amount_inr))}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#2d5a9e' }}>Status</span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 self-end md:self-center">
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="active:scale-95 text-xs font-bold transition-all cursor-pointer"
                        style={{ backgroundColor: '#1a2744', color: '#fff', borderRadius: '8px', padding: '8px 16px', border: 'none' }}
                      >
                        {isExpanded ? 'Hide Items' : 'View Items'}
                      </button>
                    </div>
                  </div>

                  {/* Optional Notes */}
                  {order.notes && (
                    <div className="px-6 pb-4 border-t border-slate-100 pt-3 text-xs" style={{ backgroundColor: '#fdf0f0', color: '#1a2744' }}>
                      <span className="font-bold mr-2" style={{ color: '#2d5a9e' }}>Notes:</span>
                      <span className="italic">"{order.notes}"</span>
                    </div>
                  )}

                  {/* Expandable Order Items Section */}
                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr style={{ backgroundColor: '#1a2744', color: '#fff' }}>
                              <th className="px-6 py-3 font-bold uppercase tracking-wider">Product Name</th>
                              <th className="px-6 py-3 font-bold uppercase tracking-wider">Ordered Qty</th>
                              <th className="px-6 py-3 font-bold uppercase tracking-wider">Stored Base Qty</th>
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
                                <td className="px-6 py-4" style={{ color: '#2d5a9e' }}>
                                  {Number(item.base_quantity).toLocaleString(undefined, { maximumFractionDigits: 3 })} {item.base_unit}
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
