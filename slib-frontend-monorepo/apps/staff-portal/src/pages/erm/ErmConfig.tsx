import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@slib/api-client';
import { Plus, Trash2, Edit, BookOpen } from 'lucide-react';

import { useToast } from '@slib/ui-core';

interface Vendor {
  id: number;
  name: string;
}

interface License {
  id: number;
  vendorId: number;
  vendorName: string;
  resourceName: string;
  cost: number;
  concurrentUsers: number;
  validFrom: string;
  validTo: string;
  sushiApiUrl: string | null;
  sushiApiKey: string | null;
  requestorId: string | null;
}

export const ErmConfig: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    resourceName: '',
    vendorId: '',
    cost: 0,
    concurrentUsers: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    sushiApiUrl: '',
    sushiApiKey: '',
    requestorId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [licensesRes, vendorsRes] = await Promise.all([
        api.get('/api/admin/erm/licenses'),
        api.get('/api/admin/erm/vendors')
      ]);
      setLicenses(licensesRes.data);
      setVendors(vendorsRes.data);
      if (vendorsRes.data.length > 0 && !formData.vendorId) {
        setFormData(prev => ({ ...prev, vendorId: vendorsRes.data[0].id.toString() }));
      }
    } catch (error) {
      console.error("Failed to fetch ERM data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('confirm_delete'))) {
      try {
        await api.delete(`/api/admin/erm/licenses/${id}`);
        setLicenses(licenses.filter(l => l.id !== id));
        toast({ title: "Thành công", description: "Đã xoá giấy phép." });
      } catch (error) {
        console.error("Failed to delete", error);
        toast({ variant: "destructive", title: "Lỗi", description: "Không thể xoá giấy phép." });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create Quick Vendor if empty
      let finalVendorId = formData.vendorId;
      if (!finalVendorId) {
        const newVendor = await api.post('/api/admin/erm/vendors', { name: 'Default Vendor', code: 'DEF' });
        finalVendorId = newVendor.data.id.toString();
        setVendors([...vendors, newVendor.data]);
      }

      const payload = {
        ...formData,
        vendorId: parseInt(finalVendorId),
        cost: Number(formData.cost),
        concurrentUsers: Number(formData.concurrentUsers),
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString()
      };

      await api.post('/api/admin/erm/licenses', payload);
      await fetchData(); // Refresh list to get relationships
      setShowModal(false);
      toast({ title: "Thành công", description: "Đã thêm giấy phép mới." });
    } catch (error) {
      console.error("Failed to add license", error);
      toast({ variant: "destructive", title: "Lỗi hệ thống", description: "Error saving license. Check console." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-primary-500" />
            {t('erm_config_title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('erm_config_desc')}
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          {t('add_license')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">{t('resource_name')}</th>
                <th className="px-6 py-4 font-medium">{t('vendor')}</th>
                <th className="px-6 py-4 font-medium">{t('sushi_url')}</th>
                <th className="px-6 py-4 font-medium">{t('valid_to')}</th>
                <th className="px-6 py-4 font-medium text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading...</td>
                </tr>
              ) : licenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">{t('no_data')}</td>
                </tr>
              ) : (
                licenses.map((license) => (
                  <tr key={license.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {license.resourceName}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {license.vendorName}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400 text-xs truncate max-w-[200px]">
                      {license.sushiApiUrl || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(license.validTo).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(license.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">{t('add_license')}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium mb-1">{t('resource_name')}</label>
                  <input 
                    type="text" 
                    value={formData.resourceName}
                    onChange={(e) => setFormData({...formData, resourceName: e.target.value})}
                    placeholder="E.g., Elsevier ScienceDirect"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium mb-1">{t('vendor')}</label>
                  <select 
                    value={formData.vendorId}
                    onChange={(e) => setFormData({...formData, vendorId: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500"
                  >
                    {vendors.length === 0 && <option value="">-- Create Default Vendor --</option>}
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('cost')} ($)</label>
                  <input 
                    type="number" 
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('concurrent_users')}</label>
                  <input 
                    type="number" 
                    value={formData.concurrentUsers}
                    onChange={(e) => setFormData({...formData, concurrentUsers: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('valid_from')}</label>
                  <input 
                    type="date" 
                    value={formData.validFrom}
                    onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('valid_to')}</label>
                  <input 
                    type="date" 
                    value={formData.validTo}
                    onChange={(e) => setFormData({...formData, validTo: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div className="col-span-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase">SUSHI / COUNTER 5 Config</h3>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('sushi_url')}</label>
                  <input 
                    type="url" 
                    value={formData.sushiApiUrl}
                    onChange={(e) => setFormData({...formData, sushiApiUrl: e.target.value})}
                    placeholder="https://sushi.elsevier.com/v5/"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('requestor_id')}</label>
                  <input 
                    type="text" 
                    value={formData.requestorId}
                    onChange={(e) => setFormData({...formData, requestorId: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('sushi_key')}</label>
                  <input 
                    type="text" 
                    value={formData.sushiApiKey}
                    onChange={(e) => setFormData({...formData, sushiApiKey: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 mt-4 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded font-medium disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? '...' : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
