import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useBlocker } from 'react-router-dom';
import api from '@slib/api-client';
import { BookPlus, Save, ArrowLeft, Search, Network } from 'lucide-react';
import { MarcFieldList } from './MarcFieldList';
import { useToast } from '@slib/ui-core';
import { ALL_MARC_FIELDS } from '../../../constants/marcFields';

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
  
  const [documentType, setDocumentType] = useState<string>('Book');
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

  // Hotkeys: Ctrl + Enter để lưu nhanh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  useEffect(() => {
    fetchSruTargets();
    if (recordType === 'bibliographic') {
      loadTemplateByType('Book');
    }
  }, []);

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

  const loadTemplateByType = async (type: string) => {
    setDocumentType(type);
    if (!type) {
      setValue('templateId', 0);
      setValue('fields', []);
      return;
    }
    
    try {
      const res = await api.get(`/api/cataloging/records/template-by-type?documentType=${type}`);
      const tpl = res.data;
      setValue('templateId', tpl.id, { shouldValidate: true });
      
      const initialFields = tpl.fieldConfigs.map((f: any) => {
        let parsedSubfields = ['a'];
        if (f.allowedSubfields) {
          try {
            const parsed = JSON.parse(f.allowedSubfields);
            if (Array.isArray(parsed)) {
              parsedSubfields = parsed;
            }
          } catch (e) {
            console.warn('Failed to parse allowedSubfields', f.allowedSubfields);
          }
        } else {
          const def = ALL_MARC_FIELDS.find(df => df.tag === f.tag);
          if (def && def.subfields) {
            parsedSubfields = def.subfields;
          }
        }

        return {
          tag: f.tag,
          indicator1: '',
          indicator2: '',
          isRequired: f.isRequired,
          subfields: parsedSubfields.map((code: string) => ({ code: code.trim(), value: '' }))
        };
      });
      setValue('fields', initialFields);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: t('error'), description: t('template_not_found') });
      setValue('templateId', 0);
      setValue('fields', []);
    }
  };

  const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    loadTemplateByType(e.target.value);
  };

  const handleFetchZ3950 = async () => {
    if (!isbn || !selectedTarget || !watchTemplateId) return;
    try {
      const res = await api.get(`/api/cataloging/records/search-online?targetId=${selectedTarget}&templateId=${watchTemplateId}&isbn=${isbn}`);
      
      const newFields = res.data.marcData;
      reset({
        templateId: watchTemplateId,
        fields: newFields
      });
      toast({ title: t('success'), description: t('fetch_z3950_success') });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: t('search_error'), description: t('z3950_not_found') });
    }
  };

  const onSubmit = async (data: CatalogingFormValues) => {
    if (!data.templateId) {
      toast({ variant: "destructive", title: t('validation_error'), description: t('template_required') });
      return;
    }
    
    // Filter empty fields to clean payload
    const cleanedFields = data.fields
      .map(f => ({
        ...f,
        subfields: f.subfields.filter(s => s.code.trim() !== '' && s.value.trim() !== '')
      }))
      .filter(f => f.tag.trim() !== '' && f.subfields.length > 0);

    const field245 = cleanedFields.find(f => f.tag === '245');
    const title = field245?.subfields.find(s => s.code === 'a')?.value || '';

    const field100 = cleanedFields.find(f => f.tag === '100');
    const author = field100?.subfields.find(s => s.code === 'a')?.value || '';

    if (!title) {
      toast({ variant: "destructive", title: t('missing_data'), description: t('missing_title') });
      return;
    }

    const payload = {
      templateId: data.templateId,
      title: title,
      author: author,
      fields: cleanedFields
    };

    try {
      await api.post('/api/cataloging/records', payload);
      toast({ title: t('success'), description: t('record_saved_successfully') });
      navigate('/admin/cataloging/records');
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: t('system_error'), description: t('save_record_error') });
    }
  };

  return (
    <div className="w-full space-y-4 pb-32">
      
      {/* Toolbar Header Sticky */}
      <div className="sticky -top-6 md:-top-8 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 md:px-8 py-3 flex flex-wrap items-center gap-4 shadow-sm -mx-6 md:-mx-8 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap flex items-center gap-2">
          <BookPlus className="text-primary-500" size={18} />
          {recordType === 'authority' ? t('authority_record') : t('create_record')}
        </div>
        
        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden md:block"></div>
        
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <select 
            className={`text-sm border rounded px-3 py-1.5 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.templateId ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'}`}
            value={documentType}
            onChange={handleDocumentTypeChange}
            tabIndex={1}
          >
            <option value="">{t('choose_document_type')}</option>
            <option value="Book">{t('doc_type_book')}</option>
            <option value="Journal">{t('doc_type_journal')}</option>
            <option value="Thesis">{t('doc_type_thesis')}</option>
          </select>

          <select className="text-sm border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 bg-slate-50 dark:bg-slate-800 focus:outline-none">
            <option>{t('cataloging_status_draft')}</option>
            <option>{t('cataloging_status_approved')}</option>
          </select>
          
          <div className="flex-1"></div>

          {/* Z39.50 Inline */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-md border border-slate-200 dark:border-slate-700">
            <Search size={14} className="text-slate-400 ml-2" />
            <select 
              className="text-xs bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-300"
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(Number(e.target.value))}
            >
              {sruTargets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input 
              type="text"
              placeholder={t('enter_isbn')}
              className="text-xs border-l border-slate-300 dark:border-slate-600 bg-transparent px-2 w-28 focus:outline-none"
              value={isbn}
              onChange={e => setIsbn(e.target.value)}
            />
            <button 
              type="button"
              onClick={handleFetchZ3950}
              className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 px-3 py-1 rounded text-xs font-bold border border-slate-200 dark:border-slate-600 transition-colors"
            >
              {t('fetch')}
            </button>
          </div>
        </div>
      </div>

      <FormProvider {...methods}>
        <form className="px-4 max-w-[1400px] mx-auto space-y-4">
          <div className={!watchTemplateId ? 'opacity-50 pointer-events-none' : ''}>
            <MarcFieldList />
          </div>
          
        </form>
      </FormProvider>

      {/* FAB Save Button */}
      <button 
        onClick={handleSubmit(onSubmit)}
        className="fixed bottom-8 right-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full px-6 py-4 shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform z-50 focus:outline-none focus:ring-4 focus:ring-primary-500/50"
        title="Cmd + S"
      >
        <Save size={20} />
        <span className="font-bold">{t('save_record')}</span>
      </button>

    </div>
  );
};
