import React, { useState } from 'react';
import { Wallet, Search, Filter, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@slib/ui-core';

export const FineManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [fines, setFines] = useState([
    { id: 201, patronId: 'SV2023002', patronName: 'Trần Thị B', amount: 50000, reason: 'Trễ hạn sách Design Patterns (15 ngày)', date: '15/09/2023', status: 'Unpaid' },
    { id: 202, patronId: 'SV2023004', patronName: 'Phạm Văn D', amount: 150000, reason: 'Làm mất sách Mạng máy tính', date: '01/10/2023', status: 'Unpaid' },
    { id: 203, patronId: 'SV2023001', patronName: 'Nguyễn Văn A', amount: 10000, reason: 'Trễ hạn sách Refactoring (2 ngày)', date: '05/10/2023', status: 'Paid' },
  ]);

  const handlePayFine = (fineId: number) => {
    // Mock pay fine action
    setFines(prev => prev.map(fine => {
      if (fine.id === fineId) {
        return { ...fine, status: 'Paid' };
      }
      return fine;
    }));
    toast({ title: "Thành công", description: `Đã thu thành công khoản phạt ${fineId}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Wallet className="text-red-500" />
            {t('fine_management')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Quản lý công nợ, thu tiền phạt và xử lý đền bù của sinh viên.
          </p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="px-4 py-2 border-r border-slate-200 dark:border-slate-800 text-center">
            <div className="text-xs text-slate-500 font-bold uppercase">Tổng nợ cần thu</div>
            <div className="text-lg font-black text-red-600">200,000đ</div>
          </div>
          <div className="px-4 py-2 text-center">
            <div className="text-xs text-slate-500 font-bold uppercase">Đã thu (Tháng này)</div>
            <div className="text-lg font-black text-green-600">10,000đ</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Tìm theo Mã SV, Tên SV..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800">Mã Khoản Phạt</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800">Bạn Đọc</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800">Lý do</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800">Ngày ghi nhận</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800 text-right">Số Tiền (VND)</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800 text-center">Trạng Thái</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {fines.map(fine => (
                <tr key={fine.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono text-slate-400">#{fine.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{fine.patronName}</div>
                    <div className="text-xs text-slate-500">{fine.patronId}</div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{fine.reason}</td>
                  <td className="p-4 text-slate-500">{fine.date}</td>
                  <td className="p-4 text-right font-black text-slate-700 dark:text-slate-200">
                    {fine.amount.toLocaleString()}đ
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      fine.status === 'Unpaid' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {fine.status === 'Unpaid' ? 'Chưa Thu' : 'Đã Thu'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {fine.status === 'Unpaid' ? (
                      <button 
                        onClick={() => handlePayFine(fine.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow transition-colors"
                      >
                        <CreditCard size={16} /> Thu tiền
                      </button>
                    ) : (
                      <span className="text-slate-400 text-sm">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
