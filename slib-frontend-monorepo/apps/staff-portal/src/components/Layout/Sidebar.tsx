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
  Barcode,
  ScanLine,
  History,
  RotateCw,
  CreditCard,
  Printer,
  Database,
  FileUp,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { t } = useTranslation();
  const { isAdmin, isLibrarian } = useAuth();

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium ${
      isActive 
        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
    } ${isCollapsed ? 'justify-center' : ''}`;

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-all duration-300 z-20`}>
      <div className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
        <div className={`flex items-center gap-2 text-xl font-extrabold text-slate-800 dark:text-white tracking-tight ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0">
            S
          </div>
          {!isCollapsed && <span>SLIB Portal</span>}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar overflow-x-hidden">
        
        {!isCollapsed ? (
          <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap overflow-hidden">
            Tổng quan
          </div>
        ) : (
          <div className="mb-2 h-4" /> // spacing
        )}
        <ul className="space-y-1 px-3 mb-8">
          <li>
            <NavLink to="/" end className={getNavLinkClass} title={t('dashboard')}>
              <LayoutDashboard size={18} className="flex-shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{t('dashboard')}</span>}
            </NavLink>
          </li>
        </ul>

        {isLibrarian && (
          <>
            {!isCollapsed ? (
              <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap overflow-hidden">
                Lưu Thông
              </div>
            ) : <div className="mb-2 h-4 border-t border-slate-200 dark:border-slate-800/50 mx-4" />}
            <ul className="space-y-1 px-3 mb-8">
              <li>
                <NavLink to="/admin/circulation/borrow-return" className={getNavLinkClass} title={t('borrow_return', 'Mượn/Trả nhanh')}>
                  <ScanLine size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('borrow_return', 'Mượn/Trả nhanh')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/circulation/patrons" className={getNavLinkClass} title={t('patron_management', 'Bạn đọc')}>
                  <Users size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('patron_management', 'Bạn đọc')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/circulation/loans" className={getNavLinkClass} title={t('loan_history', 'Tra cứu mượn trả')}>
                  <History size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('loan_history', 'Tra cứu mượn trả')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/circulation/renew" className={getNavLinkClass} title={t('renew_management', 'Gia hạn')}>
                  <RotateCw size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('renew_management', 'Gia hạn')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/circulation/fines" className={getNavLinkClass} title={t('fine_management', 'Tiền phạt')}>
                  <CreditCard size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('fine_management', 'Tiền phạt')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/policies" className={getNavLinkClass} title={t('circulation_params', 'Tham số')}>
                  <Settings size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('circulation_params', 'Tham số')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/circulation/course-reserves" className={getNavLinkClass} title="Tài liệu dự khóa">
                  <BookPlus size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">Tài liệu dự khóa</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/circulation/ill" className={getNavLinkClass} title="Mượn liên thư viện (ILL)">
                  <Truck size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">Mượn liên thư viện</span>}
                </NavLink>
              </li>
            </ul>

            {!isCollapsed ? (
              <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap overflow-hidden">
                Biên Mục
              </div>
            ) : <div className="mb-2 h-4 border-t border-slate-200 dark:border-slate-800/50 mx-4" />}
            <ul className="space-y-1 px-3 mb-8">
              <li>
                <NavLink to="/admin/cataloging/records" className={getNavLinkClass} title={t('manage_records', 'Quản lý Biểu ghi')}>
                  <Library size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('manage_records', 'Quản lý Biểu ghi')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/cataloging/create" className={getNavLinkClass} title={t('create_record', 'Biên mục mới')}>
                  <BookPlus size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('create_record', 'Biên mục mới')}</span>}
                </NavLink>
              </li>
            </ul>

            {!isCollapsed ? (
              <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap overflow-hidden">
                {t('digital_assets_group', 'Tài liệu số')}
              </div>
            ) : <div className="mb-2 h-4 border-t border-slate-200 dark:border-slate-800/50 mx-4" />}
            <ul className="space-y-1 px-3 mb-8">
              <li>
                <NavLink to="/admin/dam/assets" className={getNavLinkClass} title={t('digital_assets_list', 'Quản lý Tài liệu số')}>
                  <HardDrive size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('digital_assets_list', 'Quản lý Tài liệu số')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/dam/register" className={getNavLinkClass} title={t('digital_assets_upload', 'Đăng tải Tài liệu')}>
                  <FileUp size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('digital_assets_upload', 'Đăng tải Tài liệu')}</span>}
                </NavLink>
              </li>
            </ul>

            {!isCollapsed ? (
              <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap overflow-hidden">
                Bổ Sung
              </div>
            ) : <div className="mb-2 h-4 border-t border-slate-200 dark:border-slate-800/50 mx-4" />}
            <ul className="space-y-1 px-3 mb-8">
              <li>
                <NavLink to="/admin/vendors" className={getNavLinkClass} title={t('vendors')}>
                  <Truck size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('vendors')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/funds" className={getNavLinkClass} title={t('funds')}>
                  <Wallet size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('funds')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/purchase-orders" className={getNavLinkClass} title={t('purchase_orders')}>
                  <ShoppingCart size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('purchase_orders')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/acquisition/serials" className={getNavLinkClass} title="Ấn phẩm định kỳ">
                  <Library size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">Ấn phẩm định kỳ</span>}
                </NavLink>
              </li>
            </ul>

            {!isCollapsed ? (
              <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap overflow-hidden">
                Kho & Kiểm kê
              </div>
            ) : <div className="mb-2 h-4 border-t border-slate-200 dark:border-slate-800/50 mx-4" />}
            <ul className="space-y-1 px-3 mb-8">
              <li>
                <NavLink to="/admin/inventory/stocktake" className={getNavLinkClass} title="Kiểm kê kho (RFID)">
                  <Barcode size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">Kiểm kê kho (RFID)</span>}
                </NavLink>
              </li>
            </ul>
          </>
        )}

        {isAdmin && (
          <>
            {!isCollapsed ? (
              <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap overflow-hidden">
                Quản trị Hệ thống
              </div>
            ) : <div className="mb-2 h-4 border-t border-slate-200 dark:border-slate-800/50 mx-4" />}
            <ul className="space-y-1 px-3 mb-8">
              <li>
                <NavLink to="/admin/users" className={getNavLinkClass} title={t('user_management')}>
                  <Users size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('user_management')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/policies" className={getNavLinkClass} title={t('system_policies')}>
                  <Settings size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('system_policies')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/marc-templates" className={getNavLinkClass} title={t('marc_templates')}>
                  <BookPlus size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('marc_templates')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/templates" className={getNavLinkClass} title="Mẫu Thông báo & Nhãn">
                  <Printer size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">Mẫu Thông báo & Nhãn</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/dam" className={getNavLinkClass} title={t('dam_config_title', 'Cấu hình DAM & DRM')}>
                  <Database size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{t('dam_config_title', 'Cấu hình DAM & DRM')}</span>}
                </NavLink>
              </li>
            </ul>
          </>
        )}
      </nav>
      
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-center text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
          &copy; 2026 SLIB System
        </div>
      )}
    </aside>
  );
};
