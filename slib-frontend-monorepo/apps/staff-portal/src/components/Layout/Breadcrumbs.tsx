import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Simple dictionary for Breadcrumbs (Can be translated via i18n later)
  const breadcrumbNameMap: Record<string, string> = {
    'admin': 'Quản trị',
    'cataloging': 'Biên mục',
    'records': 'Quản lý biểu ghi',
    'create': 'Biên mục mới',
    'edit': 'Chỉnh sửa',
    'items': 'Đăng ký cá biệt',
    'circulation': 'Lưu thông',
    'borrow-return': 'Mượn/Trả nhanh',
    'patrons': 'Quản lý Bạn đọc',
    'loans': 'Tra cứu mượn trả',
    'renew': 'Gia hạn',
    'fines': 'Quản lý Tiền phạt',
    'acquisition': 'Bổ sung',
    'vendors': 'Nhà cung cấp',
    'funds': 'Quỹ ngân sách',
    'purchase-orders': 'Đơn đặt hàng',
    'users': 'Người dùng',
    'policies': 'Tham số hệ thống',
    'marc-templates': 'Mẫu MARC 21'
  };

  return (
    <div className="px-6 md:px-8 py-3 bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center text-sm">
      <Link to="/" className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1">
        <Home size={14} />
      </Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const name = breadcrumbNameMap[value] || value;

        return (
          <React.Fragment key={to}>
            <ChevronRight size={14} className="mx-2 text-slate-400" />
            {last ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200" aria-current="page">
                {name}
              </span>
            ) : (
              <Link to={to} className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
