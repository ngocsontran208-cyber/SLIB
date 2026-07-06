import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@slib/api-client';
import { ShoppingCart, Plus, Calendar, Tag, Truck } from 'lucide-react';

interface PurchaseOrder {
  id: number;
  poNumber: string;
  vendorId: number;
  vendor?: { name: string };
  orderType: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

export const PurchaseOrderManagement: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/acquisition/purchase-orders');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'closed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <ShoppingCart className="text-primary-500" />
            {t('purchase_orders')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('po_desc')}
          </p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
          <Plus size={18} />
          {t('add_po')}
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading purchase orders...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">{t('po_number')}</th>
                  <th className="p-4 font-bold">{t('vendor_name')}</th>
                  <th className="p-4 font-bold">{t('order_type')}</th>
                  <th className="p-4 font-bold">{t('created_date')}</th>
                  <th className="p-4 font-bold">{t('po_status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {orders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-primary-600 dark:text-primary-400">
                      {po.poNumber}
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <Truck size={16} className="text-slate-400" />
                      {po.vendor?.name || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-sm">
                        <Tag size={14} className="text-slate-400" />
                        {po.orderType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(po.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Chưa có đơn đặt hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
