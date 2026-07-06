import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@slib/api-client';
import { Save, ArrowLeft, Trash2, Plus, Info } from 'lucide-react';
import { ALL_MARC_FIELDS } from '../../constants/marcFields';

interface FieldConfig {
  id?: number;
  tag: string;
  allowedSubfields?: string;
  isRequired: boolean;
  defaultValue?: string;
  description?: string; // For UI display only
}

// Default standard MARC21 fields for new templates
const DEFAULT_FIELDS: FieldConfig[] = ALL_MARC_FIELDS.map(f => ({
  tag: f.tag,
  isRequired: f.tag === '245', // Only title is required by default
  description: f.description
}));

export const MarcTemplateForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  
  const [fields, setFields] = useState<FieldConfig[]>(
    isEdit ? [] : JSON.parse(JSON.stringify(DEFAULT_FIELDS))
  );

  useEffect(() => {
    if (isEdit) {
      const fetchTemplate = async () => {
        try {
          // Fetch templates and find the specific one
          const res = await api.get('/api/admin/marc/templates');
          const template = res.data.find((t: any) => t.id === parseInt(id));
          if (template) {
            setFormData({
              name: template.name,
              description: template.description || '',
              isActive: template.isActive
            });
            // Map the API fields to our UI state
            setFields(template.fields.map((f: any) => ({
              id: f.id,
              tag: f.tag,
              allowedSubfields: f.allowedSubfields,
              isRequired: f.isRequired,
              defaultValue: f.defaultValue,
              description: DEFAULT_FIELDS.find(df => df.tag === f.tag)?.description || ''
            })));
          } else {
            navigate('/admin/marc-templates');
          }
        } catch (error) {
          console.error("Failed to fetch template", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTemplate();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        fieldConfigs: fields.map(f => ({
          id: f.id || 0,
          tag: f.tag,
          allowedSubfields: f.allowedSubfields,
          isRequired: f.isRequired,
          defaultValue: f.defaultValue
        }))
      };

      if (isEdit) {
        await api.put(`/api/admin/marc/templates/${id}`, payload);
      } else {
        await api.post('/api/admin/marc/templates', payload);
      }
      
      navigate('/admin/marc-templates');
    } catch (error) {
      console.error("Failed to save template", error);
      alert("An error occurred while saving the template.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const toggleRequired = (index: number) => {
    const newFields = [...fields];
    newFields[index].isRequired = !newFields[index].isRequired;
    setFields(newFields);
  };

  const addCustomField = () => {
    const tag = window.prompt("Nhập mã trường (Tag), ví dụ: 856");
    if (tag && tag.length === 3 && !isNaN(Number(tag))) {
      if (fields.some(f => f.tag === tag)) {
        alert("Trường này đã có trong danh sách!");
        return;
      }
      setFields([...fields, { tag, isRequired: false, description: 'Custom Field' }]);
    } else if (tag) {
      alert("Mã trường phải gồm 3 chữ số!");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/marc-templates')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? t('edit_template') : t('create_template')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('template_config_desc')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">{t('general_info')}</h2>
          
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium mb-1">{t('template_name')} <span className="text-red-500">*</span></label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="VD: Sách in tiếng Việt"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t('template_desc')}</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Mô tả mục đích sử dụng của mẫu này..."
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500"
                rows={3}
              />
            </div>

            <div className="flex items-start gap-3 mt-4 bg-primary-50 dark:bg-primary-500/10 p-4 rounded-lg border border-primary-100 dark:border-primary-500/20">
              <input 
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="mt-1 w-4 h-4 text-primary-600 rounded"
              />
              <div>
                <label htmlFor="isActive" className="font-bold text-primary-900 dark:text-primary-100 block cursor-pointer">
                  {t('set_as_active')}
                </label>
                <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                  {t('set_as_active_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fields Configuration */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div>
              <h2 className="text-lg font-bold">{t('field_config')}</h2>
              <p className="text-sm text-slate-500 mt-1">
                {t('field_config_desc')}
              </p>
            </div>
            <button
              type="button"
              onClick={addCustomField}
              className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded font-medium flex items-center gap-1 transition-colors"
            >
              <Plus size={16} /> {t('add_custom_field')}
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium w-24 text-center">{t('tag')}</th>
                  <th className="px-4 py-3 font-medium">{t('template_desc')}</th>
                  <th className="px-4 py-3 font-medium w-32 text-center">{t('is_required')}</th>
                  <th className="px-4 py-3 font-medium w-24 text-center">{t('remove')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      {t('no_fields_yet')}
                    </td>
                  </tr>
                ) : (
                  fields.sort((a, b) => a.tag.localeCompare(b.tag)).map((field, index) => (
                    <tr key={`${field.tag}-${index}`} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary-600 dark:text-primary-400 text-center">
                        {field.tag}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{field.description || 'Custom Field'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={() => toggleRequired(index)}
                          className="w-4 h-4 text-primary-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                          title="Xoá trường này"
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
          
          <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">
            <Info size={16} className="text-primary-500 shrink-0 mt-0.5" />
            <p>{t('field_info_note')}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button 
            type="button"
            onClick={() => navigate('/admin/marc-templates')}
            className="px-6 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
          >
            {t('cancel')}
          </button>
          <button 
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {submitting ? t('saving') : t('save_template')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarcTemplateForm;
