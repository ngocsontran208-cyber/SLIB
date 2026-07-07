import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useBlocker } from 'react-router-dom';
import api from '@slib/api-client';
import { BookPlus, Save, ArrowLeft, Search, Network } from 'lucide-react';
import { MarcFieldList } from './MarcFieldList';
import { useToast } from '@slib/ui-core';

interface CatalogingFormValues {
  templateId: number;
  title: string;
  author: string;
  fields: {
    tag: string;
    indicator1?: string;
    indicator2?: string;
    subfields: {
      code: string;
      value: string;
    }[];
  }[];
}

interface MarcEditorPageProps {
  recordType?: 'bibliographic' | 'authority';
}

export const MarcEditorPage: React.FC<MarcEditorPageProps> = ({ recordType = 'bibliographic' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [sruTargets, setSruTargets] = useState<any[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<number>(0);
  const [isbn, setIsbn] = useState('');

  const methods = useForm<CatalogingFormValues>({
    defaultValues: {
      templateId: 0,
      title: '',
      author: '',
      fields: []
    }
  });

  const { register, handleSubmit, watch, reset, setValue, formState: { isDirty, errors } } = methods;
  const watchTemplateId = watch('templateId');

  // Cảnh báo khi rời trang nếu có thay đổi chưa lưu
  // [DISABLED] useBlocker yêu cầu Data Router (createBrowserRouter) thay vì BrowserRouter.
  // useBlocker(({ currentLocation, nextLocation }) => {
  //   if (isDirty && currentLocation.pathname !== nextLocation.pathname) {
  //     return !window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang này?');
  //   }
  //   return false;
  // });

  // Hotkeys: Ctrl + Enter để lưu nhanh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  useEffect(() => {
    fetchTemplates();
    fetchSruTargets();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/api/admin/marc/templates');
      setTemplates(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSruTargets = async () => {
    try {
      const res = await api.get('/api/admin/marc/sru-targets');
      setSruTargets(res.data);
      if (res.data.length > 0) {
        setSelectedTarget(res.data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tid = Number(e.target.value);
    setValue('templateId', tid, { shouldValidate: true });
    const tpl = templates.find(t => t.id === tid);
    if (tpl) {
      const initialFields = tpl.fields.map((f: any) => ({
        tag: f.tag,
        indicator1: '',
        indicator2: '',
        subfields: f.allowedSubfields.split(',').map((code: string) => ({ code: code.trim(), value: '' }))
      }));
      setValue('fields', initialFields);
    } else {
      setValue('fields', []);
    }
  };

  const handleFetchZ3950 = async () => {
    if (!isbn || !selectedTarget || !watchTemplateId) return;
    try {
      const res = await api.get(`/api/cataloging/records/search-online?targetId=${selectedTarget}&templateId=${watchTemplateId}&isbn=${isbn}`);
      
      const newFields = res.data.marcData;
      let newTitle = '';
      let newAuthor = '';

      const field245 = newFields.find((f: any) => f.tag === '245');
      if (field245) {
        const subA = field245.subfields.find((s: any) => s.code === 'a');
        if (subA) newTitle = subA.value;
      }
      
      const field100 = newFields.find((f: any) => f.tag === '100');
      if (field100) {
        const subA = field100.subfields.find((s: any) => s.code === 'a');
        if (subA) newAuthor = subA.value;
      }

      reset({
        templateId: watchTemplateId,
        title: newTitle,
        author: newAuthor,
        fields: newFields
      });
      toast({ title: "Thành công", description: "Đã tải dữ liệu từ Z39.50/SRU." });
    } catch (error) {
      console.error("Z39.50 Fetch Error", error);
      toast({ variant: "destructive", title: "Lỗi tìm kiếm", description: "Không tìm thấy dữ liệu ISBN trên Z39.50/SRU target này." });
    }
  };

  const onSubmit = async (data: CatalogingFormValues) => {
    if (!data.templateId) {
      toast({ variant: "destructive", title: "Lỗi xác thực", description: "Vui lòng chọn Mẫu Biên Mục." });
      return;
    }
    
    // Filter empty fields to clean payload
    const cleanedFields = data.fields
      .map(f => ({
        ...f,
        subfields: f.subfields.filter(s => s.code.trim() !== '' && s.value.trim() !== '')
      }))
      .filter(f => f.tag.trim() !== '' && f.subfields.length > 0);

    const payload = {
      ...data,
      fields: cleanedFields
    };

    try {
      await api.post('/api/cataloging/records', payload);
      toast({ title: "Thành công", description: "Đã lưu biểu ghi thành công." });
      navigate('/admin/cataloging/records');
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi hệ thống", description: "Lỗi khi lưu biểu ghi. Vui lòng kiểm tra lại dữ liệu MARC." });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header Sticky */}
      <div className="sticky top-16 z-20 glass px-6 py-4 -mx-6 mb-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <BookPlus className="text-primary-500" />
              {recordType === 'authority' ? 'Biên mục Chuẩn (Authority)' : t('create_record', 'Biên mục mới')}
            </h1>
          </div>
        </div>
        <button 
          onClick={handleSubmit(onSubmit)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all"
        >
          <Save size={18} />
          {recordType === 'authority' ? 'Lưu Bản ghi Chuẩn' : t('save_record', 'Lưu biểu ghi')}
        </button>
      </div>

      <FormProvider {...methods}>
        <form className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Left: Template and Basic Info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Network size={18} className="text-slate-500" />
                Metadata Mặc Định
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mẫu Biên Mục (*)</label>
                <select 
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:outline-none ${errors.templateId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500'}`}
                  value={watchTemplateId || ''}
                  onChange={handleTemplateChange}
                >
                  <option value="">-- Chọn Mẫu --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {errors.templateId && <p className="text-red-500 text-xs mt-1">Vui lòng chọn mẫu biên mục.</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nhan đề (*)</label>
                  <input 
                    type="text" 
                    {...register('title', { required: 'Nhan đề không được để trống' })}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:outline-none ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500'}`}
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tác giả</label>
                  <input 
                    type="text" 
                    {...register('author')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Top Right: Z39.50 Tool */}
            <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-opacity ${!watchTemplateId ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                <Search size={18} className="text-slate-500" />
                Nhập liệu tự động (Z39.50)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Thư viện nguồn</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(Number(e.target.value))}
                  >
                    {sruTargets.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.baseUrl})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ISBN</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="VD: 9781234567890"
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                      value={isbn}
                      onChange={e => setIsbn(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={handleFetchZ3950}
                      className="bg-slate-800 dark:bg-slate-700 text-white px-4 rounded-lg font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
                    >
                      Kéo Dữ Liệu
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* MARC Records Form Array */}
          <div className={!watchTemplateId ? 'opacity-50 pointer-events-none' : ''}>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
              Bảng dữ liệu MARC 21
            </h3>
            
            <MarcFieldList />
            
          </div>
          
        </form>
      </FormProvider>

    </div>
  );
};
