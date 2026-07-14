import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Users from './pages/Users';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/products" element={<Products />} />
              
              {/* Modules restricted to Admin/Manager - Example role enforcement */}
              <Route element={<ProtectedRoute roles={['Admin', 'Manager', 'admin', 'manager']} />}>
                <Route path="/categories" element={<Categories />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<Users />} />
              </Route>
              
              {/* Fallback Unauthorized Route */}
              <Route path="/unauthorized" element={
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h1 className="text-4xl font-bold text-danger mb-4">403</h1>
                  <h2 className="text-2xl font-semibold text-secondary mb-2">Access Denied</h2>
                  <p className="text-gray-500">You don't have permission to view this page.</p>
                </div>
              } />
            </Route>
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
