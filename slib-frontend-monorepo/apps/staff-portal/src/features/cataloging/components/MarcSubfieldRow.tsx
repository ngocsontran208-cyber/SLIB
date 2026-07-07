import React, { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Minus, Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AuthorityService } from '@slib/api-client';
import type { AuthorityRecord } from '@slib/types';
import { getSubfieldPlaceholder } from '../../../constants/marcFields';

interface Props {
  fieldIndex: number;
  subfieldIndex: number;
  parentTag?: string;
  tabIndexBase?: number;
}

export const MarcSubfieldRow: React.FC<Props> = ({ fieldIndex, subfieldIndex, parentTag, tabIndexBase = 0 }) => {
  const { t } = useTranslation();
  const { register, watch, setValue } = useFormContext();
  const fieldName = `fields.${fieldIndex}.subfields.${subfieldIndex}`;
  
  const codeValue = watch(`${fieldName}.code`);
  const valueValue = watch(`${fieldName}.value`);

  const [suggestions, setSuggestions] = useState<AuthorityRecord[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Check if this subfield needs auto-suggest
  const needsSuggest = ['100', '700', '650'].includes(parentTag || '') && codeValue === 'a';

  useEffect(() => {
    if (!needsSuggest || !valueValue || valueValue.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const type = parentTag === '650' ? 'Subject' : 'Personal Name';
        const res = await AuthorityService.suggestAuthorities(valueValue, type);
        setSuggestions(res);
      } catch (e) {
        console.error(e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [valueValue, needsSuggest, parentTag]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-1 items-start gap-1">
      <div className="pt-2 text-slate-400 font-bold font-mono text-xs select-none pl-1">$</div>
      
      <input 
        type="text"
        maxLength={1}
        placeholder="a"
        {...register(`${fieldName}.code`, { required: true })}
        tabIndex={tabIndexBase}
        className="w-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1 py-1 mt-1 text-sm text-center font-mono focus:border-primary-500 focus:ring-1 focus:outline-none"
      />
      
      <div className="flex-1 relative mt-1" ref={wrapperRef}>
        <div className="relative">
          <textarea
            placeholder={getSubfieldPlaceholder(parentTag || '', codeValue || '', t)}
            rows={1}
            {...register(`${fieldName}.value`)}
            tabIndex={tabIndexBase + 1}
            onFocus={() => needsSuggest && setShowSuggestions(true)}
            className={`w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1 text-sm resize-y min-h-[32px] max-h-32 focus:border-primary-500 focus:ring-1 focus:outline-none ${needsSuggest ? 'pr-8' : ''}`}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          {needsSuggest && (
            <Search size={14} className="absolute right-3 top-2 text-slate-400" />
          )}
        </div>

        {/* Dropdown Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            <div className="px-3 py-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-700 uppercase">
              {t('authority_suggestions')}
            </div>
            {suggestions.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setValue(`${fieldName}.value`, s.mainEntry, { shouldValidate: true, shouldDirty: true });
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 transition-colors"
              >
                {s.mainEntry}
                <div className="text-xs text-slate-400 mt-0.5">{s.authorityType}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
