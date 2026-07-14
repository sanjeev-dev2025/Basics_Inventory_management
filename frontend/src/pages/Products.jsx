import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  Search, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [ordering, setOrdering] = useState(''); // '' (default), 'price', '-price'
  const [inStockOnly, setInStockOnly] = useState(false);

  // Modal control states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.is_superuser;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (ordering) {
        params.ordering = ordering;
      }

      const prodRes = await axios.get('/product/', { params });
      setProducts(prodRes.data.results || prodRes.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Unable to load products inventory details.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await axios.get('/category/');
        const cats = catRes.data.results || catRes.data;
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with search and ordering filters
  useEffect(() => {
    // Debounce search input
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, ordering]);

  const handleOpenModal = async (product = null) => {
    setFormError(null);
    try {
      const catRes = await axios.get('/category/');
      const cats = catRes.data.results || catRes.data;
      setCategories(cats);
      
      if (product) {
        setSelectedProduct(product);
        setName(product.name);
        setCategoryId(product.category);
        setPrice(product.price);
        setQuantity(product.quantity);
        setCostPrice(product.cost_price);
      } else {
        setSelectedProduct(null);
        setName('');
        setCategoryId(cats[0]?.id || '');
        setPrice('');
        setQuantity('0');
        setCostPrice('');
      }
    } catch (err) {
      console.error("Failed to load categories on modal open:", err);
      if (product) {
        setSelectedProduct(product);
        setName(product.name);
        setCategoryId(product.category);
        setPrice(product.price);
        setQuantity(product.quantity);
        setCostPrice(product.cost_price);
      } else {
        setSelectedProduct(null);
        setName('');
        setCategoryId(categories[0]?.id || '');
        setPrice('');
        setQuantity('0');
        setCostPrice('');
      }
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    setName('');
    setCategoryId('');
    setPrice('');
    setQuantity('');
    setCostPrice('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !price || !costPrice) {
      setFormError('Please fill in all required fields');
      return;
    }
    setFormLoading(true);
    setFormError(null);

    const payload = {
      name: name.trim(),
      category: parseInt(categoryId),
      price: parseFloat(price),
      quantity: parseInt(quantity || 0),
      cost_price: parseFloat(costPrice)
    };

    try {
      if (selectedProduct) {
        await axios.put(`/product/${selectedProduct.id}/`, payload);
      } else {
        await axios.post('/product/', payload);
      }
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      console.error("Save product failed:", err);
      setFormError(err.response?.data?.detail || "Failed to save product details. Verify inputs.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`/product/${id}/`);
      fetchProducts();
    } catch (err) {
      console.error("Delete product failed:", err);
      alert("Failed to delete product. It might be referenced in sales records.");
    }
  };

  const getCategoryName = (catId) => {
    const found = categories.find(c => c.id === catId);
    return found ? found.name : 'Unknown';
  };

  const toggleSortPrice = () => {
    if (ordering === 'price') {
      setOrdering('-price');
    } else if (ordering === '-price') {
      setOrdering('');
    } else {
      setOrdering('price');
    }
  };

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Package className="w-8 h-8 text-indigo-400" /> Products
          </h2>
          <p className="text-slate-400 mt-1">
            Browse, search, and manage products inside store inventory
          </p>
        </div>
        
        {isManagerOrAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/10 transition duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {/* Search & Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl items-center shadow-xl">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search by product name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
          />
        </div>
        
        <button
          onClick={toggleSortPrice}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-2xl text-sm transition-all hover:border-slate-700 active:scale-98 cursor-pointer"
        >
          <span>Sort by Price</span>
          {ordering === 'price' && <ChevronDown className="w-4 h-4 text-indigo-400" />}
          {ordering === '-price' && <ChevronUp className="w-4 h-4 text-indigo-400" />}
          {!ordering && <span className="w-2 h-2 rounded-full bg-slate-700"></span>}
        </button>

        <button
          onClick={() => setInStockOnly(!inStockOnly)}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 border rounded-2xl text-sm font-semibold transition cursor-pointer ${
            inStockOnly 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-750'
          }`}
        >
          <span>In Stock Only</span>
          {inStockOnly && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
        </button>
      </div>

      {/* Main Grid/List Container */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : products.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Cost Price</th>
                  <th className="py-4 px-6">Selling Price</th>
                  <th className="py-4 px-6">Stock Status</th>
                  {isManagerOrAdmin && <th className="py-4 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                {products
                  .filter((product) => (inStockOnly ? product.quantity > 0 : true))
                  .map((product) => {
                  const isLow = product.quantity < 7;
                  return (
                    <tr key={product.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-slate-100">{product.name}</p>
                          <span className="text-xxs font-mono text-slate-500">SKU #{product.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{getCategoryName(product.category)}</td>
                      <td className="py-4 px-6 text-slate-400 font-mono">${product.cost_price}</td>
                      <td className="py-4 px-6 text-indigo-300 font-semibold font-mono">${product.price}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isLow 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {product.quantity} left
                          </span>
                          {isLow && (
                            <span className="text-amber-500" title="Low stock alert">
                              <AlertTriangle className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                      {isManagerOrAdmin && (
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition inline-flex items-center justify-center cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition inline-flex items-center justify-center cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto flex flex-col items-center">
          <div className="bg-indigo-500/10 p-4 rounded-full border border-indigo-500/20 mb-4">
            <Package className="w-10 h-10 text-indigo-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-200">No products found</h4>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            There are no products listed inside your catalog matching this search.
          </p>
          {isManagerOrAdmin && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Add Product Now
            </button>
          )}
        </div>
      )}

      {/* Edit/Create Product Modal Popup */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" /> 
                {selectedProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-200 transition p-1.5 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                  placeholder="e.g. Coca Cola, Acne Serum"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Product Category
                </label>
                <select
                  required
                  value={String(categoryId)}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)} className="bg-slate-900 text-slate-100">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                    placeholder="2.50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                    placeholder="4.99"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Initial Inventory Quantity
                </label>
                <input
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                  placeholder="e.g. 50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 mt-6 bg-slate-950/20 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 border border-slate-800 text-slate-400 hover:bg-slate-800 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {selectedProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
