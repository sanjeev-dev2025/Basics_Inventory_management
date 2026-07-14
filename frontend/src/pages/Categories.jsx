import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Tags, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  FolderPlus,
  AlertCircle
} from 'lucide-react';

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal control states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.is_superuser;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/category/');
      setCategories(response.data.results || response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Unable to load categories list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    setFormError(null);
    if (category) {
      setSelectedCategory(category);
      setName(category.name);
      setDescription(category.description || '');
    } else {
      setSelectedCategory(null);
      setName('');
      setDescription('');
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
    setName('');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }
    setFormLoading(true);
    setFormError(null);

    try {
      const payload = { name: name.trim(), description: description.trim() };
      if (selectedCategory) {
        // Edit / Update category
        await axios.put(`/category/${selectedCategory.id}/`, payload);
      } else {
        // Create category
        await axios.post('/category/', payload);
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      console.error("Save category failed:", err);
      setFormError(err.response?.data?.detail || "Failed to save category. Please check entries.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`/category/${id}/`);
      fetchCategories();
    } catch (err) {
      console.error("Delete category failed:", err);
      alert("Failed to delete category. Make sure no products are associated with it.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Tags className="w-8 h-8 text-indigo-400" /> Categories
          </h2>
          <p className="text-slate-400 mt-1">
            Manage category classifications for system products
          </p>
        </div>
        
        {isManagerOrAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/10 transition duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      {/* Main Categories Table or List */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {categories.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Created At</th>
                  {isManagerOrAdmin && <th className="py-4 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 text-slate-500 font-mono">#{category.id}</td>
                    <td className="py-4 px-6 font-semibold text-slate-100">{category.name}</td>
                    <td className="py-4 px-6 max-w-xs truncate text-slate-400">{category.description || '-'}</td>
                    <td className="py-4 px-6 text-slate-400 text-xs">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    {isManagerOrAdmin && (
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition inline-flex items-center justify-center cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition inline-flex items-center justify-center cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto flex flex-col items-center">
          <div className="bg-indigo-500/10 p-4 rounded-full border border-indigo-500/20 mb-4">
            <Tags className="w-10 h-10 text-indigo-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-200">No categories found</h4>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            There are no product category groups listed yet.
          </p>
          {isManagerOrAdmin && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Create One Now
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal Popup */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" /> 
                {selectedCategory ? 'Edit Category' : 'Create Category'}
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
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                  placeholder="e.g. Cosmetics, Electronics"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm resize-none"
                  placeholder="e.g. Skin care, hair products, and lotions"
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
                  {selectedCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
