import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@slib/api-client';
import { BookPlus, Save, ArrowLeft, Search, Network } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  fields: any[];
}

interface SruTarget {
  id: number;
  name: string;
  baseUrl: string;
}

export const CatalogingForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // If we are editing, we have an ID

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const [sruTargets, setSruTargets] = useState<SruTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<number>(0);
  const [isbn, setIsbn] = useState('');

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [marcFields, setMarcFields] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('0');

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

  const handleTemplateChange = (templateId: number) => {
    const tpl = templates.find(t => t.id === templateId);
    setSelectedTemplate(tpl || null);
    
    // Auto-generate empty fields based on template
    if (tpl) {
      const initialFields = tpl.fields.map((f: any) => ({
        tag: f.tag,
        subfields: f.allowedSubfields.split(',').map((code: string) => ({ code: code.trim(), value: '' }))
      }));
      setMarcFields(initialFields);
    } else {
      setMarcFields([]);
    }
  };

  const handleFetchZ3950 = async () => {
    if (!isbn || !selectedTarget || !selectedTemplate) return;
    try {
      const res = await api.get(`/api/cataloging/records/search-online?targetId=${selectedTarget}&templateId=${selectedTemplate.id}&isbn=${isbn}`);
      // Z39.50 returns sanitized marc fields matching the template!
      setMarcFields(res.data.marcData);
      
      // Attempt to extract title and author from the pulled fields
      const field245 = res.data.marcData.find((f: any) => f.tag === '245');
      if (field245) {
        const subA = field245.subfields.find((s: any) => s.code === 'a');
        if (subA) setTitle(subA.value);
      }
      const field100 = res.data.marcData.find((f: any) => f.tag === '100');
      if (field100) {
        const subA = field100.subfields.find((s: any) => s.code === 'a');
        if (subA) setAuthor(subA.value);
      }
    } catch (error) {
      console.error("Z39.50 Fetch Error", error);
      alert("Không tìm thấy dữ liệu ISBN trên Z39.50/SRU target này.");
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate || !title) return;
    
    const payload = {
      templateId: selectedTemplate.id,
      title,
      author,
      fields: marcFields
    };

    try {
      await api.post('/api/cataloging/records', payload);
      navigate('/admin/cataloging/records');
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu biểu ghi. Vui lòng kiểm tra lại cấu hình mẫu MARC.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
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
              {t('create_record')}
            </h1>
            <p className="text-slate-500 text-sm mt-1">{t('create_record_desc')}</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all"
        >
          <Save size={18} />
          {t('save_record')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Z39.50 & Template Selection */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Network size={18} className="text-slate-500" />
              1. {t('select_template')}
            </h3>
            <select 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200"
              value={selectedTemplate?.id || ''}
              onChange={(e) => handleTemplateChange(Number(e.target.value))}
            >
              <option value="">-- Chọn Mẫu Biên Mục --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 ${!selectedTemplate ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Search size={18} className="text-slate-500" />
              2. {t('fetch_z3950')}
            </h3>
            <div className="space-y-3">
              <select 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 text-sm"
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(Number(e.target.value))}
              >
                {sruTargets.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.baseUrl})</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Nhập ISBN..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm"
                  value={isbn}
                  onChange={e => setIsbn(e.target.value)}
                />
                <button 
                  onClick={handleFetchZ3950}
                  className="bg-slate-800 dark:bg-slate-700 text-white px-3 rounded-lg text-sm font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                >
                  Fetch
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Record Data */}
        <div className={`col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 ${!selectedTemplate ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            3. Dữ liệu Thư mục (MARC 21)
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">{t('record_title')} (*)</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">{t('record_author')}</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200"
                value={author}
                onChange={e => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto custom-scrollbar">
            {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {marcFields.map((field, fIdx) => {
              if (!field.tag.startsWith(activeTab)) return null;
              
              return (
                <div key={fIdx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="font-mono text-primary-600 dark:text-primary-400 font-bold mb-3 flex items-center justify-between">
                    <span>Trường {field.tag}</span>
                  </div>
                  <div className="space-y-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                    {field.subfields.map((sub: any, sIdx: number) => (
                      <div key={sIdx} className="flex items-center gap-3">
                        <span className="font-mono text-slate-500 dark:text-slate-400 font-bold bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs w-8 text-center">
                          ${sub.code}
                        </span>
                        <input 
                          type="text"
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                          value={sub.value}
                          onChange={(e) => {
                            const newFields = [...marcFields];
                            newFields[fIdx].subfields[sIdx].value = e.target.value;
                            setMarcFields(newFields);
                            
                            // Auto update title/author if editing 245$a or 100$a manually
                            if (field.tag === '245' && sub.code === 'a') setTitle(e.target.value);
                            if (field.tag === '100' && sub.code === 'a') setAuthor(e.target.value);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {marcFields.filter(f => f.tag.startsWith(activeTab)).length === 0 && (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400 italic">
                Không có trường nào bắt đầu bằng "{activeTab}" trong mẫu này.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
