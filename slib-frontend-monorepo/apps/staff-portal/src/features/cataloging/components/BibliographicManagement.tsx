import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '@slib/api-client';
import { Library, Plus, Book, Calendar, Search, Edit, Barcode } from 'lucide-react';

interface Record {
  id: number;
  title: string;
  author: string;
  templateId: number;
  createdAt: string;
  createdBy: string;
}

export const BibliographicManagement: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/cataloging/records');
      setRecords(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 text-slate-800 dark:text-slate-100 tracking-tight">
            <Library className="text-primary-500" />
            {t('manage_records')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
            {t('records_desc')}
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/cataloging/create')}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-lg hover:-translate-y-0.5 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all"
        >
          <Plus size={18} />
          {t('create_record')}
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm Nhan đề, Tác giả..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm font-medium placeholder:text-slate-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-900/20">
                <tr className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="p-5 font-bold border-b border-slate-100 dark:border-slate-800/60">ID</th>
                  <th className="p-5 font-bold border-b border-slate-100 dark:border-slate-800/60">{t('record_title')}</th>
                  <th className="p-5 font-bold border-b border-slate-100 dark:border-slate-800/60">{t('record_author')}</th>
                  <th className="p-5 font-bold border-b border-slate-100 dark:border-slate-800/60">{t('created_date')}</th>
                  <th className="p-5 font-bold text-right border-b border-slate-100 dark:border-slate-800/60">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-5 font-mono text-xs text-slate-400 font-medium">#{record.id}</td>
                    <td className="p-5 font-bold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
                          <Book size={16} />
                        </div>
                        {record.title || '(No Title)'}
                      </div>
                    </td>
                    <td className="p-5 font-medium">{record.author || 'N/A'}</td>
                    <td className="p-5 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/admin/cataloging/items/${record.id}`)}
                          className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 shadow-sm rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                          title="Đăng ký cá biệt (Items)"
                        >
                          <Barcode size={14} />
                          Items
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500">
                      Chưa có biểu ghi nào. Hãy tạo một Biểu ghi mới!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
