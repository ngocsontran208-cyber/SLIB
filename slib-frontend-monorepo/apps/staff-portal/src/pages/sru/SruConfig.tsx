import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@slib/api-client';
import { Plus, Trash2, Edit, Network } from 'lucide-react';

interface SruTarget {
  id: number;
  name: string;
  baseUrl: string;
  isActive: boolean;
}

export const SruConfig: React.FC = () => {
  const { t } = useTranslation();
  const [targets, setTargets] = useState<SruTarget[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/marc/sru-targets');
      setTargets(response.data);
    } catch (error) {
      console.error("Failed to fetch SRU targets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleToggleStatus = async (target: SruTarget) => {
    try {
      const updatedTarget = { ...target, isActive: !target.isActive };
      await api.put(`/api/admin/marc/sru-targets/${target.id}`, updatedTarget);
      setTargets(targets.map(t => t.id === target.id ? updatedTarget : t));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('confirm_delete'))) {
      try {
        await api.delete(`/api/admin/marc/sru-targets/${id}`);
        setTargets(targets.filter(t => t.id !== id));
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/api/admin/marc/sru-targets', {
        name: newName,
        baseUrl: newUrl,
        isActive: true
      });
      setTargets([...targets, response.data]);
      setShowModal(false);
      setNewName('');
      setNewUrl('');
    } catch (error) {
      console.error("Failed to add target", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="text-primary-500" />
            {t('sru_config_title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('sru_config_desc')}
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          {t('add_server')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">{t('server_name')}</th>
                <th className="px-6 py-4 font-medium">{t('server_url')}</th>
                <th className="px-6 py-4 font-medium">{t('status')}</th>
                <th className="px-6 py-4 font-medium text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : targets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    {t('no_data')}
                  </td>
                </tr>
              ) : (
                targets.map((target) => (
                  <tr key={target.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {target.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400 text-xs">
                      {target.baseUrl}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(target)}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                          target.isActive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {target.isActive ? t('active') : t('inactive')}
                      </button>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(target.id)}
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

      {/* Modal Add */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">{t('add_server')}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('server_name')}</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Library of Congress"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('server_url')}</label>
                <input 
                  type="url" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://lx2.loc.gov:210/LCDB"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
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
