import React, { useCallback, useState } from 'react';
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

export interface UploadItemData {
  id: string;
  fileName: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  file?: File;
}

export interface DragDropUploadProps {
  onFilesSelected: (files: File[]) => void;
  uploadItems?: UploadItemData[];
  onRemoveItem?: (id: string) => void;
  onRetryItem?: (id: string) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  title?: string;
  description?: string;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFilesSelected,
  uploadItems = [],
  onRemoveItem,
  onRetryItem,
  accept,
  multiple = true,
  maxSizeMB = 500, // Default 500MB
  title = "Kéo thả tài liệu vào đây",
  description = "hoặc click để chọn file"
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    validateAndSelectFiles(files);
  }, [multiple]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      validateAndSelectFiles(files);
    }
  }, [multiple]);

  const validateAndSelectFiles = (files: File[]) => {
    if (files.length === 0) return;
    
    // Check multiple
    const filesToProcess = multiple ? files : [files[0]];
    
    // Check size limit (maxSizeMB)
    const validFiles = filesToProcess.filter(f => f.size <= maxSizeMB * 1024 * 1024);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    } else {
      alert(`File quá lớn, dung lượng tối đa là ${maxSizeMB}MB.`);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        className={`relative w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-colors duration-200 cursor-pointer
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
            : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
        />
        <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-primary-500' : 'text-slate-400'}`} />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
        <p className="text-[10px] text-slate-400 mt-2">Dung lượng tối đa: {maxSizeMB}MB</p>
      </div>

      {/* Upload List */}
      {uploadItems.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {uploadItems.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 relative overflow-hidden">
              {/* Progress Background */}
              {item.status === 'uploading' && (
                <div 
                  className="absolute inset-y-0 left-0 bg-primary-50 dark:bg-primary-900/20 transition-all duration-300 ease-linear z-0" 
                  style={{ width: `${item.progress}%` }}
                />
              )}
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-md flex-shrink-0 
                    ${item.status === 'success' ? 'bg-green-100 text-green-600' : 
                      item.status === 'error' ? 'bg-red-100 text-red-600' : 
                      'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {item.status === 'success' ? <CheckCircle size={16} /> : 
                     item.status === 'error' ? <AlertCircle size={16} /> : 
                     <FileIcon size={16} />}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{item.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{formatSize(item.size)}</span>
                      {item.status === 'uploading' && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-primary-600">{Math.round(item.progress)}%</span>
                        </>
                      )}
                      {item.status === 'error' && (
                        <>
                          <span>•</span>
                          <span className="text-red-500">{item.errorMessage || 'Lỗi tải lên'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  {item.status === 'error' && onRetryItem && (
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => onRetryItem(item.id)}>
                      <RefreshCw size={12} className="mr-1" /> Thử lại
                    </Button>
                  )}
                  {onRemoveItem && (
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
