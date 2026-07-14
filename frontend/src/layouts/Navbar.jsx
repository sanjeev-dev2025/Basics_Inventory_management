import React from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = ({ setMobileOpen }) => {
  const { user } = useAuth();
  
  // Format username to capitalized or default
  const username = user?.username || 'User';

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-cards shadow-sm z-10 sticky top-0">
      <div className="flex items-center">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 mr-4 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 focus:outline-none"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-semibold text-secondary hidden sm:block">
          Welcome back, <span className="text-primary">{username}</span>!
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-primary transition-colors">
          <Bell size={20} />
        </button>
        <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={18} />
          </div>
          <span className="hidden sm:block text-sm font-medium">{username}</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
