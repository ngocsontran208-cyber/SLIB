import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Trash2, Plus, Info } from 'lucide-react';
import { MarcSubfieldRow } from './MarcSubfieldRow';

interface Props {
  fieldIndex: number;
  removeField: (index: number) => void;
}

export const MarcFieldRow: React.FC<Props> = ({ fieldIndex, removeField }) => {
  const { register, control, watch } = useFormContext();
  const fieldName = `fields.${fieldIndex}`;
  
  const { fields: subfields, append, remove, insert } = useFieldArray({
    control,
    name: `${fieldName}.subfields`
  });

  const tagValue = watch(`${fieldName}.tag`);

  // Fake Tooltip Dictionary
  const getHelperText = (tag: string) => {
    const dict: Record<string, string> = {
      '100': 'Main Entry-Personal Name',
      '245': 'Title Statement',
      '260': 'Publication, Distribution, etc.',
      '300': 'Physical Description',
      '650': 'Subject Added Entry-Topical Term'
    };
    return dict[tag] || 'Custom / Other Field';
  };

  return (
    <div id={`marc-field-${tagValue}`} className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
      
      {/* Left Block: Tag & Indicators */}
      <div className="w-full md:w-48 flex-shrink-0 flex items-start gap-2">
        <button 
          type="button"
          onClick={() => removeField(fieldIndex)}
          className="mt-1 p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 rounded-md transition-colors"
          title="Xóa trường này"
        >
          <Trash2 size={16} />
        </button>
        
        <div className="flex flex-col gap-1 w-full relative">
          <div className="flex gap-1">
            <input 
              type="text"
              maxLength={3}
              placeholder="Tag"
              {...register(`${fieldName}.tag`, { required: true })}
              className="w-14 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 text-sm font-mono font-bold text-blue-700 dark:text-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center"
            />
            <input 
              type="text"
              maxLength={1}
              placeholder="#"
              {...register(`${fieldName}.indicator1`)}
              className="w-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-1 py-1.5 text-sm font-mono text-center focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              title="Indicator 1"
            />
            <input 
              type="text"
              maxLength={1}
              placeholder="#"
              {...register(`${fieldName}.indicator2`)}
              className="w-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-1 py-1.5 text-sm font-mono text-center focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              title="Indicator 2"
            />
          </div>
          
          {/* Tooltip helper trigger */}
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 cursor-help group/tooltip relative">
            <Info size={12} /> {tagValue ? getHelperText(tagValue) : 'Empty Tag'}
          </div>
        </div>
      </div>

      {/* Right Block: Subfields */}
      <div className="flex-1 flex flex-col gap-2 border-l-2 border-slate-100 dark:border-slate-700/50 pl-4">
        {subfields.map((sub, sIdx) => (
          <MarcSubfieldRow 
            key={sub.id} 
            fieldIndex={fieldIndex} 
            subfieldIndex={sIdx} 
            removeSubfield={remove}
            insertSubfield={insert}
          />
        ))}
        
        {subfields.length === 0 && (
          <div className="text-xs text-slate-400 py-2 italic">Trường này chưa có subfield.</div>
        )}

        <div className="pt-2">
          <button 
            type="button"
            onClick={() => append({ code: '', value: '' })}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 px-2 py-1 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/20 rounded transition-colors"
          >
            <Plus size={14} /> Thêm Subfield
          </button>
        </div>
      </div>

    </div>
  );
};
