import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@slib/api-client';
import { Barcode, ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface PhysicalItem {
  id: number;
  barcode: string;
  status: string;
}

interface RecordDetail {
  id: number;
  title: string;
  author: string;
  createdAt: string;
}

export const ItemRegistration: React.FC = () => {
  const { t } = useTranslation();
  const { recordId } = useParams();
  const navigate = useNavigate();
  
  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [items, setItems] = useState<PhysicalItem[]>([]);
  const [newBarcode, setNewBarcode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (recordId) {
      fetchData();
    }
  }, [recordId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy chi tiết biểu ghi
      const recordRes = await api.get(`/api/cataloging/records/${recordId}`);
      setRecord(recordRes.data);
      
      // Lấy danh sách items
      const itemsRes = await api.get(`/api/items/record/${recordId}`);
      setItems(itemsRes.data);
    } catch (error) {
      console.error(error);
      alert("Không thể tải dữ liệu Biểu ghi.");
      navigate('/admin/cataloging/records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarcode.trim()) return;

    try {
      const payload = {
        bibliographicRecordId: Number(recordId),
        barcode: newBarcode.trim()
      };
      await api.post('/api/items', payload);
      setNewBarcode('');
      // Tải lại danh sách
      const itemsRes = await api.get(`/api/items/record/${recordId}`);
      setItems(itemsRes.data);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data || "Lỗi khi thêm Đăng ký cá biệt. Có thể mã vạch đã bị trùng.");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài liệu này?")) return;
    try {
      await api.delete(`/api/items/${itemId}`);
      setItems(items.filter(i => i.id !== itemId));
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data || "Không thể xóa tài liệu này (có thể do đang có người mượn).");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/cataloging/records')}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Barcode className="text-primary-500" />
            {t('register_items')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t('register_items_desc')}</p>
        </div>
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-xl p-5">
        <h3 className="font-bold text-lg text-primary-900 dark:text-primary-100 mb-2">{record?.title}</h3>
        <div className="text-primary-700 dark:text-primary-400 text-sm flex gap-4">
          <span><strong>Tác giả:</strong> {record?.author || 'N/A'}</span>
          <span><strong>ID Biểu ghi:</strong> #{record?.id}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <form onSubmit={handleAddItem} className="flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Nhập Mã vạch (Barcode) / Số đăng ký cá biệt..." 
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-primary-500 transition-colors"
                value={newBarcode}
                onChange={e => setNewBarcode(e.target.value)}
                autoFocus
              />
            </div>
            <button 
              type="submit"
              disabled={!newBarcode.trim()}
              className="bg-primary-600 disabled:opacity-50 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              {t('add_item')}
            </button>
          </form>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
              <th className="p-4 font-bold w-16 text-center">STT</th>
              <th className="p-4 font-bold">{t('barcode')}</th>
              <th className="p-4 font-bold">{t('item_status')}</th>
              <th className="p-4 font-bold w-24 text-center">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {items.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 text-center text-slate-400">{index + 1}</td>
                <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                  {item.barcode}
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded w-max">
                    <CheckCircle2 size={14} />
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-500">
                  Chưa có bản sao vật lý nào. Nhập mã vạch bên trên để thêm!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
