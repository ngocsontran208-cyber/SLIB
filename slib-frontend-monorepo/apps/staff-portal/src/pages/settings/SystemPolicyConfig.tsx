import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@slib/api-client';
import { Settings, Save, BookOpen, Shield, Barcode } from 'lucide-react';
import { useToast } from '@slib/ui-core';

interface LibraryPolicy {
  id: number;
  policyKey: string;
  policyValue: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
}

export const SystemPolicyConfig: React.FC = () => {
  const { t } = useTranslation();
  const [policies, setPolicies] = useState<Record<string, LibraryPolicy>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();

  // Group policies by category for better UI
  const categories = {
    circulation: ['MaxBorrowDays', 'MaxBooksAllowed', 'DailyFineAmount'],
    drm: ['MaxPdfViewCount', 'DrmWatermarkTemplate'],
    acquisition: ['BarcodePrefix']
  };

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/policies');
      const data = res.data as LibraryPolicy[];
      const policyMap: Record<string, LibraryPolicy> = {};
      data.forEach(p => {
        policyMap[p.policyKey] = p;
      });
      setPolicies(policyMap);
    } catch (error) {
      console.error("Failed to fetch policies", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleChange = (key: string, value: string) => {
    setPolicies({
      ...policies,
      [key]: {
        ...policies[key],
        policyKey: key,
        policyValue: value,
        description: policies[key]?.description || ''
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Create a list of promises to update all policies that have been modified
      // In a real app, you might want to track 'dirty' state to only send modified ones
      // For now, we update all visible policies or the ones mapped
      const promises = Object.values(policies).map(policy => 
        api.put(`/api/admin/policies/${policy.policyKey}`, JSON.stringify(policy.policyValue), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
      await Promise.all(promises);
      
      // Refresh to get updated timestamps
      await fetchPolicies();
      toast({ title: "Thành công", description: "Lưu chính sách thành công!" });
    } catch (error) {
      console.error("Failed to save policies", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Lỗi khi lưu chính sách!" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-500">Loading system policies...</div>;
  }

  const renderPolicyField = (key: string) => {
    const policy = policies[key] || { policyKey: key, policyValue: '', description: '' };
    
    return (
      <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            {t(key)} <span className="text-xs font-normal text-slate-400 ml-2">({key})</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {policy.description}
          </p>
        </div>
        <div className="w-full sm:w-1/3">
          <input 
            type={key.includes('Amount') || key.includes('Count') || key.includes('Days') || key.includes('Allowed') ? 'number' : 'text'}
            value={policy.policyValue}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-primary-500 transition-colors font-medium"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="text-primary-500" />
            {t('system_policies_title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('system_policies_desc')}
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? t('saving') : t('save_policies')}
        </button>
      </div>

      <div className="space-y-6">
        {/* Circulation Policies */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <BookOpen className="text-primary-500" size={18} />
            <h2 className="font-bold">{t('circulation_policies')}</h2>
          </div>
          <div className="px-6">
            {categories.circulation.map(renderPolicyField)}
          </div>
        </div>

        {/* DRM Policies */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Shield className="text-primary-500" size={18} />
            <h2 className="font-bold">{t('drm_policies')}</h2>
          </div>
          <div className="px-6">
            {categories.drm.map(renderPolicyField)}
          </div>
        </div>

        {/* Acquisition Policies */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Barcode className="text-primary-500" size={18} />
            <h2 className="font-bold">{t('acquisition_policies')}</h2>
          </div>
          <div className="px-6">
            {categories.acquisition.map(renderPolicyField)}
          </div>
        </div>
      </div>
    </div>
  );
};
