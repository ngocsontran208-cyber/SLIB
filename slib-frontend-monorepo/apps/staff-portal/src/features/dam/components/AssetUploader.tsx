import React from 'react';
import { DragDropUpload } from '@slib/ui-core';
import { useChunkedUpload } from '../../../hooks/useChunkedUpload';
import { useTranslation } from 'react-i18next';

export const AssetUploader: React.FC = () => {
  const { t } = useTranslation();
  const { uploadItems, addFiles, removeItem, retryItem } = useChunkedUpload();

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('upload_digital_asset', 'Tải lên Tài nguyên số')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Hệ thống hỗ trợ tải lên file dung lượng lớn (Video, PDF, ZIP) bằng cơ chế cắt nhỏ (Chunking) giúp chống đứt cáp và tối ưu RAM.
        </p>
      </div>

      <DragDropUpload
        onFilesSelected={addFiles}
        uploadItems={uploadItems}
        onRemoveItem={removeItem}
        onRetryItem={retryItem}
        maxSizeMB={2000} // Cho phép lên tới 2GB
        title={t('drag_drop_title', 'Kéo thả tài nguyên số vào đây')}
      />
    </div>
  );
};
