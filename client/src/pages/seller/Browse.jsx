import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import { getCompatibleUnits, getPricePerUnit, calculateLineTotal } from '../../lib/units';

export default function Browse() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [cartError, setCartError] = useState('');
  const [selections, setSelections] = useState({}); // state mapping product_id -> { quantity, unit }

  // Search & filter API calls (debounced 300ms)
  useEffect(() => {
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get('/products/search', {
          params: {
            q: searchTerm,
            category: categoryFilter
          }
        });
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching searched products:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, categoryFilter]);

  const handleAddToCart = (product) => {
    const sel = selections[product.id] || { quantity: 1, unit: product.base_unit };
    const qty = Number(sel.quantity);
    const unit = sel.unit;

    if (!qty || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const { unitPrice, lineTotal } = calculateLineTotal(
      qty,
      unit,
      Number(product.base_price_per_unit)
    );

    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.ordered_unit === unit
    );

    let newCart = [...cart];
    if (existingIndex > -1) {
      const newQty = newCart[existingIndex].ordered_quantity + qty;
      const reCalc = calculateLineTotal(newQty, unit, Number(product.base_price_per_unit));
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        ordered_quantity: newQty,
        lineTotal: reCalc.lineTotal
      };
    } else {
      newCart.push({
        product,
        ordered_unit: unit,
        ordered_quantity: qty,
        unitPrice,
        lineTotal
      });
    }

    setCart(newCart);
    setCartError('');
    
    // Alert feedback
    const toast = document.getElementById(`toast-${product.id}`);
    if (toast) {
      toast.classList.remove('opacity-0');
      toast.classList.add('opacity-100');
      setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
      }, 1500);
    }
  };

  const handleRemoveFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setCartError('');
    
    try {
      const body = {
        notes,
        items: cart.map(item => ({
          product_id: item.product.id,
          ordered_unit: item.ordered_unit,
          ordered_quantity: item.ordered_quantity
        }))
      };

      await api.post('/orders', body);
      setCart([]);
      setNotes('');
      setOrderPlaced(true);
      setTimeout(() => setOrderPlaced(false), 4000);
    } catch (err) {
      console.error('Error placing order:', err);
      setCartError(err.response?.data?.message || 'Failed to place order');
    }
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getSubtotal = () => {
    return cart.reduce((acc, item) => acc + item.lineTotal, 0);
  };

  const categories = ['Chemicals', 'Solvents', 'Acids', 'Glassware'];

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: '#d4d8e0', color: '#1a2744' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#1a2744' }}>Browse Products</h1>
          <p className="mt-2 text-sm" style={{ color: '#2d5a9e' }}>Search chemical components, solvents, or glassware and build your order.</p>
        </div>

        {/* Global Order Success Alert */}
        {orderPlaced && (
          <div className="bg-emerald-50 border border-emerald-250 text-emerald-700 px-4 py-3.5 rounded-xl mb-8 font-semibold text-center">
            🎉 Order placed successfully! You can track its status in "My Orders".
          </div>
        )}

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Product listing */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search & Category Filter Section */}
            <div className="p-5 rounded-2xl space-y-4 border border-slate-300" style={{ backgroundColor: '#fff' }}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products by name, SKU or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full outline-none focus:border-[#2d5a9e]"
                  style={{ border: '2px solid #d4d8e0', borderRadius: '10px', padding: '10px 14px', color: '#1a2744', backgroundColor: '#fff' }}
                />
              </div>
              
              {/* Category Filter buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2d5a9e' }}>Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategoryFilter('')}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: categoryFilter === '' ? '#1a2744' : 'transparent',
                      color: categoryFilter === '' ? '#fff' : '#1a2744',
                      border: categoryFilter === '' ? 'none' : '2px solid #1a2744'
                    }}
                  >
                    All Products
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategoryFilter(c)}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                      style={{
                        backgroundColor: categoryFilter === c ? '#1a2744' : 'transparent',
                        color: categoryFilter === c ? '#fff' : '#1a2744',
                        border: categoryFilter === c ? 'none' : '2px solid #1a2744'
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Cards Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 rounded-2xl text-slate-500" style={{ backgroundColor: '#fff', border: '1px solid #d4d8e0' }}>
                No products found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.map((product) => {
                  const compUnits = getCompatibleUnits(product.base_unit);
                  const sel = selections[product.id] || { quantity: 1, unit: product.base_unit };
                  const qty = Number(sel.quantity) || 0;
                  const unit = sel.unit;

                  // Live price calculations
                  let liveLineTotal = 0;
                  try {
                    liveLineTotal = calculateLineTotal(qty, unit, Number(product.base_price_per_unit)).lineTotal;
                  } catch (e) {}

                  return (
                    <div key={product.id} className="flex flex-col justify-between transition-all duration-200 relative group border border-transparent hover:border-[#e8a0b0] p-5 shadow-sm" style={{ backgroundColor: '#fff', borderRadius: '16px' }}>
                      
                      {/* Success Toast Overlay inside card */}
                      <div
                        id={`toast-${product.id}`}
                        className="absolute inset-x-4 top-4 bg-emerald-600/90 text-white text-xs font-bold px-3 py-2 rounded-xl text-center pointer-events-none opacity-0 transition-opacity duration-300 z-10"
                      >
                        ✓ Added to cart
                      </div>

                      {/* Upper content */}
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-bold text-lg leading-snug" style={{ color: '#1a2744' }}>{product.name}</h3>
                          <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border" style={{ backgroundColor: '#fdf0f0', borderColor: '#d4d8e0', color: '#2d5a9e' }}>
                            {product.sku || 'N/A'}
                          </span>
                        </div>
                        
                        <span className="inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full mb-3 border" style={{ backgroundColor: '#fff', color: '#2d5a9e', borderColor: '#d4d8e0' }}>
                          {product.category || 'Chemicals'}
                        </span>

                        <p className="text-xs line-clamp-2 mb-4" style={{ color: '#2d5a9e' }}>{product.description || 'No description available.'}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4 p-3 rounded-xl border border-slate-200" style={{ backgroundColor: '#fdf0f0' }}>
                          <div>
                            <span className="block mb-0.5" style={{ color: '#2d5a9e' }}>Base Price</span>
                            <span className="font-semibold" style={{ color: '#1a2744' }}>{formatINR(Number(product.base_price_per_unit))}/{product.base_unit}</span>
                          </div>
                          <div>
                            <span className="block mb-0.5" style={{ color: '#2d5a9e' }}>Stock Available</span>
                            <span className="font-semibold" style={{ color: '#1a2744' }}>
                              {Number(product.stock_quantity).toLocaleString(undefined, { maximumFractionDigits: 2 })} {product.base_unit}
                            </span>
                          </div>
                        </div>

                        {/* Compatible Units Tags */}
                        <div className="flex items-center space-x-2 mb-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#2d5a9e' }}>Order Units:</span>
                          <div className="flex gap-1">
                            {compUnits.map((cu) => (
                              <span key={cu} className="text-[9px] font-bold px-1.5 py-0.5 rounded border" style={{ backgroundColor: '#fff', color: '#1a2744', borderColor: '#d4d8e0' }}>
                                {cu}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Lower Content / Cart Controls */}
                      <div className="border-t border-slate-100 pt-4 mt-auto">
                        <div className="flex gap-2 mb-3">
                          <div className="w-2/3">
                            <label className="block text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#2d5a9e' }}>Qty</label>
                            <input
                              type="number"
                              min="0.001"
                              step="0.001"
                              value={sel.quantity}
                              onChange={(e) => setSelections({
                                ...selections,
                                [product.id]: { ...sel, quantity: e.target.value }
                              })}
                              className="w-full focus:outline-none focus:border-[#2d5a9e] text-xs"
                              style={{ border: '2px solid #d4d8e0', borderRadius: '10px', padding: '6px 10px', backgroundColor: '#fff', color: '#1a2744' }}
                            />
                          </div>
                          <div className="w-1/3">
                            <label className="block text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#2d5a9e' }}>Unit</label>
                            <select
                              value={sel.unit}
                              onChange={(e) => setSelections({
                                ...selections,
                                [product.id]: { ...sel, unit: e.target.value }
                              })}
                              className="w-full focus:outline-none focus:border-[#2d5a9e] text-xs"
                              style={{ border: '2px solid #d4d8e0', borderRadius: '10px', padding: '6px 10px', backgroundColor: '#fff', color: '#1a2744' }}
                            >
                              {compUnits.map((cu) => (
                                <option key={cu} value={cu}>{cu}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Price Preview & Add to Cart button */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-left">
                            <span className="block text-[9px] font-bold uppercase tracking-wider" style={{ color: '#2d5a9e' }}>Live Price</span>
                            <span className="text-sm font-extrabold" style={{ color: '#1a2744' }}>{formatINR(liveLineTotal)}</span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                            style={{ backgroundColor: '#1a2744', color: '#fff', border: 'none' }}
                          >
                            + Add to Cart
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Cart panel */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 shadow-xl sticky top-8 space-y-6 border border-slate-300" style={{ backgroundColor: '#fff' }}>
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xl font-bold" style={{ color: '#1a2744' }}>Order Cart</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border" style={{ backgroundColor: '#fdf0f0', color: '#1a2744', borderColor: '#e8a0b0' }}>
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Cart List */}
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Your cart is empty. Add products from the browse grid.
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div key={`${item.product.id}-${item.ordered_unit}`} className="flex items-center justify-between gap-2 p-3 rounded-xl border border-slate-200" style={{ backgroundColor: '#fdf0f0' }}>
                      <div>
                        <h4 className="font-semibold text-xs" style={{ color: '#1a2744' }}>{item.product.name}</h4>
                        <p className="text-[10px] mt-0.5" style={{ color: '#2d5a9e' }}>
                          {item.ordered_quantity} {item.ordered_unit} @ {formatINR(item.unitPrice)}/{item.ordered_unit}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-xs" style={{ color: '#1a2744' }}>{formatINR(item.lineTotal)}</span>
                        <button
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-slate-550 hover:text-red-400 font-bold text-lg leading-none cursor-pointer focus:outline-none"
                          title="Remove item"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Order total & notes */}
              {cart.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  
                  {/* Notes Textarea */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#2d5a9e' }}>Order Notes (Optional)</label>
                    <textarea
                      placeholder="Shipping requirements, urgent delivery info, etc..."
                      rows="2.5"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full focus:outline-none focus:border-[#2d5a9e] text-xs"
                      style={{ border: '2px solid #d4d8e0', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#fff', color: '#1a2744' }}
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center border p-4 rounded-xl" style={{ backgroundColor: '#fdf0f0', borderColor: '#e8a0b0' }}>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2d5a9e' }}>Order Subtotal</span>
                    <span className="text-lg font-extrabold" style={{ color: '#1a2744' }}>{formatINR(getSubtotal())}</span>
                  </div>

                  {/* Error Alert */}
                  {cartError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl text-center">
                      {cartError}
                    </div>
                  )}

                  {/* Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full active:scale-98 text-white font-bold py-3 rounded-xl transition-all duration-150 cursor-pointer"
                    style={{ backgroundColor: '#1a2744', color: '#fff', border: 'none' }}
                  >
                    Place Order
                  </button>

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
