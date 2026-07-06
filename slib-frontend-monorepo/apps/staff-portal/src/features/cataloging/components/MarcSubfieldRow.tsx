import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Minus, Plus } from 'lucide-react';

interface Props {
  fieldIndex: number;
  subfieldIndex: number;
  removeSubfield: (index: number) => void;
  insertSubfield: (index: number, data: any) => void;
}

export const MarcSubfieldRow: React.FC<Props> = ({ fieldIndex, subfieldIndex, removeSubfield, insertSubfield }) => {
  const { register, watch } = useFormContext();
  const fieldName = `fields.${fieldIndex}.subfields.${subfieldIndex}`;
  
  // Watch code value for small validation or conditional UI
  const codeValue = watch(`${fieldName}.code`);

  return (
    <div className="flex items-start gap-2 group relative">
      <div className="flex flex-col items-center gap-1 mt-1">
        <span className="font-mono text-slate-500 font-bold bg-slate-200 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs">
          $
        </span>
      </div>
      
      <input 
        type="text"
        maxLength={1}
        placeholder="a"
        {...register(`${fieldName}.code`, { required: true })}
        className="w-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 text-sm text-center font-mono focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
      />
      
      <textarea
        placeholder="Giá trị subfield..."
        rows={1}
        {...register(`${fieldName}.value`)}
        className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm resize-y min-h-[36px] max-h-32 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        onInput={(e) => {
          // Auto resize textarea
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = target.scrollHeight + 'px';
        }}
      />
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          type="button" 
          onClick={() => insertSubfield(subfieldIndex + 1, { code: '', value: '' })}
          className="p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md"
          title="Thêm subfield bên dưới"
        >
          <Plus size={14} />
        </button>
        <button 
          type="button" 
          onClick={() => removeSubfield(subfieldIndex)}
          className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md"
          title="Xóa subfield"
        >
          <Minus size={14} />
        </button>
      </div>
    </div>
  );
};
