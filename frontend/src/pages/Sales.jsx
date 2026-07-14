import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingCart, 
  Receipt, 
  Plus, 
  Trash2, 
  Check, 
  Loader2, 
  ShoppingBag,
  History,
  Eye,
  AlertCircle
} from 'lucide-react';

export default function Sales() {
  const { user } = useAuth();
  
  // POS states
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [posError, setPosError] = useState(null);
  const [posSuccess, setPosSuccess] = useState(false);

  // Sales History states
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [selectedSaleItems, setSelectedSaleItems] = useState([]);
  const [viewingSaleId, setViewingSaleId] = useState(null);
  const [usersMap, setUsersMap] = useState({});

  // Active tab state
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'history'

  const fetchInitialData = async () => {
    try {
      setLoadingHistory(true);
      // Fetch in-stock products
      const prodRes = await axios.get('/product/');
      setProducts(prodRes.data.results || prodRes.data);

      // Fetch users list to resolve cashier usernames
      const usersRes = await axios.get('/users/').catch(() => ({ data: [] }));
      const usersList = usersRes.data.results || usersRes.data;
      const userMap = {};
      if (Array.isArray(usersList)) {
        usersList.forEach(u => {
          userMap[u.id] = u.username;
        });
      }
      setUsersMap(userMap);

      // Fetch sales history
      const salesRes = await axios.get('/sale/');
      setSalesHistory(salesRes.data.results || salesRes.data);
      setHistoryError(null);
    } catch (err) {
      console.error("Sales loading failed:", err);
      setHistoryError("Failed to fetch history logs.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleAddToCart = () => {
    setPosError(null);
    setPosSuccess(false);

    if (!selectedProductId) {
      setPosError('Please select a product');
      return;
    }
    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;

    if (qty <= 0) {
      setPosError('Quantity must be 1 or more');
      return;
    }

    if (product.quantity < qty) {
      setPosError(`Not enough stock. Only ${product.quantity} items left.`);
      return;
    }

    // Check if item is already in cart
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + qty;
      if (product.quantity < newQty) {
        setPosError(`Not enough stock. Only ${product.quantity} total items left.`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity = newQty;
      updatedCart[existingIndex].subtotal = product.price * newQty;
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        product,
        quantity: qty,
        unit_price: product.price,
        subtotal: product.price * qty
      }]);
    }

    setSelectedProductId('');
    setQty(1);
  };

  const handleRemoveFromCart = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setPosError('Your cart is empty.');
      return;
    }

    setCheckoutLoading(true);
    setPosError(null);
    setPosSuccess(false);

    const totalAmount = calculateCartTotal();

    try {
      // 1. Create Sale master record
      const salePayload = {
        cashier: user.id,
        total_amount: totalAmount
      };
      const saleResponse = await axios.post('/sale/', salePayload);
      const saleId = saleResponse.data.id;

      // 2. Create Sale items sequentially/parallelly
      for (const item of cart) {
        await axios.post('/sale_item/', {
          sale: saleId,
          product: item.product.id,
          quantity: item.quantity
        });
      }

      setPosSuccess(true);
      setCart([]);
      
      // Refresh inventory and sales logs
      fetchInitialData();
    } catch (err) {
      console.error("Checkout failed:", err);
      const backendErr = err.response?.data?.quantity || err.response?.data?.detail || "Checkout transaction failed.";
      setPosError(Array.isArray(backendErr) ? backendErr[0] : backendErr);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleViewSaleDetails = async (sale) => {
    try {
      setViewingSaleId(sale.id);
      setSelectedSaleItems([]);
      const response = await axios.get('/sale_item/', { params: { sale_id: sale.id } });
      // Django returns paginated or direct array depending on page size settings
      // We set page_size to 2 inside SaleItemListCreateAPIView!
      // Wait, let's verify if pagination returns results in `.results` field!
      // In sales/views.py:
      // pagination_class=PageNumberPagination  
      // pagination_class.page_size=2
      // YES! Django Rest Framework's PageNumberPagination wraps array in response.data.results!
      // So let's handle both array and object pagination format:
      const items = response.data.results || response.data;
      setSelectedSaleItems(items);
    } catch (err) {
      console.error("Failed to load sale items:", err);
    }
  };

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-indigo-400" /> Transaction Register
          </h2>
          <p className="text-slate-400 mt-1">
            Perform new sales checkouts or check transaction history logs
          </p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'pos' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-slate-200 cursor-pointer'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> POS Register
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'history' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-slate-200 cursor-pointer'
            }`}
          >
            <History className="w-4 h-4" /> Sales History
          </button>
        </div>
      </div>

      {/* POS REGISTER TAB */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Item Add form */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-6">
            <h3 className="text-lg font-bold text-slate-200">Add Product to Cart</h3>
            
            {posError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm font-medium flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{posError}</span>
              </div>
            )}
            {posSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2">
                <Check className="w-4 h-4" /> Checkout Completed Successfully!
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Select Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
              >
                <option value="">-- Choose product --</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id} disabled={prod.quantity <= 0}>
                    {prod.name} (Qty: {prod.quantity} - ${prod.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Checkout Quantity
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
              />
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-slate-950 text-indigo-400 font-semibold py-3.5 rounded-xl shadow-lg transition duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {/* POS Cart details */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-200">Current Cart</h3>
                <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg font-bold">
                  {cart.length} unique items
                </span>
              </div>

              {cart.length > 0 ? (
                <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2">
                  {cart.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-2xl hover:border-slate-800 transition"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{item.product.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ${parseFloat(item.unit_price).toFixed(2)} x {item.quantity} units
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-bold text-indigo-300 font-mono">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(index)}
                          className="p-1.5 text-red-400 hover:bg-red-500/15 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-slate-950 p-4 rounded-full border border-slate-800 mb-4 text-slate-500">
                    <ShoppingCart className="w-10 h-10" />
                  </div>
                  <p className="text-slate-400 font-semibold text-sm">Checkout cart is empty</p>
                  <p className="text-slate-600 text-xs mt-1">Select a product and add to cart to initiate transaction checkout.</p>
                </div>
              )}
            </div>

            {/* Total values & Submit Checkout */}
            {cart.length > 0 && (
              <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-4">
                <div className="flex justify-between items-center text-slate-200">
                  <span className="text-slate-400 text-sm">Checkout Subtotal:</span>
                  <span className="text-2xl font-extrabold font-mono text-slate-100">
                    ${calculateCartTotal().toFixed(2)}
                  </span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none transition cursor-pointer disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-white" />
                      Processing Transaction...
                    </>
                  ) : (
                    'Process Checkout Transaction'
                  )}
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* SALES HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Master sales records table */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-200 mb-6">Sales Log</h3>
              
              {historyError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5" /> {historyError}
                </div>
              )}

              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : salesHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Sale ID</th>
                        <th className="py-3.5 px-4">Cashier</th>
                        <th className="py-3.5 px-4">Total Amount</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      {salesHistory.map((sale) => (
                        <tr key={sale.id} className={`hover:bg-slate-800/10 transition-colors ${viewingSaleId === sale.id ? 'bg-indigo-500/5' : ''}`}>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500">#{sale.id}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-200">
                            {usersMap[sale.cashier] || `Cashier #${sale.cashier}`}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-indigo-300 font-mono">${sale.total_amount}</td>
                          <td className="py-3.5 px-4 text-xs text-slate-500">
                            {new Date(sale.created_at).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleViewSaleDetails(sale)}
                              className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition inline-flex items-center justify-center cursor-pointer"
                              title="Show Sold Items"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20">
                  <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-semibold">No sales log found</p>
                  <p className="text-slate-600 text-xs mt-1">Transactions processed inside store register will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Details pane for selected transaction */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-400" /> Transaction Receipt
            </h3>

            {viewingSaleId ? (
              <div className="space-y-6">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <p className="text-xs text-slate-500">Selected Sale Reference</p>
                  <p className="text-lg font-extrabold text-slate-200 mt-1 font-mono">Invoice #{viewingSaleId}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sold Products</p>
                  
                  {selectedSaleItems.length > 0 ? (
                    selectedSaleItems.map((item, i) => {
                      const prodName = products.find(p => p.id === item.product)?.name || `Product #${item.product}`;
                      return (
                        <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
                          <div>
                            <p className="font-semibold text-slate-200">{prodName}</p>
                            <p className="text-xxs text-slate-500 mt-0.5">${item.unit_price} x {item.quantity}</p>
                          </div>
                          <span className="font-bold text-slate-300 font-mono">${item.subtotal}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center py-6 text-slate-500 text-xs gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading invoice items...
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <span className="text-slate-400 font-semibold text-sm">Invoice Total:</span>
                  <span className="text-xl font-black font-mono text-indigo-400">
                    ${salesHistory.find(s => s.id === viewingSaleId)?.total_amount}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 flex flex-col items-center">
                <Receipt className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs font-medium">Select a sale from logs to display details</p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
