import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, LayoutTemplate, ShieldAlert, UploadCloud } from 'lucide-react';
import { MetadataConfigList } from '../../features/dam/components/MetadataConfigList';
import { DrmPolicyList } from '../../features/dam/components/DrmPolicyList';
import { AssetUploader } from '../../features/dam/components/AssetUploader';
import { DigitalAssetList } from '../../features/dam/components/DigitalAssetList';

export const DamConfigDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'list' | 'metadata' | 'drm' | 'upload'>('list');

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="text-primary-500" />
            {t('dam_config_title', 'Cấu hình DAM & DRM')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('dam_config_desc', 'Quản lý trường thông tin động và chính sách bản quyền cho tài liệu số.')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'list'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <LayoutTemplate size={16} />
          {t('dam_assets_list', 'Kho Lưu trữ số')}
        </button>
        <button
          onClick={() => setActiveTab('metadata')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'metadata'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <LayoutTemplate size={16} />
          {t('metadata_configs', 'Cấu hình Metadata')}
        </button>
        <button
          onClick={() => setActiveTab('drm')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'drm'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <ShieldAlert size={16} />
          {t('drm_policies', 'Chính sách Bản quyền (DRM)')}
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'upload'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <UploadCloud size={16} />
          {t('upload_digital_asset', 'Tải lên Tài nguyên số')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === 'list' && <DigitalAssetList />}
        {activeTab === 'metadata' && <MetadataConfigList />}
        {activeTab === 'drm' && <DrmPolicyList />}
        {activeTab === 'upload' && <AssetUploader />}
      </div>
    </div>
  );
};
