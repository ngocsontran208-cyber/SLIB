import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { mode, setMode, theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes = [
    { id: 'blue', color: 'bg-blue-500' },
    { id: 'emerald', color: 'bg-emerald-500' },
    { id: 'purple', color: 'bg-purple-500' },
    { id: 'orange', color: 'bg-orange-500' },
    { id: 'rose', color: 'bg-rose-500' }
  ] as const;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Theme Settings"
      >
        <Palette size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-4 z-50">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Color Mode</h3>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setMode('light')}
                className={`flex flex-col items-center p-2 rounded-lg border ${mode === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
              >
                <Sun size={18} className="mb-1" />
                <span className="text-[10px] font-medium">Light</span>
              </button>
              <button 
                onClick={() => setMode('dark')}
                className={`flex flex-col items-center p-2 rounded-lg border ${mode === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
              >
                <Moon size={18} className="mb-1" />
                <span className="text-[10px] font-medium">Dark</span>
              </button>
              <button 
                onClick={() => setMode('system')}
                className={`flex flex-col items-center p-2 rounded-lg border ${mode === 'system' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
              >
                <Monitor size={18} className="mb-1" />
                <span className="text-[10px] font-medium">System</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Primary Color</h3>
            <div className="flex justify-between items-center px-1">
              {themes.map(tOption => (
                <button
                  key={tOption.id}
                  onClick={() => setTheme(tOption.id)}
                  className={`w-6 h-6 rounded-full ${tOption.color} ring-offset-2 dark:ring-offset-slate-900 transition-all ${theme === tOption.id ? 'ring-2 ring-slate-400 dark:ring-slate-500 scale-110' : 'hover:scale-110'}`}
                  title={tOption.id}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
