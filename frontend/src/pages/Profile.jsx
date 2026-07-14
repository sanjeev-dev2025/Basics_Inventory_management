import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const handleChangePassword = (e) => {
    e.preventDefault();
    // In a real app, this would call an API endpoint to change the password
    toast.success("Password change link sent to your email!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your personal information and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-cards rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <User size={48} />
            </div>
            <h2 className="text-xl font-bold text-secondary">{user.username || 'User'}</h2>
            <p className="text-gray-500 text-sm mb-4">{user.email || 'No email provided'}</p>
            
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold uppercase tracking-wider">
              {user.role || user.user_type || 'User'}
            </span>
          </div>
        </div>

        {/* Details & Security */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-cards rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-secondary mb-4 flex items-center">
              <Shield size={20} className="mr-2 text-primary" />
              Account Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                <div className="flex items-center px-4 py-2 border border-gray-200 rounded-xl bg-gray-50">
                  <User size={18} className="text-gray-400 mr-3" />
                  <span className="text-secondary font-medium">{user.username}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                <div className="flex items-center px-4 py-2 border border-gray-200 rounded-xl bg-gray-50">
                  <Mail size={18} className="text-gray-400 mr-3" />
                  <span className="text-secondary font-medium">{user.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-cards rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-secondary mb-4 flex items-center">
              <Key size={20} className="mr-2 text-primary" />
              Security
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Click below to receive a password reset link to your registered email address.
              </p>
              <button 
                type="submit"
                className="px-6 py-2 bg-secondary text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
