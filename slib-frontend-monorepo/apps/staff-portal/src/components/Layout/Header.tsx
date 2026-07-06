import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, User, Library, Users, ShoppingCart, Settings, LayoutDashboard } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, logout, isAdmin, isLibrarian } = useAuth();
  const { t } = useTranslation();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive
        ? 'bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
    }`;

  return (
    <header className="sticky top-0 z-30 glass border-b border-white/20 dark:border-slate-800/50 shadow-sm transition-colors">
      <div className="flex items-center justify-between h-16 px-6">
        
        {/* Left Side: Logo & Main Navigation */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md font-bold text-lg">
              S
            </div>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight hidden sm:block">
              SLIB
            </span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navLinkClass} end>
              <LayoutDashboard size={18} />
              Trang chủ
            </NavLink>
            
            {(isAdmin || isLibrarian) && (
              <>
                <NavLink to="/admin/cataloging/records" className={navLinkClass}>
                  <Library size={18} />
                  Biên mục
                </NavLink>
                <NavLink to="/admin/vendors" className={navLinkClass}>
                  <ShoppingCart size={18} />
                  Bổ sung
                </NavLink>
              </>
            )}

            {isAdmin && (
              <NavLink to="/admin/users" className={navLinkClass}>
                <Settings size={18} />
                Quản trị
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right Side: Tools & Profile */}
        <div className="flex items-center gap-5">
          <ThemeSwitcher />
          <LanguageSwitcher />
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700/50"></div>

          {user && (
            <div className="flex items-center gap-4 group cursor-pointer relative z-40">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {user.email || user.username}
                </div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400 mt-0.5">
                  {user.role}
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
