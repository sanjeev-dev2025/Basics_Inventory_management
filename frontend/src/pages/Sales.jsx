import React, { useState, useEffect, useMemo } from 'react';
import { getSales, createSale, getProducts, createSaleItem } from '../api/services';
import DataTable from '../components/DataTable';
import { Plus, Eye, Printer, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Sales = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [pageCount, setPageCount] = useState(-1);
  const [searchTerm, setSearchTerm] = useState(''); // Maybe no search endpoint, but keeping standard
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getSales({
        page: pagination.pageIndex + 1,
      });
      setData(response.data.results || []);
      setPageCount(Math.ceil((response.data.count || 0) / pagination.pageSize));
    } catch (error) {
      toast.error('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ page: 1, pageSize: 100 }); // fetch first 100 for dropdown
      setProducts(response.data.results || []);
    } catch (e) {
      console.error('Failed to fetch products');
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const printInvoice = (sale) => {
    // A simple window.print wrapper for a new window or just an alert for now
    toast.success(`Printing Invoice #${sale.id}`);
    window.print();
  };

  const columns = useMemo(
    () => [
      {
        header: 'Invoice No.',
        accessorKey: 'id',
        cell: (info) => `#INV-${String(info.getValue()).padStart(5, '0')}`,
      },
      {
        header: 'Date',
        accessorKey: 'date',
        cell: (info) => new Date(info.getValue()).toLocaleString(),
      },
      {
        header: 'Total Amount',
        accessorKey: 'total_amount',
        cell: (info) => <span className="font-medium text-success">${parseFloat(info.getValue() || 0).toFixed(2)}</span>,
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <button
              className="text-primary hover:text-primary-700 transition-colors"
              title="View Details"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => printInvoice(row.original)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Print Invoice"
            >
              <Printer size={18} />
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
          <h1 className="text-2xl font-bold text-secondary">Sales</h1>
          <p className="text-gray-500 text-sm mt-1">Manage sales and invoices</p>
        </div>
        <button
          onClick={openModal}
          className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center shadow-md shadow-primary/20 transition-all"
        >
          <Plus size={18} className="mr-2" />
          Create Sale
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
        <CreateSaleModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          onSuccess={fetchData} 
          products={products}
        />
      )}
    </div>
  );
};

// Simplified Create Sale Modal
const CreateSaleModal = ({ isOpen, onClose, onSuccess, products }) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProductChange = (e) => {
    const prodId = e.target.value;
    setSelectedProduct(prodId);
    const prod = products.find(p => p.id.toString() === prodId);
    if (prod) {
      setPrice(prod.price);
      setCategoryName(prod.category_name);
      setCategoryId(prod.category);
      setBrandName(prod.brand_name);
      setBrandId(prod.brand);
    } else {
      setPrice('');
      setCategoryName('');
      setCategoryId('');
      setBrandName('');
      setBrandId('');
    }
  };

  const handleCreate = async () => {
    if (!selectedProduct || quantity < 1 || !price) {
      toast.error('Please fill all fields correctly');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create Sale first
      const saleRes = await createSale({ total_amount: quantity * price });
      const saleId = saleRes.data.id;

      // Create Sale Item
      await createSaleItem({
        sale: saleId,
        product: selectedProduct,
        category: categoryId,
        brand: brandId,
        quantity: quantity,
        price: price
      });

      toast.success('Sale created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-cards rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-secondary">Quick Sale</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              value={selectedProduct}
              onChange={handleProductChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
            >
              <option value="">Select a product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <div> 
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 outline-none"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div> 
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={categoryName}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 outline-none"
                readOnly
              />
            </div>
            <div> 
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={brandName}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 outline-none"
                readOnly
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center mt-4 border border-gray-100">
            <span className="text-gray-600 font-medium">Total:</span>
            <span className="text-xl font-bold text-primary">${(quantity * price || 0).toFixed(2)}</span>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-600 transition-colors font-medium flex items-center justify-center min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Sale'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
