import React, { useState } from 'react';
import { UserProfile } from '../../../types';
import { Search, Edit2, X, Save } from 'lucide-react';

interface Props {
  users: UserProfile[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleUserRole: (userId: string, currentRole: string) => void;
  updateUserBalance: (userId: string, newBalance: number) => void;
}

const UserManagement: React.FC<Props> = ({ users, searchTerm, setSearchTerm, toggleUserRole, updateUserBalance }) => {
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newBalance, setNewBalance] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setNewBalance(user.balance.toString());
    setNewPassword('');
  };

  const handleSaveBalance = () => {
    if (editingUser && newBalance !== '') {
      updateUserBalance(editingUser.uid, parseFloat(newBalance));
      // In a real app, we'd use a cloud function to update the password in Firebase Auth.
      // For now, we'll just log it or store it if the user profile has a password field.
      setEditingUser(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg text-xs font-bold">
            {users.length} Total
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-sm" 
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Country</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Balance</th>
              <th className="px-6 py-4">Joined At</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.filter(u => 
              (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
              (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (u.supportId?.toString() || '').includes(searchTerm)
            ).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400 font-medium">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              users.filter(u => 
                (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.supportId?.toString() || '').includes(searchTerm)
              ).map((u, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                      #{u.supportId || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {u.name ? u.name[0].toUpperCase() : (u.email ? u.email[0].toUpperCase() : '?')}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{u.name || 'No Name'}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-600">{u.country || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">৳{(u.balance || 0).toFixed(2)}</span>
                      <button 
                        onClick={() => handleEdit(u)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleUserRole(u.uid, u.role)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-xs underline"
                    >
                      Make {u.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Balance Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingUser(null)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">Edit User Balance</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">User</p>
                <p className="font-bold text-gray-900">{editingUser.name || editingUser.email}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Balance (৳)</label>
                <input 
                  type="number" 
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all font-bold text-lg"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all font-bold"
                  placeholder="Enter new password"
                />
                <p className="text-[10px] text-gray-400 font-medium">* Note: Password change functionality is for display/logging in this demo.</p>
              </div>

              <button 
                onClick={handleSaveBalance}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                <Save size={18} />
                <span>Save Balance</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
