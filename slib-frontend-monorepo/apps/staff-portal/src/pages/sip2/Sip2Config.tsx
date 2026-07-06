import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@slib/api-client';
import { MonitorSmartphone, Plus, Trash2, Edit } from 'lucide-react';

interface Sip2Device {
  id: number;
  name: string;
  ipAddress: string;
  port: number;
  location: string;
  isActive: boolean;
  createdAt: string;
}

export const Sip2Config: React.FC = () => {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<Sip2Device[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    port: 5001,
    location: '',
    isActive: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/sip2/devices');
      setDevices(res.data);
    } catch (error) {
      console.error("Failed to fetch SIP2 devices", error);
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
        await api.delete(`/api/admin/sip2/devices/${id}`);
        setDevices(devices.filter(d => d.id !== id));
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        port: Number(formData.port)
      };
      await api.post('/api/admin/sip2/devices', payload);
      await fetchData();
      setShowModal(false);
      setFormData({ name: '', ipAddress: '', port: 5001, location: '', isActive: true });
    } catch (error) {
      console.error("Failed to add device", error);
      alert("Error saving device.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MonitorSmartphone className="text-primary-500" />
            {t('sip2_config_title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('sip2_config_desc')}
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          {t('add_device')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">{t('device_name')}</th>
                <th className="px-6 py-4 font-medium">{t('ip_address')}</th>
                <th className="px-6 py-4 font-medium">{t('port')}</th>
                <th className="px-6 py-4 font-medium">{t('location')}</th>
                <th className="px-6 py-4 font-medium">{t('status')}</th>
                <th className="px-6 py-4 font-medium text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading...</td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">{t('no_data')}</td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {device.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-orange-600 dark:text-orange-400">
                      {device.ipAddress}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {device.port}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {device.location || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          device.isActive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        }`}
                      >
                        {device.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(device.id)}
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

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold">{t('add_device')}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('device_name')}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="E.g., Self-check Kiosk 1"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('ip_address')}</label>
                  <input 
                    type="text" 
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({...formData, ipAddress: e.target.value})}
                    placeholder="192.168.1.100"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('port')}</label>
                  <input 
                    type="number" 
                    value={formData.port}
                    onChange={(e) => setFormData({...formData, port: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500 font-mono"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('location')}</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Floor 1, Near Entrance"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">{t('active')}</label>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-2 border-t border-slate-200 dark:border-slate-800">
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
