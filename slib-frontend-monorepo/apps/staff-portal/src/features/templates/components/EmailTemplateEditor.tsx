import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface EmailTemplateEditorProps {
    value: string;
    onChange: (val: string) => void;
    availableVariables?: string[];
}

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ value, onChange, availableVariables = [] }) => {
    
    const insertVariable = (variable: string) => {
        const textToInsert = `{{${variable}}}`;
        // Để đơn giản, chèn vào cuối. Trong thực tế có thể chèn vào vị trí con trỏ của Quill.
        onChange(value + textToInsert);
    };

    return (
        <div className="flex gap-4">
            <div className="flex-1">
                <ReactQuill 
                    theme="snow" 
                    value={value} 
                    onChange={onChange} 
                    className="h-64 mb-12 bg-white"
                />
            </div>
            <div className="w-64 bg-slate-50 border rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 text-slate-700">Biến khả dụng</h4>
                <p className="text-xs text-slate-500 mb-4">Click để chèn nhanh vào cuối mẫu</p>
                <div className="flex flex-col gap-2">
                    {availableVariables.map(v => (
                        <button 
                            key={v}
                            type="button"
                            onClick={() => insertVariable(v)}
                            className="text-left text-xs bg-white border px-2 py-1.5 rounded hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                            {`{{${v}}}`}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
