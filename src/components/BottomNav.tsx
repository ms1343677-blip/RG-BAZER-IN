import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, ShoppingBag, Key, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Orders', path: '/my-orders', icon: ShoppingBag },
    { name: 'Wallet', path: '/add-money', icon: Wallet },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-2 z-50 shadow-sm">
      <div className="max-w-md w-full mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center space-y-1 flex-1 transition-all duration-300 ${
                isActive ? 'text-[#006a4e]' : 'text-gray-400'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold text-center leading-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
