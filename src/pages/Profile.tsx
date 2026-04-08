import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { RefreshCw, ShieldCheck, LogOut, Wallet, ShoppingBag, Key, User as UserIcon } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const stats = [
    { label: 'Support Pin', value: profile?.supportPin || '0000', icon: ShieldCheck },
    { label: 'Weekly Spent', value: `${profile?.totalSpent || 0} ৳`, icon: RefreshCw },
    { label: 'Total Spent', value: profile?.totalSpent || 0, icon: ShoppingBag },
    { label: 'Total Order', value: profile?.totalOrders || 0, icon: ShoppingBag },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="px-4 py-8 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
          <img 
            src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
            alt="Profile" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Hi, {profile?.name || user.displayName}</h2>
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-sm font-medium text-gray-600">Available Balance : <span className="text-green-600 font-bold">{profile?.balance?.toFixed(2) || '0.00'} Tk</span></span>
          <button className="text-gray-400 hover:text-green-600 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="px-4 grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <span className="text-green-600 font-bold text-lg mb-1">{stat.value}</span>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center space-x-2">
            <ShoppingBag size={18} className="text-gray-400" />
            <span className="font-bold text-gray-700">Account Information</span>
          </div>
          <div className="p-6 flex flex-col items-center">
            <div className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold text-lg mb-4">
              {profile?.balance?.toFixed(2) || '0.00'}৳
            </div>
            <h3 className="text-xl font-black text-gray-900">Available Balance</h3>
            
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mt-6">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center space-x-2">
            <UserIcon size={18} className="text-gray-400" />
            <span className="font-bold text-gray-700">User Information</span>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-sm"><span className="font-bold">Email :</span> {user.email}</p>
            <p className="text-sm"><span className="font-bold">Phone :</span> {profile?.phone || 'Not set'}</p>
            <p className="text-sm"><span className="font-bold">Country :</span> {profile?.country || 'Bangladesh'}</p>
            <p className="text-sm"><span className="font-bold">Joined :</span> {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
