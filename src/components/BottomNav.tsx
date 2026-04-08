import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, ShoppingBag, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Orders', path: '/my-orders', icon: ShoppingBag },
    { name: 'Wallet', path: '/add-money', icon: Wallet },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-4 z-50 shadow-lg">
      <div className="w-full max-w-screen-xl mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center space-y-1 flex-1 ${
                isActive ? 'text-[#006a4e]' : 'text-gray-400'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold uppercase tracking-tight text-center leading-tight`}>
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
