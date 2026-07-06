import React, { useState } from 'react';
import { Users, Search, Filter, MoreVertical, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PatronManagement: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for Patron list (Role = Student)
  const patrons = [
    { id: 1, studentId: 'SV2023001', name: 'Nguyễn Văn A', email: 'nva@univ.edu.vn', activeLoans: 2, fines: 0, status: 'Active' },
    { id: 2, studentId: 'SV2023002', name: 'Trần Thị B', email: 'ttb@univ.edu.vn', activeLoans: 5, fines: 50000, status: 'Active' },
    { id: 3, studentId: 'SV2023003', name: 'Lê Hoàng C', email: 'lhc@univ.edu.vn', activeLoans: 0, fines: 0, status: 'Locked' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Users className="text-primary-500" />
            {t('patron_management')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('patron_desc')}
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2">
          Đăng ký bạn đọc mới
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Tìm theo mã sinh viên, tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800">Mã Thẻ (ID)</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800">Họ và Tên</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800">Email</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800 text-center">Đang mượn</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800 text-right">Tiền nợ đọng</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800 text-center">Trạng thái</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {patrons.map(patron => (
                <tr key={patron.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono text-slate-700 dark:text-slate-300 font-medium">{patron.studentId}</td>
                  <td className="p-4 font-medium">{patron.name}</td>
                  <td className="p-4 text-slate-500">{patron.email}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 font-bold text-xs">
                      {patron.activeLoans}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-medium ${patron.fines > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {patron.fines.toLocaleString()}đ
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      patron.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {patron.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
          <span>Hiển thị 1-3 trong số 3 kết quả</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 disabled:opacity-50" disabled>Trước</button>
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium">1</button>
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 disabled:opacity-50" disabled>Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
};
