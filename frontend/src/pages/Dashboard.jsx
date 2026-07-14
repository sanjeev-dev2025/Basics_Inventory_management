import React, { useState, useEffect } from 'react';
import { getDashboardData, getDailyReport, getMonthlyProfit, getLast7DaysProfit, getCategories, getBrands, getSales } from '../api/services';
import { Package, Tags, ShoppingBag, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const DashboardCard = ({ title, value, icon, color, bgColor }) => (
  <div className="bg-cards p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center transition-transform hover:-translate-y-1 duration-300">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 ${bgColor} ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-secondary">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_products: 0,
    total_categories: 0,
    total_brands: 0,
    low_stock_products: 0,
    daily_sales: 0,
    daily_profit: 0,
    monthly_sales: 0,
    monthly_profit: 0,
    recent_sales: []
  });
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [dashRes, catRes, brandRes, dailyRes, monthlyRes, salesRes, chartRes] = await Promise.allSettled([
          getDashboardData(),
          getCategories({ page: 1 }),
          getBrands({ page: 1 }),
          getDailyReport(),
          getMonthlyProfit(),
          getSales({ page: 1 }),
          getLast7DaysProfit()
        ]);

        const dashboardData = dashRes.status === 'fulfilled' ? dashRes.value.data : {};
        const categoriesData = catRes.status === 'fulfilled' ? catRes.value.data : {};
        const brandsData = brandRes.status === 'fulfilled' ? brandRes.value.data : {};
        const dailyDataObj = dailyRes.status === 'fulfilled' ? dailyRes.value.data : {};
        const monthlyDataObj = monthlyRes.status === 'fulfilled' ? monthlyRes.value.data : {};
        const salesData = salesRes.status === 'fulfilled' ? salesRes.value.data : {};
        const chartDataArr = chartRes.status === 'fulfilled' ? chartRes.value.data : [];

        setStats({
          total_products: dashboardData.total_products || 0,
          total_categories: categoriesData.count || 0,
          total_brands: brandsData.count || 0,
          low_stock_products: dashboardData.low_stock_count || 0,
          daily_sales: dailyDataObj.daily_sales || 0,
          daily_profit: dailyDataObj.daily_profit || 0,
          monthly_sales: monthlyDataObj.monthly_sales || 0,
          monthly_profit: monthlyDataObj.monthly_profit || 0,
          recent_sales: salesData.results ? salesData.results.slice(0, 5) : (Array.isArray(salesData) ? salesData.slice(0, 5) : [])
        });

        if (chartDataArr && Array.isArray(chartDataArr)) {
          setDailyData(chartDataArr.map(item => ({
            name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
            sales: parseFloat(item.total_profit) // backend actually returns daily_profit from this endpoint, mapped to sales for UI chart
          })));
        }

        setMonthlyData([{
          name: 'This Month',
          profit: parseFloat(monthlyDataObj.monthly_profit || 0)
        }]);

      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening in your store today.</p>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Products" 
          value={stats.total_products} 
          icon={<Package size={24} />} 
          color="text-primary" 
          bgColor="bg-primary/10" 
        />
        <DashboardCard 
          title="Categories" 
          value={stats.total_categories} 
          icon={<Tags size={24} />} 
          color="text-accent" 
          bgColor="bg-accent/10" 
        />
        <DashboardCard 
          title="Brands" 
          value={stats.total_brands} 
          icon={<ShoppingBag size={24} />} 
          color="text-indigo-500" 
          bgColor="bg-indigo-500/10" 
        />
        <DashboardCard 
          title="Low Stock" 
          value={stats.low_stock_products} 
          icon={<AlertTriangle size={24} />} 
          color="text-danger" 
          bgColor="bg-danger/10" 
        />
        <DashboardCard 
          title="Daily Sales" 
          value={`$${parseFloat(stats.daily_sales || 0).toLocaleString()}`} 
          icon={<TrendingUp size={24} />} 
          color="text-success" 
          bgColor="bg-success/10" 
        />
        <DashboardCard 
          title="Daily Profit" 
          value={`$${parseFloat(stats.daily_profit || 0).toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          color="text-emerald-500" 
          bgColor="bg-emerald-500/10" 
        />
        <DashboardCard 
          title="Monthly Sales" 
          value={`$${parseFloat(stats.monthly_sales || 0).toLocaleString()}`} 
          icon={<TrendingUp size={24} />} 
          color="text-blue-500" 
          bgColor="bg-blue-500/10" 
        />
        <DashboardCard 
          title="Monthly Profit" 
          value={`$${parseFloat(stats.monthly_profit || 0).toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          color="text-warning" 
          bgColor="bg-warning/10" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <div className="bg-cards p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-secondary mb-6">Daily Sales Report</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-cards p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-secondary mb-6">Monthly Profit</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="profit" fill="#14B8A6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-cards rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-secondary">Recent Sales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase">
                <th className="px-6 py-4 font-semibold">Invoice No</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recent_sales && stats.recent_sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-secondary">#INV-{String(sale.id).padStart(5, '0')}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(sale.created_at || sale.date || new Date()).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-success text-right">${parseFloat(sale.total_amount || sale.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
              {(!stats.recent_sales || stats.recent_sales.length === 0) && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No recent sales found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
