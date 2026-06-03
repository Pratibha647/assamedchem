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
    <div className="min-h-screen bg-slate-900 text-white pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Browse Products</h1>
          <p className="mt-2 text-sm text-slate-400">Search chemical components, solvents, or glassware and build your order.</p>
        </div>

        {/* Global Order Success Alert */}
        {orderPlaced && (
          <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-400 px-4 py-3.5 rounded-xl mb-8 font-semibold text-center">
            🎉 Order placed successfully! You can track its status in "My Orders".
          </div>
        )}

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Product listing */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search & Category Filter Section */}
            <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products by name, SKU or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {/* Category Filter buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategoryFilter('')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      categoryFilter === ''
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategoryFilter(c)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        categoryFilter === c
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                      }`}
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
              <div className="bg-slate-800 border border-slate-750 text-center py-12 rounded-2xl text-slate-500">
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
                    <div key={product.id} className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 relative group">
                      
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
                          <h3 className="font-bold text-lg text-slate-100 leading-snug">{product.name}</h3>
                          <span className="bg-slate-900 border border-slate-700 font-mono text-[9px] font-bold text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider">
                            {product.sku || 'N/A'}
                          </span>
                        </div>
                        
                        <span className="inline-block bg-slate-900 text-slate-400 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full mb-3 border border-slate-750">
                          {product.category || 'Chemicals'}
                        </span>

                        <p className="text-slate-400 text-xs line-clamp-2 mb-4">{product.description || 'No description available.'}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4 p-3 bg-slate-900/50 rounded-xl border border-slate-750">
                          <div>
                            <span className="text-slate-500 block mb-0.5">Base Price</span>
                            <span className="font-semibold text-emerald-400">{formatINR(Number(product.base_price_per_unit))}/{product.base_unit}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-0.5">Stock Available</span>
                            <span className="font-semibold text-slate-300">
                              {Number(product.stock_quantity).toLocaleString(undefined, { maximumFractionDigits: 2 })} {product.base_unit}
                            </span>
                          </div>
                        </div>

                        {/* Compatible Units Tags */}
                        <div className="flex items-center space-x-2 mb-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Order Units:</span>
                          <div className="flex gap-1">
                            {compUnits.map((cu) => (
                              <span key={cu} className="bg-slate-750 border border-slate-700 text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                {cu}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Lower Content / Cart Controls */}
                      <div className="border-t border-slate-700/60 pt-4 mt-auto">
                        <div className="flex gap-2 mb-3">
                          <div className="w-2/3">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Qty</label>
                            <input
                              type="number"
                              min="0.001"
                              step="0.001"
                              value={sel.quantity}
                              onChange={(e) => setSelections({
                                ...selections,
                                [product.id]: { ...sel, quantity: e.target.value }
                              })}
                              className="w-full bg-slate-900 border border-slate-750 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                            />
                          </div>
                          <div className="w-1/3">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Unit</label>
                            <select
                              value={sel.unit}
                              onChange={(e) => setSelections({
                                ...selections,
                                [product.id]: { ...sel, unit: e.target.value }
                              })}
                              className="w-full bg-slate-900 border border-slate-750 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
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
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Live Price</span>
                            <span className="text-sm font-extrabold text-emerald-400">{formatINR(liveLineTotal)}</span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-950/20"
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
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl sticky top-8 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h2 className="text-xl font-bold text-slate-100">Order Cart</h2>
                <span className="bg-indigo-600/25 text-indigo-400 border border-indigo-500/25 px-2.5 py-0.5 rounded-full text-xs font-bold">
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
                    <div key={`${item.product.id}-${item.ordered_unit}`} className="flex items-center justify-between gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-750">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-200">{item.product.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {item.ordered_quantity} {item.ordered_unit} @ {formatINR(item.unitPrice)}/{item.ordered_unit}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-xs text-emerald-400">{formatINR(item.lineTotal)}</span>
                        <button
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-slate-500 hover:text-red-400 font-bold text-lg leading-none cursor-pointer focus:outline-none"
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
                <div className="space-y-4 pt-4 border-t border-slate-700/60">
                  
                  {/* Notes Textarea */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Order Notes (Optional)</label>
                    <textarea
                      placeholder="Shipping requirements, urgent delivery info, etc..."
                      rows="2.5"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Order Subtotal</span>
                    <span className="text-lg font-extrabold text-white">{formatINR(getSubtotal())}</span>
                  </div>

                  {/* Error Alert */}
                  {cartError && (
                    <div className="bg-red-950/30 border border-red-800 text-red-400 text-xs px-3 py-2 rounded-xl text-center">
                      {cartError}
                    </div>
                  )}

                  {/* Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold py-3 rounded-xl transition-all duration-150 cursor-pointer shadow-lg shadow-emerald-950/30"
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
