import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { LogIn, User as UserIcon, Menu, X, Home, ShoppingBag, Key, CreditCard, Wallet, Info, LogOut, PhoneCall, UserCircle, ShieldCheck } from 'lucide-react';

const Header: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    setIsDrawerOpen(false);
    navigate('/');
  };

  const menuItems = [
    { name: 'My Account', path: '/profile', icon: UserCircle },
    { name: 'My Orders', path: '/my-orders', icon: ShoppingBag },
    { name: 'My Codes', path: '/my-codes', icon: Key },
    { name: 'Add Money', path: '/add-money', icon: Wallet },
    { name: 'Statements', path: '/statements', icon: CreditCard },
    { name: 'Contact Us', path: '/contact', icon: Info },
  ];

  return (
    <>
      <header className="bg-white sticky top-0 z-40 px-4 py-3 flex justify-between items-center border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto w-full flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="flex flex-col -space-y-1">
              <span className="text-2xl font-black text-gray-900 tracking-tighter leading-none">RGBazer</span>
              <span className="text-[10px] font-black text-[#006a4e] tracking-[0.2em] uppercase leading-none">Gaming Store</span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link to="/add-money" className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full flex items-center space-x-2 hover:bg-gray-100">
                  <Wallet size={14} className="text-[#006a4e]" />
                  <span className="text-gray-900 font-bold text-xs">
                    ৳{profile?.balance?.toFixed(0) || '0'}
                  </span>
                </Link>
                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 shadow-sm"
                >
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`} 
                    alt="User" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-[#006a4e] text-white px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#005a42]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="absolute top-0 right-0 w-72 h-full bg-white shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                  {user?.displayName?.substring(0, 1).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{user?.displayName}</h3>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-600 py-2 rounded-full font-bold text-sm flex items-center justify-center space-x-2 hover:bg-red-100"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center space-x-4 px-6 py-4 text-gray-700 hover:bg-gray-50"
                >
                  <item.icon size={20} className="text-gray-400" />
                  <span className="font-bold text-sm">{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100">
              <button className="w-full bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2">
                <PhoneCall size={18} />
                <span>Support</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

