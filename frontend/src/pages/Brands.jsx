import React, { useState, useEffect, useMemo } from 'react';
import { getBrands, deleteBrand, createBrand, updateBrand, getCategories } from '../api/services';
import DataTable from '../components/DataTable';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const brandSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.coerce.number().min(1, 'Category is required'),
});

const Brands = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [pageCount, setPageCount] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getBrands({
        page: pagination.pageIndex + 1,
        search: debouncedSearch,
      });
      setData(response.data.results);
      setPageCount(Math.ceil(response.data.count / pagination.pageSize));
    } catch (error) {
      toast.error('Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories({ page: 1 });
      setCategories(response.data.results || []);
    } catch (e) {
      console.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await deleteBrand(id);
        toast.success('Brand deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete brand');
      }
    }
  };

  const openModal = (brand = null) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Category',
        accessorKey: 'category_name', // Display category name instead of ID
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
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
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Brands</h1>
          <p className="text-gray-500 text-sm mt-1">Manage product brands</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center shadow-md shadow-primary/20 transition-all"
        >
          <Plus size={18} className="mr-2" />
          Add Brand
        </button>
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
        <BrandModal
          isOpen={isModalOpen}
          onClose={closeModal}
          brand={editingBrand}
          onSuccess={fetchData}
          categories={categories}
        />
      )}
    </div>
  );
};

const BrandModal = ({ isOpen, onClose, brand, onSuccess, categories }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: brand ? {
      name: brand.name,
      category: brand.category,
    } : {
      name: '',
      category: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (brand) {
        await updateBrand(brand.id, data);
        toast.success('Brand updated successfully');
      } else {
        await createBrand(data);
        toast.success('Brand created successfully');
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
      <div className="bg-cards rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-secondary">
            {brand ? 'Edit Brand' : 'Add Brand'}
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

export default Brands;
