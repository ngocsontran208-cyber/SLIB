import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  Settings,
  Truck,
  Wallet,
  ShoppingCart,
  Library,
  BookPlus,
  Barcode
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { isAdmin, isLibrarian } = useAuth();

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium ${
      isActive 
        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
    }`;

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-colors">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md">
            S
          </div>
          <span>SLIB Portal</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        
        <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Tổng quan
        </div>
        <ul className="space-y-1 px-3 mb-8">
          <li>
            <NavLink to="/" end className={getNavLinkClass}>
              <LayoutDashboard size={18} />
              <span>{t('dashboard')}</span>
            </NavLink>
          </li>
        </ul>

        {(isAdmin || isLibrarian) && (
          <>
            <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Biên Mục
            </div>
            <ul className="space-y-1 px-3 mb-8">
              <li>
                <NavLink to="/admin/cataloging/records" className={getNavLinkClass}>
                  <Library size={18} />
                  <span>{t('manage_records', 'Quản lý Biểu ghi')}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/cataloging/create" className={getNavLinkClass}>
                  <BookPlus size={18} />
                  <span>{t('create_record', 'Biên mục mới')}</span>
                </NavLink>
              </li>
            </ul>

            <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Bổ Sung
            </div>
            <ul className="space-y-1 px-3 mb-8">
              <li>
                <NavLink to="/admin/vendors" className={getNavLinkClass}>
                  <Truck size={18} />
                  <span>{t('vendors')}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/funds" className={getNavLinkClass}>
                  <Wallet size={18} />
                  <span>{t('funds')}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/purchase-orders" className={getNavLinkClass}>
                  <ShoppingCart size={18} />
                  <span>{t('purchase_orders')}</span>
                </NavLink>
              </li>
            </ul>
          </>
        )}

        {isAdmin && (
          <>
            <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Quản trị Hệ thống
            </div>
            <ul className="space-y-1 px-3 mb-8">
              <li>
                <NavLink to="/admin/users" className={getNavLinkClass}>
                  <Users size={18} />
                  <span>{t('user_management')}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/policies" className={getNavLinkClass}>
                  <Settings size={18} />
                  <span>{t('system_policies')}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/marc-templates" className={getNavLinkClass}>
                  <BookPlus size={18} />
                  <span>{t('marc_templates')}</span>
                </NavLink>
              </li>
            </ul>
          </>
        )}
      </nav>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-center text-slate-400 dark:text-slate-500 font-medium">
        &copy; 2026 SLIB System
      </div>
    </aside>
  );
};
