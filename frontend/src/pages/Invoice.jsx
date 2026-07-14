import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSale, getSaleItems } from '../api/services';
import toast from 'react-hot-toast';

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const saleRes = await getSale(id);
        setSale(saleRes.data);
        
        const itemsRes = await getSaleItems({ sale: id, page_size: 100 });
        // The API returns paginated data by default
        setItems(itemsRes.data.results || []);
      } catch (error) {
        toast.error('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id]);

  useEffect(() => {
    if (!loading && sale) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, sale]);

  if (loading) {
    return <div className="p-8 text-center">Loading Invoice...</div>;
  }

  if (!sale) {
    return (
      <div className="p-8 text-center text-danger">
        Invoice not found.
        <br />
        <button className="mt-4 text-primary underline" onClick={() => navigate('/sales')}>
          Back to Sales
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white min-h-screen text-gray-800">
      <div className="flex justify-between items-start mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
          <p className="text-gray-500 mt-1">Invoice #{String(sale.id).padStart(5, '0')}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-gray-800">Basics Inventory</h2>
          <p className="text-gray-500 mt-1">Date: {new Date(sale.created_at).toLocaleString()}</p>
        </div>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="py-3 text-left text-gray-600 font-semibold">Item</th>
            <th className="py-3 text-center text-gray-600 font-semibold">Qty</th>
            <th className="py-3 text-right text-gray-600 font-semibold">Unit Price</th>
            <th className="py-3 text-right text-gray-600 font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-4 font-medium">{item.product_name || `Product ID: ${item.product}`}</td>
              <td className="py-4 text-center">{item.quantity}</td>
              <td className="py-4 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
              <td className="py-4 text-right font-medium">${parseFloat(item.subtotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 border-t-2 border-gray-200 pt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">${parseFloat(sale.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center text-gray-500 text-sm print:fixed print:bottom-8 print:left-0 print:right-0">
        <p>Thank you for your business!</p>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #root {
            padding: 0;
            margin: 0;
          }
          .min-h-screen {
            min-height: auto;
          }
          .max-w-3xl {
            max-width: 100%;
          }
          .bg-white * {
            visibility: visible;
          }
          /* This specific structure ensures only this block is printed */
          html, body {
            background-color: white;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
