import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import api from '@slib/api-client';
import { FileText, Plus, Trash2, Edit, ChevronDown, ChevronRight, Settings } from 'lucide-react';

interface TemplateFieldConfig {
  id: number;
  tag: string;
  allowedSubfields: string | null;
  isRequired: boolean;
  defaultValue: string | null;
}

interface MarcTemplate {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  fields: TemplateFieldConfig[];
}

export const MarcTemplateConfig: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<MarcTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Expanded state cho accordion
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/marc/templates');
      setTemplates(res.data);
    } catch (error) {
      console.error("Failed to fetch MARC Templates", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteTemplate = async (id: number) => {
    if (window.confirm(t('confirm_delete') || 'Bạn có chắc chắn muốn xoá?')) {
      try {
        await api.delete(`/api/admin/marc/templates/${id}`);
        setTemplates(templates.filter(t => t.id !== id));
      } catch (error) {
        console.error("Failed to delete template", error);
      }
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="text-primary-500" />
            MARC Templates
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('marc_template_desc') || 'Quản lý các mẫu biên mục MARC21'}
          </p>
        </div>
        <Link 
          to="/admin/marc-templates/create"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          {t('add_template') || 'Thêm Mẫu'}
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-4 w-10"></th>
                <th className="px-4 py-4 font-medium">{t('template_name') || 'Tên mẫu'}</th>
                <th className="px-4 py-4 font-medium">{t('template_desc') || 'Mô tả'}</th>
                <th className="px-4 py-4 font-medium">{t('status') || 'Trạng thái'}</th>
                <th className="px-4 py-4 font-medium text-right">{t('actions') || 'Thao tác'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading...</td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">{t('no_data') || 'Không có dữ liệu'}</td>
                </tr>
              ) : (
                templates.map((tpl) => (
                  <React.Fragment key={tpl.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-4 cursor-pointer" onClick={() => toggleRow(tpl.id)}>
                        {expandedRows[tpl.id] ? <ChevronDown size={18} className="text-slate-400"/> : <ChevronRight size={18} className="text-slate-400"/>}
                      </td>
                      <td className="px-4 py-4 font-medium text-primary-700 dark:text-primary-400">
                        {tpl.name}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {tpl.description}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            tpl.isActive 
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400'
                          }`}
                        >
                          {tpl.isActive ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-4 flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/marc-templates/edit/${tpl.id}`)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded transition-colors"
                          title="Sửa mẫu"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Row for Fields */}
                    {expandedRows[tpl.id] && (
                      <tr className="bg-slate-50 dark:bg-slate-800/20">
                        <td colSpan={5} className="px-10 py-4 border-b border-slate-200 dark:border-slate-800">
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Chi tiết các trường</h4>
                          {tpl.fields.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">Mẫu này chưa có trường nào.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {tpl.fields.sort((a,b) => a.tag.localeCompare(b.tag)).map(f => (
                                <span 
                                  key={f.id} 
                                  className={`px-2 py-1 text-xs rounded border ${
                                    f.isRequired 
                                      ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-300 font-bold' 
                                      : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                                  }`}
                                  title={f.isRequired ? 'Trường bắt buộc' : 'Trường tuỳ chọn'}
                                >
                                  {f.tag} {f.isRequired && '*'}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarcTemplateConfig;
