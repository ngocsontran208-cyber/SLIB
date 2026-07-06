import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@slib/api-client';
import { Truck, Plus, Mail, Hash, User as UserIcon } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  code: string;
  email: string;
  contactPerson: string;
  isActive: boolean;
}

export const VendorManagement: React.FC = () => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/api/vendor');
      setVendors(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Truck className="text-primary-500" />
            {t('vendors')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('vendor_desc')}
          </p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
          <Plus size={18} />
          {t('add_vendor')}
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading vendors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map(vendor => (
            <div key={vendor.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{vendor.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${vendor.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {vendor.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-slate-400" />
                  <span>{vendor.code}</span>
                </div>
                {vendor.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-slate-400" />
                    <span>{vendor.email}</span>
                  </div>
                )}
                {vendor.contactPerson && (
                  <div className="flex items-center gap-2">
                    <UserIcon size={16} className="text-slate-400" />
                    <span>{vendor.contactPerson}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {vendors.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <Truck size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Chưa có nhà cung cấp nào.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
