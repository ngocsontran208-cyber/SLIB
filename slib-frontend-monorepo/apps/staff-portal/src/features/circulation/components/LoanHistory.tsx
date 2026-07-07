import React, { useState } from 'react';
import { History, Search, Filter, RotateCw, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@slib/ui-core';

export const LoanHistory: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loans, setLoans] = useState([
    { id: 101, patronId: 'SV2023001', patronName: 'Nguyễn Văn A', barcode: 'B00123', title: 'Clean Code', borrowDate: '01/10/2023', dueDate: '15/10/2023', status: 'Borrowed' },
    { id: 102, patronId: 'SV2023002', patronName: 'Trần Thị B', barcode: 'B00456', title: 'Design Patterns', borrowDate: '01/09/2023', dueDate: '15/09/2023', status: 'Overdue' },
    { id: 103, patronId: 'SV2023001', patronName: 'Nguyễn Văn A', barcode: 'B00789', title: 'Refactoring', borrowDate: '20/09/2023', dueDate: '05/10/2023', status: 'Returned' },
  ]);

  const handleRenew = (loanId: number) => {
    // Mock renew action
    setLoans(prev => prev.map(loan => {
      if (loan.id === loanId) {
        return { ...loan, dueDate: '30/10/2023', status: 'Borrowed' }; // Renew extends due date
      }
      return loan;
    }));
    toast({ title: "Thành công", description: `Đã gia hạn thành công giao dịch mượn ${loanId}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <History className="text-blue-500" />
            {t('loan_history')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Tra cứu và quản lý lịch sử mượn trả toàn hệ thống. Hỗ trợ tính năng gia hạn nhanh.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Tìm theo Barcode, ID SV, Tên SV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <select className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none">
              <option value="all">Tất cả trạng thái</option>
              <option value="borrowed">Đang mượn</option>
              <option value="overdue">Quá hạn</option>
              <option value="returned">Đã trả</option>
            </select>
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800">Giao dịch</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800">Bạn Đọc</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800">Tài Liệu (Barcode)</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800">Ngày Mượn</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800">Hạn Trả</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800 text-center">Trạng Thái</th>
                <th className="p-4 font-semibold border-b border-slate-200 dark:border-slate-800 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {loans.map(loan => (
                <tr key={loan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono text-slate-400">#{loan.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{loan.patronName}</div>
                    <div className="text-xs text-slate-500">{loan.patronId}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-blue-600 dark:text-blue-400">{loan.title}</div>
                    <div className="text-xs font-mono text-slate-500">{loan.barcode}</div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{loan.borrowDate}</td>
                  <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{loan.dueDate}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      loan.status === 'Borrowed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                      loan.status === 'Overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {(loan.status === 'Borrowed' || loan.status === 'Overdue') ? (
                      <button 
                        onClick={() => handleRenew(loan.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-400 rounded font-medium transition-colors"
                        title="Gia hạn"
                      >
                        <RotateCw size={14} /> Gia hạn
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-500 font-medium text-xs">
                        <CheckCircle size={14} /> Hoàn tất
                      </span>
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
