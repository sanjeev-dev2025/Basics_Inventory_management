import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, deleteProduct, createProduct, updateProduct, getCategories, getBrands } from '../api/services';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().positive('Price must be positive'),
  cost_price: z.coerce.number().positive('Cost price must be positive'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  category: z.coerce.number().min(1, 'Category is required'),
  brand: z.coerce.number().min(1, 'Brand is required'),
});

const Products = () => {
  const { user } = useAuth();
  const role = user?.role || user?.user_type || '';
  const isCashier = role.toLowerCase() === 'cashier' && !user?.is_superuser;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [pageCount, setPageCount] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getProducts({
        page: pagination.pageIndex + 1,
        search: debouncedSearch,
      });
      setData(response.data.results);
      setPageCount(Math.ceil(response.data.count / pagination.pageSize));
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      // Assuming these endpoints return { results: [...] } unpaginated or we fetch page 1 with large size.
      // We will just fetch page 1 for now or if they have no pagination
      const [catRes, brandRes] = await Promise.all([
        getCategories({ page: 1 }),
        getBrands({ page: 1 })
      ]);
      setCategories(catRes.data.results || []);
      setBrands(brandRes.data.results || []);
    } catch (e) {
      console.error("Failed to fetch categories/brands");
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, debouncedSearch]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const openModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Category',
        accessorKey: 'category_name', // As per requirements: Display category name
      },
      {
        header: 'Brand',
        accessorKey: 'brand_name', // As per requirements: Display brand name
      },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: (info) => `$${parseFloat(info.getValue()).toFixed(2)}`,
      },
      {
        header: 'Stock',
        accessorKey: 'stock',
        cell: (info) => {
          const stock = info.getValue();
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${stock < 10 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
              {stock}
            </span>
          );
        }
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            {!isCashier && (
              <>
                <button
                  onClick={() => openModal(row.original)}
                  className="text-primary hover:text-primary-700 transition-colors"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(row.original.id)}
                  className="text-danger hover:text-red-700 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [isCashier]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your inventory products</p>
        </div>
        {!isCashier && (
          <button
            onClick={() => openModal()}
            className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center shadow-md shadow-primary/20 transition-all"
          >
            <Plus size={18} className="mr-2" />
            Add Product
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <DataTable
          columns={columns}
          data={data}
          pageCount={pageCount}
          pagination={pagination}
          setPagination={setPagination}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          loading={loading}
        />
      </div>

      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={closeModal}
          product={editingProduct}
          onSuccess={fetchData}
          categories={categories}
          brands={brands}
        />
      )}
    </div>
  );
};

// Modal Component
const ProductModal = ({ isOpen, onClose, product, onSuccess, categories, brands }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      price: product.price,
      cost_price: product.cost_price || '',
      stock: product.stock,
      category: product.category,
      brand: product.brand,
    } : {
      name: '',
      price: '',
      cost_price: '',
      stock: '',
      category: '',
      brand: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (product) {
        await updateProduct(product.id, data);
        toast.success('Product updated successfully');
      } else {
        await createProduct(data);
        toast.success('Product created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-cards rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-secondary">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
            {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                {...register('category')}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-danger">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select
                {...register('brand')}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {errors.brand && <p className="mt-1 text-sm text-danger">{errors.brand.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                {...register('price')}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              {errors.price && <p className="mt-1 text-sm text-danger">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
              <input
                {...register('cost_price')} 
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              {errors.cost_price && <p className="mt-1 text-sm text-danger">{errors.cost_price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                {...register('stock')}
                type="number"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              {errors.stock && <p className="mt-1 text-sm text-danger">{errors.stock.message}</p>}
            </div>
          </div>

         
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-600 transition-colors font-medium flex items-center justify-center min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Products;
