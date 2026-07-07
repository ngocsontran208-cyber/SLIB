import React, { useMemo, useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { MarcFieldRow } from './MarcFieldRow';

export const MarcFieldList: React.FC = () => {
  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields'
  });

  const watchFields = watch('fields') || [];

  // Groups for Sticky Sidebar navigation
  const groups = useMemo(() => {
    return [
      { label: '0xx', prefix: '0' },
      { label: '1xx', prefix: '1' },
      { label: '2xx', prefix: '2' },
      { label: '3xx', prefix: '3' },
      { label: '4xx', prefix: '4' },
      { label: '5xx', prefix: '5' },
      { label: '6xx', prefix: '6' },
      { label: '7xx', prefix: '7' },
      { label: '8xx', prefix: '8' },
      { label: '9xx', prefix: '9' },
    ];
  }, []);

  const scrollToGroup = (prefix: string) => {
    // Find the first field that starts with prefix
    const fieldIndex = watchFields.findIndex((f: any) => f.tag && f.tag.startsWith(prefix));
    if (fieldIndex !== -1) {
      const tagValue = watchFields[fieldIndex].tag;
      const element = document.getElementById(`marc-field-${tagValue}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        append({ tag: '', indicator1: '', indicator2: '', subfields: [{ code: 'a', value: '' }] });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [append]);

  return (
    <div className="flex flex-col md:flex-row gap-6 relative">
      
      {/* Main Content: Continuous Scroll List */}
      <div className="flex-1 space-y-4">
        {fields.map((field, index) => (
          <MarcFieldRow 
            key={field.id}
            fieldIndex={index}
            removeField={remove}
          />
        ))}

        <button
          type="button"
          onClick={() => append({ tag: '', indicator1: '', indicator2: '', subfields: [{ code: 'a', value: '' }] })}
          className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-bold"
        >
          <Plus size={18} /> Thêm trường MARC mới
        </button>
      </div>

      {/* Sticky Sidebar Navigation */}
      <div className="w-full md:w-32 flex-shrink-0 hidden md:block">
        <div className="sticky top-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Cuộn nhanh</div>
          <div className="flex flex-col gap-1">
            {groups.map(group => {
              const hasFields = watchFields.some((f: any) => f.tag && f.tag.startsWith(group.prefix));
              return (
                <button
                  key={group.label}
                  type="button"
                  onClick={() => scrollToGroup(group.prefix)}
                  disabled={!hasFields}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    hasFields 
                      ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800' 
                      : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
};
