import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Package } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await login(data);
      navigate('/');
    } catch (error) {
      setErrorMsg(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-cards p-8 rounded-2xl shadow-xl shadow-primary/5">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Package className="text-primary" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-secondary">Welcome Back</h2>
        <p className="text-gray-500 mt-2 text-sm">Sign in to access your inventory</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-lg text-center font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            {...register('username')}
            type="text"
            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
              errors.username ? 'border-danger' : 'border-gray-200'
            }`}
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-danger">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
              errors.password ? 'border-danger' : 'border-gray-200'
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-70 flex justify-center items-center"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
