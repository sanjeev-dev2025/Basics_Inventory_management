import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingBag, 
  ShoppingCart, 
  BarChart3, 
  LogOut,
  Users as UsersIcon 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  
  const role = user?.role || user?.user_type || ''; 
  const normalizedRole = role.toLowerCase();
  
  // If user is a superuser, they shouldn't be treated as a cashier even if the default role is set to CASHIER
  const isCashier = (normalizedRole === 'cashier') && !user?.is_superuser;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, hideForCashier: false },
    { name: 'Sales', path: '/sales', icon: <ShoppingCart size={20} />, hideForCashier: false },
    { name: 'Products', path: '/products', icon: <Package size={20} />, hideForCashier: false },
    { name: 'Categories', path: '/categories', icon: <Tags size={20} />, hideForCashier: true },
    { name: 'Brands', path: '/brands', icon: <ShoppingBag size={20} />, hideForCashier: true },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} />, hideForCashier: true },
    { name: 'Users', path: '/users', icon: <UsersIcon size={20} />, hideForCashier: true },
  ];

  const visibleNavItems = navItems.filter(item => !(isCashier && item.hideForCashier));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-cards shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-primary">Inventory<span className="text-secondary">Sys</span></h1>
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-gray-500 hover:bg-primary/10 hover:text-primary'
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-danger transition-colors rounded-xl hover:bg-danger/10"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
