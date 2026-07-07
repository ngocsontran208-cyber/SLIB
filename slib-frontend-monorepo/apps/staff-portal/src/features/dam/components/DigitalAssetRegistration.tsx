import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '@slib/api-client';
import { DragDropUpload, useToast } from '@slib/ui-core';
import { useChunkedUpload } from '../../../hooks/useChunkedUpload';
import { FileUp, Shield, LayoutTemplate, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const DigitalAssetRegistration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [configs, setConfigs] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedPolicy, setSelectedPolicy] = useState<string>('');
  
  const { uploadItems, addFiles, removeItem, retryItem } = useChunkedUpload();

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [configRes, policyRes] = await Promise.all([
          api.get('/api/digital-asset/metadata-configs'),
          api.get('/api/digital-asset/drm-policies')
        ]);
        setConfigs(configRes.data);
        setPolicies(policyRes.data);
      } catch (err) {
        console.error(err);
        toast({ variant: "destructive", title: "Lỗi tải cấu hình", description: "Không thể lấy thông tin cấu hình từ máy chủ." });
      }
    };
    fetchDependencies();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Required Fields
    const missingFields = configs.filter(c => c.isRequired && !formData[c.fieldName]);
    if (missingFields.length > 0) {
      toast({ variant: "destructive", title: "Thiếu thông tin", description: `Vui lòng nhập: ${missingFields.map(c => c.fieldName).join(', ')}` });
      return;
    }
    
    if (!selectedPolicy) {
      toast({ variant: "destructive", title: "Thiếu chính sách", description: "Vui lòng chọn Chính sách bản quyền (DRM)." });
      return;
    }
    
    if (uploadItems.length === 0) {
      toast({ variant: "destructive", title: "Thiếu tài liệu", description: "Vui lòng tải lên ít nhất 1 tệp tin." });
      return;
    }
    
    const isUploading = uploadItems.some(i => i.status === 'uploading');
    if (isUploading) {
      toast({ variant: "destructive", title: "Đang tải lên", description: "Vui lòng đợi quá trình tải lên hoàn tất." });
      return;
    }

    const hasError = uploadItems.some(i => i.status === 'error');
    if (hasError) {
      toast({ variant: "destructive", title: "Lỗi tải lên", description: "Có tệp bị lỗi, vui lòng thử lại hoặc gỡ bỏ." });
      return;
    }

    // Mock lưu dữ liệu
    console.log("Mock Save Metadata & DRM:", { formData, policy: selectedPolicy, uploadItems });
    
    toast({ title: "Thành công!", description: "Đăng ký tài liệu số hoàn tất. File đã được đưa vào hàng đợi xử lý ngầm." });
    setTimeout(() => {
      navigate('/admin/dam');
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 pt-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <FileUp className="text-primary-500" />
            Biên mục Tài liệu số (Upload & Config)
          </h1>
          <p className="text-slate-500 text-sm mt-1">Đăng ký thông tin, gán chính sách DRM và tải lên tệp tin dung lượng lớn một cách mượt mà.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Cột trái: Metadata & DRM */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <LayoutTemplate size={20} className="text-blue-500" />
              Thông tin Metadata
            </h2>
            <div className="space-y-5">
              {configs.map(config => (
                <div key={config.id}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {config.fieldName} {config.isRequired && <span className="text-red-500">*</span>}
                  </label>
                  {config.dataType === 'Date' ? (
                    <input 
                      type="date"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                      value={formData[config.fieldName] || ''}
                      onChange={e => handleInputChange(config.fieldName, e.target.value)}
                    />
                  ) : (
                    <input 
                      type={config.dataType === 'Number' ? 'number' : 'text'}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                      placeholder={`Nhập ${config.fieldName}...`}
                      value={formData[config.fieldName] || ''}
                      onChange={e => handleInputChange(config.fieldName, e.target.value)}
                    />
                  )}
                </div>
              ))}
              {configs.length === 0 && (
                <div className="text-slate-500 italic text-sm py-4">Đang tải cấu hình metadata từ máy chủ...</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Shield size={20} className="text-red-500" />
              Chính sách bản quyền (DRM)
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Gán chính sách cho tệp này <span className="text-red-500">*</span>
              </label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all cursor-pointer"
                value={selectedPolicy}
                onChange={e => setSelectedPolicy(e.target.value)}
              >
                <option value="">-- Vui lòng chọn chính sách --</option>
                {policies.map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.allowDownload ? '✅ (Được phép tải)' : '🔒 (Chỉ xem Online)'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cột phải: Upload */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <FileUp size={20} className="text-emerald-500" />
              Tệp tài liệu (Video, PDF)
            </h2>
            
            <DragDropUpload
              onFilesSelected={addFiles}
              uploadItems={uploadItems}
              onRemoveItem={removeItem}
              onRetryItem={retryItem}
              maxSizeMB={2048}
              title="Kéo thả Video / PDF vào đây"
            />

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-600/25 transition-all active:scale-[0.98]"
              >
                <CheckCircle2 size={20} />
                Hoàn tất Biên mục
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
