import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Handshake, MessageSquare, User, LayoutDashboard } from 'lucide-react';
import { useSelector } from 'react-redux';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  const isSeeker = user?.role === 'seeker';

  const navItems = isSeeker 
    ? [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Partners', path: '/partners', icon: Handshake },
        { label: 'Chat', path: '/chat', icon: MessageSquare },
        { label: 'Profile', path: '/profile', icon: User },
      ]
    : [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Chat', path: '/chat', icon: MessageSquare },
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Profile', path: '/profile', icon: User },
      ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 pb-safe bg-white border-t border-border-light z-50 rounded-t-[1.5rem] shadow-[0_-4px_30px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-all duration-200 active:scale-90 ${
              isActive 
                ? 'text-brand-secondary bg-brand-secondary/10' 
                : 'text-text-muted hover:bg-brand-background'
            }`}
          >
            <item.icon size={20} fill={isActive ? 'currentColor' : 'none'} />
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-1`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
