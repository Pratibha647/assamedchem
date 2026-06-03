import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    base_unit: 'g',
    base_price_per_unit: '',
    stock_quantity: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      base_unit: 'g',
      base_price_per_unit: '',
      stock_quantity: '0'
    });
    setError('');
    setShowForm(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      description: product.description || '',
      category: product.category || '',
      base_unit: product.base_unit,
      base_price_per_unit: Number(product.base_price_per_unit),
      stock_quantity: Number(product.stock_quantity)
    });
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        setError(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (Number(formData.base_price_per_unit) <= 0) {
      setError('Base price must be greater than 0');
      return;
    }

    try {
      const body = {
        name: formData.name,
        sku: formData.sku || null,
        description: formData.description || null,
        category: formData.category || null,
        base_unit: formData.base_unit,
        base_price_per_unit: Number(formData.base_price_per_unit),
        stock_quantity: Number(formData.stock_quantity) || 0
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, body);
      } else {
        await api.post('/products', body);
      }

      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Filter products by search term and category selection
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from product list for filtering options
  const categories = ['Chemicals', 'Solvents', 'Acids', 'Glassware'];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Search and Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Product Management</h1>
            <p className="mt-2 text-sm text-slate-400">View, create, edit and delete catalog products.</p>
          </div>
          <div>
            <button
              onClick={handleOpenAdd}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950/20 transition-all duration-200 cursor-pointer"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Search Products</label>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Category Filter</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && !showForm && (
          <div className="bg-red-950/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Products Table Container */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-850/50 border-b border-slate-700">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">SKU</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Base Unit</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Price (INR)</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Stock</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Compatible Units</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                        No products found match the current search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-750/30 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-100">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-slate-400 max-w-xs truncate">{product.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-indigo-400">{product.sku || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{product.category || 'Uncategorized'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-400">{product.base_unit}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-400">
                          {formatINR(Number(product.base_price_per_unit))} <span className="text-xs font-medium text-slate-400">/ {product.base_unit}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-200">
                          {Number(product.stock_quantity).toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs text-slate-400 font-medium">{product.base_unit}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {product.compatible_units?.map(u => (
                              <span key={u} className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-650">
                                {u}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            
            {error && (
              <div className="bg-red-950/40 border border-red-800 text-red-400 px-4 py-2.5 rounded-xl mb-4 text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acetone"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. ACE001"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Solvents"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details and specifications..."
                  rows="3"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Base Unit</label>
                  <select
                    value={formData.base_unit}
                    onChange={(e) => setFormData({ ...formData, base_unit: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="g">g (Grams)</option>
                    <option value="mL">mL (Milliliters)</option>
                    <option value="item">item (Pcs)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Base Price / Unit (INR)</label>
                  <input
                    type="number"
                    step="0.000001"
                    min="0.000001"
                    required
                    value={formData.base_price_per_unit}
                    onChange={(e) => setFormData({ ...formData, base_price_per_unit: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                💡 **Base Unit Info**: g = weight, mL = volume, item = count. Price is per 1 unit of <span className="font-bold text-indigo-400">{formData.base_unit}</span>.
              </p>

              <div>
                <label className="block text-sm font-semibold mb-1">Initial Stock Quantity</label>
                <input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-700 hover:bg-slate-650 text-slate-200 px-5 py-2.5 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
