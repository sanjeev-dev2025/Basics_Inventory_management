import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Sales from './pages/Sales';
import Users from './pages/Users';
import { Loader2 } from 'lucide-react';
import './App.css';

function MainAppContent() {
  const { token, user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-400 font-medium text-sm">Loading system components...</p>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!token || !user) {
    return <Login />;
  }

  // Guard role routing
  const isManagerOrAdmin = user.role === 'MANAGER' || user.is_superuser;
  const currentActivePage = activePage === 'users' && !isManagerOrAdmin ? 'dashboard' : activePage;

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Navbar activePage={currentActivePage} setActivePage={setActivePage} />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-b from-slate-900/40 via-slate-950 to-slate-950">
        {currentActivePage === 'dashboard' && <Dashboard />}
        {currentActivePage === 'products' && <Products />}
        {currentActivePage === 'categories' && <Categories />}
        {currentActivePage === 'sales' && <Sales />}
        {currentActivePage === 'users' && isManagerOrAdmin && <Users />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
