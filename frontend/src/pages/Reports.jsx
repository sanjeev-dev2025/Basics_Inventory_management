import React, { useState, useEffect } from 'react';
import { getDailyReport, getMonthlyProfit, getDailyReportCSV, getMonthlyReportCSV } from '../api/services';
import { Download, FileText, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [dailyRes, monthlyRes] = await Promise.all([
          getDailyReport(),
          getMonthlyProfit()
        ]);
        setDailyData(dailyRes.data || []);
        setMonthlyData(monthlyRes.data || []);
      } catch (error) {
        console.error("Failed to load reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportCSV = async (type) => {
    if (type === 'Daily Sales' || type === 'Monthly Profit') {
      try {
        toast.loading(`Exporting ${type} report to CSV...`, { id: 'csv_export' });
        
        let response;
        let filename;
        if (type === 'Daily Sales') {
          response = await getDailyReportCSV();
          filename = `daily_report_${new Date().toISOString().split('T')[0]}.csv`;
        } else {
          response = await getMonthlyReportCSV();
          filename = `monthly_report_${new Date().toISOString().split('T')[0].substring(0, 7)}.csv`;
        }
        
        // Create a blob from the response data
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success(`${type} exported successfully!`, { id: 'csv_export' });
      } catch (error) {
        console.error("Failed to export CSV", error);
        toast.error(`Failed to export ${type} CSV.`, { id: 'csv_export' });
      }
    } else {
      toast.error(`CSV export for ${type} is not yet implemented.`);
    }
  };

  const handleExportPDF = (type) => {
    toast.success(`Exporting ${type} report to PDF...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">View and export business reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Sales Report */}
        <div className="bg-cards rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <FileText size={24} />
              </div>
              <h2 className="text-xl font-bold text-secondary">Daily Sales</h2>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleExportCSV('Daily Sales')}
                className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                title="Export CSV"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase">
                  <th className="px-4 py-3 font-semibold rounded-l-lg">Date</th>
                  <th className="px-4 py-3 font-semibold rounded-r-lg text-right">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dailyData.length > 0 ? (
                  dailyData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-secondary">{row.name || row.date}</td>
                      <td className="px-4 py-3 text-sm font-bold text-success text-right">${parseFloat(row.sales || row.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-4 py-8 text-center text-gray-500 text-sm">No data available for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Profit Report */}
        <div className="bg-cards rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-accent/10 text-accent rounded-xl">
                <BarChart2 size={24} />
              </div>
              <h2 className="text-xl font-bold text-secondary">Monthly Profit</h2>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleExportCSV('Monthly Profit')}
                className="p-2 text-gray-500 hover:text-accent hover:bg-accent/5 rounded-lg transition-colors"
                title="Export CSV"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase">
                  <th className="px-4 py-3 font-semibold rounded-l-lg">Month</th>
                  <th className="px-4 py-3 font-semibold rounded-r-lg text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyData.length > 0 ? (
                  monthlyData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-secondary">{row.name || row.month}</td>
                      <td className="px-4 py-3 text-sm font-bold text-warning text-right">${parseFloat(row.profit || 0).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-4 py-8 text-center text-gray-500 text-sm">No data available for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
