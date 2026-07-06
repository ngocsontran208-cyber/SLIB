import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Library, 
  Settings, 
  ShoppingCart, 
  BookOpen, 
  Truck, 
  Wallet, 
  UserCheck, 
  Repeat
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin, isLibrarian } = useAuth();

  const modules = [
    {
      id: 'circulation',
      title: 'Mượn / Trả',
      description: 'Quản lý mượn trả, gia hạn tài liệu.',
      icon: <Repeat size={40} className="text-emerald-500" />,
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-200 dark:border-emerald-500/20',
      path: '/',
      roles: ['Admin', 'Librarian']
    },
    {
      id: 'patrons',
      title: 'Bạn đọc',
      description: 'Quản lý hồ sơ, thẻ bạn đọc.',
      icon: <UserCheck size={40} className="text-blue-500" />,
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-500/20',
      path: '/',
      roles: ['Admin', 'Librarian']
    },
    {
      id: 'cataloging',
      title: 'Biên mục',
      description: 'Quản lý biểu ghi MARC 21, đăng ký cá biệt.',
      icon: <Library size={40} className="text-purple-500" />,
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      border: 'border-purple-200 dark:border-purple-500/20',
      path: '/admin/cataloging/records',
      roles: ['Admin', 'Librarian']
    },
    {
      id: 'acquisitions',
      title: 'Bổ sung',
      description: 'Nhà cung cấp, Đơn hàng, Quản lý quỹ.',
      icon: <ShoppingCart size={40} className="text-orange-500" />,
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      border: 'border-orange-200 dark:border-orange-500/20',
      path: '/admin/vendors',
      roles: ['Admin', 'Librarian']
    },
    {
      id: 'reports',
      title: 'Báo cáo',
      description: 'Thống kê hoạt động, xuất file.',
      icon: <BookOpen size={40} className="text-pink-500" />,
      bg: 'bg-pink-50 dark:bg-pink-500/10',
      border: 'border-pink-200 dark:border-pink-500/20',
      path: '/',
      roles: ['Admin', 'Librarian']
    },
    {
      id: 'admin',
      title: 'Quản trị hệ thống',
      description: 'Phân quyền, cấu hình hệ thống, mẫu MARC.',
      icon: <Settings size={40} className="text-slate-500" />,
      bg: 'bg-slate-100 dark:bg-slate-500/10',
      border: 'border-slate-200 dark:border-slate-500/20',
      path: '/admin/users',
      roles: ['Admin']
    }
  ];

  const visibleModules = modules.filter(m => 
    m.roles.includes('Admin') && isAdmin || m.roles.includes('Librarian') && (isAdmin || isLibrarian)
  );

  return (
    <div className="space-y-10 py-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          Hệ thống Thư viện Đại học (SLIB)
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
          Chào mừng trở lại! Vui lòng chọn một phân hệ bên dưới để bắt đầu phiên làm việc.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {visibleModules.map((module) => (
          <button
            key={module.id}
            onClick={() => navigate(module.path)}
            className={`glass-card p-8 rounded-3xl flex flex-col items-center text-center gap-5 group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:${module.border}`}
          >
            <div className={`w-24 h-24 rounded-2xl ${module.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
              {module.icon}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-2">
                {module.title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {module.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
