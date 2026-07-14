import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users as UsersIcon, 
  LogOut, 
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();

  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.is_superuser;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'sales', label: 'Sales & POS', icon: ShoppingCart },
  ];

  if (isManagerOrAdmin) {
    menuItems.push({ id: 'users', label: 'User Roles', icon: UsersIcon });
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-900/40">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Inventory 
            </h1>
            <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
              Management
            </span>
          </div>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3 px-2 py-3 rounded-xl bg-slate-800/30 mb-3 border border-slate-800/40">
          <div className="bg-gradient-to-tr from-slate-700 to-slate-600 p-2 rounded-lg">
            <UserIcon className="w-4 h-4 text-slate-300" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-200 truncate">
              {user?.username}
            </p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xxs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-0.5">
              {user?.role || 'CASHIER'}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-sm font-medium transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
