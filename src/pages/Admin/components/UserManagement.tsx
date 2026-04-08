import React, { useState } from 'react';
import { UserProfile } from '../../../types';
import { Search, Edit2, X, Save, Users } from 'lucide-react';

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">User Directory</h2>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
              {users.length} Active Accounts
            </span>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 text-sm font-bold" 
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Identity</th>
              <th className="px-8 py-4">Profile</th>
              <th className="px-8 py-4">Region</th>
              <th className="px-8 py-4">Role</th>
              <th className="px-8 py-4">Balance</th>
              <th className="px-8 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.filter(u => 
              (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
              (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (u.supportId?.toString() || '').includes(searchTerm)
            ).map((u, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    ID: {u.supportId || 'N/A'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-blue-600 font-black">
                      {u.name ? u.name[0].toUpperCase() : (u.email ? u.email[0].toUpperCase() : '?')}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{u.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{u.country || 'Global'}</span>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <span className="font-black text-gray-900 text-sm">৳{(u.balance || 0).toFixed(2)}</span>
                    <button 
                      onClick={() => handleEdit(u)}
                      className="p-2 text-gray-300 hover:text-blue-600"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <button 
                    onClick={() => toggleUserRole(u.uid, u.role)}
                    className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                  >
                    Promote to {u.role === 'admin' ? 'User' : 'Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Balance Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingUser(null)}></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative z-10 p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Adjust Wallet</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center space-x-4">
                <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-blue-600 font-black">
                  {editingUser.name ? editingUser.name[0].toUpperCase() : (editingUser.email ? editingUser.email[0].toUpperCase() : '?')}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target User</p>
                  <p className="font-bold text-gray-900">{editingUser.name || editingUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Balance (৳)</label>
                <input 
                  type="number" 
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 font-black text-xl"
                  placeholder="0.00"
                />
              </div>

              <button 
                onClick={handleSaveBalance}
                className="w-full bg-[#006a4e] text-white py-4 rounded-full font-bold uppercase tracking-widest text-[11px] shadow-lg hover:bg-[#005a42]"
              >
                Update Balance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
