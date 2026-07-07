import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api, damService } from '@slib/api-client';
import { DragDropUpload, useToast } from '@slib/ui-core';
import { useChunkedUpload } from '../../../hooks/useChunkedUpload';
import { FileUp, Shield, LayoutTemplate, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const DigitalAssetRegistration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [bibRecords, setBibRecords] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  
  const [selectedBibRecord, setSelectedBibRecord] = useState<string>('');
  const [selectedPolicy, setSelectedPolicy] = useState<string>('');
  
  const { uploadItems, addFiles, removeItem, retryItem } = useChunkedUpload();

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [bibRes, policyRes] = await Promise.all([
          api.get('/api/cataloging/records'),
          api.get('/api/digital-asset/drm-policies')
        ]);
        setBibRecords(bibRes.data);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Required Fields
    if (!selectedBibRecord) {
      toast({ variant: "destructive", title: "Thiếu thông tin", description: "Vui lòng chọn Biểu ghi thư mục gốc." });
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
    
    const isUploading = uploadItems.some(i => i.status === 'uploading' || i.status === 'pending');
    if (isUploading) {
      toast({ variant: "destructive", title: "Đang tải lên", description: "Vui lòng đợi quá trình tải lên hoàn tất." });
      return;
    }

    const hasError = uploadItems.some(i => i.status === 'error');
    if (hasError) {
      toast({ variant: "destructive", title: "Lỗi tải lên", description: "Có tệp bị lỗi, vui lòng thử lại hoặc gỡ bỏ." });
      return;
    }

    const assetIds = uploadItems.map(i => i.assetId).filter(id => id !== undefined) as number[];
    if (assetIds.length === 0) {
      toast({ variant: "destructive", title: "Lỗi dữ liệu", description: "Không tìm thấy ID của tài liệu đã tải lên." });
      return;
    }

    try {
      await damService.registerDigitalAsset({
        assetIds,
        drmPolicyId: selectedPolicy,
        bibliographicRecordId: parseInt(selectedBibRecord, 10)
      });
      toast({ title: "Thành công!", description: "Đăng ký tài liệu số hoàn tất. File đã được đưa vào hàng đợi xử lý ngầm." });
      setTimeout(() => {
        navigate('/admin/dam/assets');
      }, 1500);
    } catch (err) {
      toast({ variant: "destructive", title: "Lỗi hệ thống", description: "Đã có lỗi xảy ra khi lưu thông tin." });
    }
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
              Thông tin Biểu ghi gốc
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Chọn biểu ghi thư mục (MARC 21) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    value={selectedBibRecord}
                    onChange={e => setSelectedBibRecord(e.target.value)}
                  >
                    <option value="">-- Chọn tài liệu giấy/biểu ghi gốc --</option>
                    {bibRecords.map(record => (
                      <option key={record.id} value={record.id}>
                        {record.title} {record.author ? ` - ${record.author}` : ''}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={() => navigate('/admin/cataloging/create')}
                    className="shrink-0 px-4 py-2.5 border border-primary-500 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium whitespace-nowrap"
                  >
                    Thêm biểu ghi mới
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Tài liệu số bắt buộc phải được gắn với một biểu ghi thư mục. Nếu là tài liệu số hóa, vui lòng chọn biểu ghi của bản giấy. Nếu là tài liệu số mới hoàn toàn, vui lòng tạo biểu ghi mới.
                </p>
              </div>
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
