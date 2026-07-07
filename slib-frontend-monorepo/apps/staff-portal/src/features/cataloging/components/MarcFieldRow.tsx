import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Trash2, Plus, Info, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MarcSubfieldRow } from './MarcSubfieldRow';
import { ALL_MARC_FIELDS } from '../../../constants/marcFields';

interface Props {
  fieldIndex: number;
  removeField: (index: number) => void;
}

export const MarcFieldRow: React.FC<Props> = ({ fieldIndex, removeField }) => {
  const { t } = useTranslation();
  const { register, control, watch } = useFormContext();
  const fieldName = `fields.${fieldIndex}`;
  
  const { fields: subfields, append, remove, insert } = useFieldArray({
    control,
    name: `${fieldName}.subfields`
  });

  const tagValue = watch(`${fieldName}.tag`);
  const isRequired = watch(`${fieldName}.isRequired`);

  // Extended Dictionary for better UX
  const getHelperText = (tag: string) => {
    const def = ALL_MARC_FIELDS.find(f => f.tag === tag);
    if (def && def.descriptionKey) {
      return t(def.descriptionKey);
    }
    return t('optional_field', 'Trường tùy chọn');
  };

  return (
    <div id={`marc-field-${tagValue}`} className={`flex flex-col border-b border-slate-200 dark:border-slate-800 py-1 transition-colors ${isRequired ? 'bg-primary-50/30 dark:bg-primary-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
      
      {subfields.map((sub, sIdx) => (
        <div key={sub.id} className="flex flex-wrap md:flex-nowrap items-start gap-2 px-2 py-1 group/row">
          
          {/* Actions Column */}
          <div className="flex items-center gap-1 w-16 flex-shrink-0 pt-1">
             {sIdx === 0 ? (
               <button type="button" onClick={() => removeField(fieldIndex)} title={isRequired ? t('required_field_warning') : t('delete_field')} className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors">
                 <Trash2 size={16} className={isRequired ? 'text-red-400' : ''}/>
               </button>
             ) : <div className="w-[24px]"></div>}
             {/* Add/Remove subfield */}
             <div className="flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity">
               <button type="button" onClick={() => insert(sIdx + 1, {code:'', value:''})} className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded" title={t('add_subfield')}>
                 <Plus size={14}/>
               </button>
               {subfields.length > 1 && (
                 <button type="button" onClick={() => remove(sIdx)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded" title={t('delete_subfield')}>
                   <Minus size={14}/>
                 </button>
               )}
             </div>
          </div>

          {/* Tags & Indicators Column */}
          <div className="flex gap-1 flex-shrink-0 pt-1">
             {sIdx === 0 ? (
               <>
                 <div className="relative group/tag">
                   <input 
                     type="text" maxLength={3} placeholder="Tag" 
                     {...register(`${fieldName}.tag`, { required: true })}
                     className={`w-12 bg-white dark:bg-slate-900 border rounded px-1 py-1 text-sm font-mono font-bold text-center focus:ring-1 focus:outline-none ${isRequired ? 'border-primary-400 text-primary-700' : 'border-slate-300 dark:border-slate-700 text-blue-700 dark:text-blue-400 focus:border-blue-500'}`}
                     tabIndex={fieldIndex * 10 + 1}
                   />
                   <div className="absolute left-0 top-full mt-1 hidden group-hover/tag:block z-10 w-48 bg-slate-800 text-white text-xs p-2 rounded shadow-lg whitespace-normal text-left">
                     {tagValue ? getHelperText(tagValue) : 'Empty Tag'} {isRequired && '(*)'}
                   </div>
                 </div>
                 <input 
                   type="text" maxLength={1} placeholder="#" 
                   {...register(`${fieldName}.indicator1`)}
                   className="w-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1 py-1 text-sm font-mono text-center focus:ring-1 focus:border-primary-500 focus:outline-none"
                   tabIndex={fieldIndex * 10 + 2}
                 />
                 <input 
                   type="text" maxLength={1} placeholder="#" 
                   {...register(`${fieldName}.indicator2`)}
                   className="w-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1 py-1 text-sm font-mono text-center focus:ring-1 focus:border-primary-500 focus:outline-none"
                   tabIndex={fieldIndex * 10 + 3}
                 />
               </>
             ) : (
               <>
                 <div className="w-12"></div>
                 <div className="w-8"></div>
                 <div className="w-8"></div>
               </>
             )}
          </div>

          {/* Subfield Content */}
          <MarcSubfieldRow 
             fieldIndex={fieldIndex} 
             subfieldIndex={sIdx} 
             parentTag={tagValue}
             tabIndexBase={fieldIndex * 10 + 4 + (sIdx * 2)}
          />
        </div>
      ))}
      
      {subfields.length === 0 && (
         <div className="flex gap-2 items-center px-10 py-1">
           <button type="button" onClick={() => append({ code: 'a', value: '' })} className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">
             + {t('add_subfield')}
           </button>
         </div>
      )}
    </div>
  );
};
