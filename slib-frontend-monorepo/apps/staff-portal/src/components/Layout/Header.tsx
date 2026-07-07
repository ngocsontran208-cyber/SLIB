import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, User, Menu, Search } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement global search logic later
      console.log('Global Search:', searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 shadow-sm transition-colors h-16 flex-shrink-0">
      <div className="flex items-center justify-between h-full px-4 md:px-6 gap-4">
        
        {/* Left Side: Toggle & Global Search */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={toggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Đóng/Mở Sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Global Search */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center relative w-full max-w-md">
            <Search size={18} className="absolute left-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tra cứu toàn cục (Mã vạch, Tên sách, Độc giả)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
          </form>
        </div>

        {/* Right Side: Tools & Profile */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <NotificationBell />
          <ThemeSwitcher />
          <LanguageSwitcher />
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700/50 hidden sm:block"></div>

          {user && (
            <div className="flex items-center gap-3 group cursor-pointer relative z-40">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {user.email}
                </div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400 mt-0.5">
                  {user.roles?.[0] || 'User'}
                </div>
              </div>
              
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
                  <User size={18} />
                </div>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right z-50">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-black/5 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 p-2">
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      {t('logout', 'Đăng xuất')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
