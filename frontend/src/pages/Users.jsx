import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users as UsersIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  UserPlus, 
  Check, 
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal control states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CASHIER');
  const [isActive, setIsActive] = useState(true);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/');
      setUsers(response.data.results || response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Unable to load system accounts list. Permissions restricted.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    setFormError(null);
    if (user) {
      setSelectedUser(user);
      setUsername(user.username);
      setEmail(user.email || '');
      setPassword(''); // Password optional on update
      setRole(user.role);
      setIsActive(user.is_active);
    } else {
      setSelectedUser(null);
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('CASHIER');
      setIsActive(true);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('CASHIER');
    setIsActive(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setFormError('Username is required');
      return;
    }
    if (!selectedUser && !password) {
      setFormError('Password is required for new accounts');
      return;
    }
    setFormLoading(true);
    setFormError(null);

    const payload = {
      username: username.trim(),
      email: email.trim(),
      role,
      is_active: isActive
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser.id}/`, payload);
      } else {
        await api.post('/users/', payload);
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      console.error("Save user account failed:", err);
      const backendMsg = err.response?.data?.username || err.response?.data?.detail || "Failed to save user details. Verify username is unique.";
      setFormError(Array.isArray(backendMsg) ? backendMsg[0] : backendMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      await api.delete(`/users/${id}/`);
      fetchUsers();
    } catch (err) {
      console.error("Delete user failed:", err);
      alert("Failed to delete user account.");
    }
  };

  const handleToggleStatus = async (userRecord) => {
    if (userRecord.id === currentUser.id) {
      alert("You cannot deactivate your own account.");
      return;
    }
    try {
      const updatedStatus = !userRecord.is_active;
      await api.patch(`/users/${userRecord.id}/`, { is_active: updatedStatus });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update user status.");
    }
  };

  const handleRoleToggle = async (userRecord) => {
    if (userRecord.id === currentUser.id) {
      alert("You cannot modify your own roles.");
      return;
    }
    try {
      const newRole = userRecord.role === 'MANAGER' ? 'CASHIER' : 'MANAGER';
      await api.patch(`/users/${userRecord.id}/`, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error("Failed to swap user roles:", err);
      alert("Failed to swap user roles.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UsersIcon className="w-8 h-8 text-indigo-400" /> User Role Management
          </h2>
          <p className="text-slate-400 mt-1">
            Assign user access permissions, swap roles, or toggle cashier account activation
          </p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/10 transition duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Account
        </button>
      </div>

      {/* Main accounts table list */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {users.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Assigned Role</th>
                  <th className="py-4 px-6">Active Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((item) => {
                  const isSelf = item.id === currentUser.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 text-slate-500 font-mono">#{item.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">{item.username}</span>
                          {isSelf && (
                            <span className="text-xxs font-semibold bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{item.email || '-'}</td>
                      <td className="py-4 px-6">
                        <button
                          disabled={isSelf}
                          onClick={() => handleRoleToggle(item)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                            item.role === 'MANAGER' 
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20' 
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={isSelf ? "Can't edit yourself" : "Click to toggle role"}
                        >
                          {item.role === 'MANAGER' ? 'Manager (Full Admin)' : 'Cashier (Limited)'}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          disabled={isSelf}
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            item.is_active 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={isSelf ? "Can't edit yourself" : "Click to toggle status"}
                        >
                          {item.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition inline-flex items-center justify-center cursor-pointer"
                          title="Edit Account Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          disabled={isSelf}
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition inline-flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto flex flex-col items-center">
          <div className="bg-indigo-500/10 p-4 rounded-full border border-indigo-500/20 mb-4">
            <UsersIcon className="w-10 h-10 text-indigo-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-200">No accounts loaded</h4>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            There are no user profiles available on the endpoint.
          </p>
        </div>
      )}

      {/* Edit/Create User Modal Popup */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" /> 
                {selectedUser ? 'Edit User Details' : 'Create User Account'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-200 transition p-1.5 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                  placeholder="e.g. cashier1, manager_john"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                  placeholder="e.g. john@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Password {selectedUser && <span className="text-slate-500 lowercase">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  required={!selectedUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    System Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                  >
                    <option value="CASHIER">CASHIER</option>
                    <option value="MANAGER">MANAGER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Active Status
                  </label>
                  <select
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                  >
                    <option value="true">Enabled (Can Log In)</option>
                    <option value="false">Disabled (Revoked Access)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 mt-6 bg-slate-950/20 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 border border-slate-800 text-slate-400 hover:bg-slate-800 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {selectedUser ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
