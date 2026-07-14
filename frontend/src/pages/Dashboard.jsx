import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyProfit, setMonthlyProfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, dailyRes, monthlyRes] = await Promise.all([
          axios.get('/dashboard/'),
          axios.get('/daily-report/').catch(() => ({ data: { daily_profit: 0, daily_sales: 0 } })),
          axios.get('/monthly-profit/').catch(() => ({ data: { monthly_profit: 0 } }))
        ]);

        setStats(dashboardRes.data);
        setDailyReport(dailyRes.data);
        setMonthlyProfit(monthlyRes.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError("Unable to load dashboard details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 text-center">
        <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl">
          <p className="font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const lowStockCount = stats?.low_stock_count || 0;
  const isLowStock = lowStockCount > 0;

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.total_products || 0,
      icon: Package,
      gradient: 'from-blue-600 to-cyan-500',
      description: 'Items logged in database'
    },
    {
      title: 'Low Stock Products',
      value: lowStockCount,
      icon: AlertTriangle,
      gradient: isLowStock ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600',
      description: stats?.low_stock_message || ''
    },
    {
      title: "Today's Sales",
      value: `$${parseFloat(dailyReport?.daily_sales || 0).toFixed(2)}`,
      icon: TrendingUp,
      gradient: 'from-indigo-600 to-violet-500',
      description: 'Value of products checkout today'
    },
    {
      title: "Monthly Profit",
      value: `$${parseFloat(monthlyProfit?.monthly_profit || 0).toFixed(2)}`,
      icon: DollarSign,
      gradient: 'from-purple-600 to-pink-500',
      description: 'Calculated this current calendar month'
    }
  ];

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
      {/* Welcome Heading */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          System Overview
        </h2>
        <p className="text-slate-400 mt-1">
          Real-time analytics and inventory status log.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/80"
            >
              {/* Corner Accent Circle */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-5 rounded-full blur-xl`}></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-400">{card.title}</p>
                  <h3 className="text-2xl font-bold text-slate-100 mt-2 tracking-tight">
                    {card.value}
                  </h3>
                </div>
                <div className={`bg-gradient-to-br ${card.gradient} p-3 rounded-2xl shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 font-medium flex items-center">
                {card.title === 'Low Stock Products' && (
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                )}
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Row 2: Low Stock List & Profit Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Low Stock Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-bold text-slate-200">Low Stock Alerts</h4>
              <p className="text-xs text-slate-400 mt-0.5">Products with quantity lower than 7 units</p>
            </div>
            {isLowStock ? (
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold px-2.5 py-1 rounded-lg">
                Action Required
              </span>
            ) : (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-3">
            {isLowStock ? (
              stats?.low_stock_products.map((product, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-2xl hover:border-slate-800 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{product.name}</p>
                      <p className="text-xxs text-slate-500 mt-0.5">Critical restock threshold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      {product.quantity} items left
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <div className="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20 mb-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-slate-300 font-semibold text-sm">All products fully stocked</p>
                <p className="text-slate-500 text-xs mt-1">Stock levels across all items are currently sufficient.</p>
              </div>
            )}
          </div>
        </div>

        {/* Profitability Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-slate-200 mb-1">Financial Report</h4>
            <p className="text-xs text-slate-400 mb-6">Overview of sales and profitability margins</p>
          </div>

          <div className="space-y-6 flex-1 justify-center flex flex-col">
            {/* Sales Indicator */}
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-400">Daily Sales Value</span>
                <span className="text-slate-200">${parseFloat(dailyReport?.daily_sales || 0).toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3.5 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-3.5 rounded-full" 
                  style={{ width: `${Math.min(100, (parseFloat(dailyReport?.daily_sales || 0) / 1000) * 100)}%` }}
                ></div>
              </div>
              <span className="text-xxs text-slate-500 mt-1.5 block">Progress bar relative to standard $1,000 target</span>
            </div>

            {/* Profits Margin Indicator */}
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-400">Daily Net Profit</span>
                <span className="text-emerald-400 font-semibold">${parseFloat(dailyReport?.daily_profit || 0).toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3.5 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3.5 rounded-full" 
                  style={{ width: `${Math.min(100, (parseFloat(dailyReport?.daily_profit || 0) / 400) * 100)}%` }}
                ></div>
              </div>
              <span className="text-xxs text-slate-500 mt-1.5 block">Progress bar relative to standard $400 target</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Date: {new Date().toLocaleDateString()}
            </span>
            <span>Updates hourly</span>
          </div>
        </div>

      </div>
    </div>
  );
}
