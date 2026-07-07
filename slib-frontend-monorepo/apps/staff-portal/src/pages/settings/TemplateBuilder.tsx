import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { templateService } from '@slib/api-client';
import type { NotificationTemplate } from '@slib/types';
import { Button, useToast } from '@slib/ui-core';
import { EmailTemplateEditor } from '../../features/templates/components/EmailTemplateEditor';
import { SpineLabelPreview } from '../../features/templates/components/SpineLabelPreview';
import { FileText, Printer, Save, Eye } from 'lucide-react';

export const TemplateBuilder = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await templateService.getTemplates();
            setTemplates(data);
            if (data.length > 0 && !selectedTemplate) {
                setSelectedTemplate(data[0]);
            }
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể tải danh sách template', variant: 'destructive' });
        }
    };

    const handleSave = async () => {
        if (!selectedTemplate) return;
        setIsSaving(true);
        try {
            if (selectedTemplate.id) {
                await templateService.updateTemplate(selectedTemplate.id, selectedTemplate);
            } else {
                await templateService.createTemplate(selectedTemplate);
            }
            toast({ title: 'Thành công', description: 'Đã lưu mẫu thành công!' });
            loadTemplates();
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể lưu template', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePreview = async () => {
        if (!selectedTemplate) return;
        try {
            const mockData: Record<string, string> = selectedTemplate.type === 'Email' 
                ? { PatronName: 'Nguyễn Văn A', Title: 'Sách hay', DueDate: '2026-10-10' }
                : { CallNumber: 'QA76.73', Title: 'Sách hay', Barcode: '12345678' };
                
            const res = await templateService.previewTemplate({
                type: selectedTemplate.type,
                content: selectedTemplate.content,
                mockData
            });
            
            // Mở tab mới hoặc window để show kết quả
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(res.renderedContent);
            }
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Preview thất bại', variant: 'destructive' });
        }
    };

    const variables = selectedTemplate?.defaultVariables ? JSON.parse(selectedTemplate.defaultVariables) : [];

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mẫu Thông Báo & Nhãn</h1>
                    <p className="text-slate-500 mt-1">Quản lý cấu hình Email tự động và ZPL cho máy in mã vạch.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePreview}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview (Dữ liệu giả)
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || !selectedTemplate}>
                        <Save className="w-4 h-4 mr-2" />
                        Lưu thay đổi
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Left: Template List */}
                <div className="w-64 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <h3 className="font-semibold text-sm">Danh sách Mẫu</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {templates.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTemplate(t)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${selectedTemplate?.id === t.id ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-slate-100 text-slate-700'}`}
                            >
                                {t.type === 'Email' ? <FileText className="w-4 h-4 text-blue-500" /> : <Printer className="w-4 h-4 text-emerald-500" />}
                                <span className="line-clamp-1">{t.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Editor */}
                <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden">
                    {selectedTemplate ? (
                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    {selectedTemplate.type === 'Email' ? <FileText className="w-5 h-5 text-blue-500" /> : <Printer className="w-5 h-5 text-emerald-500" />}
                                    {selectedTemplate.name}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">{selectedTemplate.description}</p>
                            </div>

                            {selectedTemplate.type === 'Email' ? (
                                <EmailTemplateEditor 
                                    value={selectedTemplate.content} 
                                    onChange={val => setSelectedTemplate({...selectedTemplate, content: val})} 
                                    availableVariables={variables}
                                />
                            ) : (
                                <SpineLabelPreview 
                                    zplContent={selectedTemplate.content}
                                    onChange={val => setSelectedTemplate({...selectedTemplate, content: val})}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            Vui lòng chọn một mẫu để chỉnh sửa
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
