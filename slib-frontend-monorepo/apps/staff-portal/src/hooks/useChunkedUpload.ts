import { useState, useCallback, useRef } from 'react';
import { uploadService } from '@slib/api-client';
import type { UploadItemData } from '@slib/ui-core';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CONCURRENCY = 3;
const MAX_RETRIES = 3;

export const useChunkedUpload = () => {
  const [uploadItems, setUploadItems] = useState<UploadItemData[]>([]);
  // Dùng ref để đảm bảo hàm get item state mới nhất trong khi upload
  const itemsRef = useRef<UploadItemData[]>([]);

  const updateItem = (id: string, updates: Partial<UploadItemData>) => {
    setUploadItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      itemsRef.current = next;
      return next;
    });
  };

  const addFiles = useCallback((files: File[]) => {
    const newItems: UploadItemData[] = files.map(file => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      size: file.size,
      progress: 0,
      status: 'pending',
      file
    }));
    
    setUploadItems(prev => {
      const next = [...prev, ...newItems];
      itemsRef.current = next;
      return next;
    });
    
    // Bắt đầu upload tự động cho các file mới
    newItems.forEach(item => startUpload(item));
  }, []);

  const startUpload = async (item: UploadItemData) => {
    if (!item.file) return;
    
    updateItem(item.id, { status: 'uploading', progress: 0, errorMessage: undefined });
    
    try {
      // 1. Init Upload
      const initRes = await uploadService.initUpload({
        fileName: item.file.name,
        totalSize: item.file.size,
        contentType: item.file.type || 'application/octet-stream'
      });
      const sessionId = initRes.sessionId;
      
      // 2. Chunking
      const totalChunks = Math.ceil(item.file.size / CHUNK_SIZE);
      let uploadedChunks = 0;
      
      const uploadChunkWithRetry = async (chunkIndex: number, retries = 0): Promise<void> => {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(item.file!.size, start + CHUNK_SIZE);
        const chunkBlob = item.file!.slice(start, end);
        
        try {
          await uploadService.uploadChunk(sessionId, chunkIndex, chunkBlob);
          uploadedChunks++;
          updateItem(item.id, { progress: (uploadedChunks / totalChunks) * 100 });
        } catch (error) {
          if (retries < MAX_RETRIES) {
            console.warn(`Chunk ${chunkIndex} của ${item.fileName} thất bại. Đang thử lại (${retries + 1}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1))); // Exponential backoff
            return uploadChunkWithRetry(chunkIndex, retries + 1);
          }
          throw error;
        }
      };
      
      // Concurrency Pool Manager
      let currentIndex = 0;
      const workers = Array(MAX_CONCURRENCY).fill(null).map(async () => {
        while (currentIndex < totalChunks) {
          const index = currentIndex++;
          await uploadChunkWithRetry(index);
        }
      });
      
      // Đợi tất cả chunk hoàn thành
      await Promise.all(workers);
      
      // 3. Complete Upload
      const completeRes = await uploadService.completeUpload(sessionId);
      
      updateItem(item.id, { status: 'success', progress: 100 });
      console.log('Upload thành công:', completeRes);
      
    } catch (error: any) {
      updateItem(item.id, { 
        status: 'error', 
        errorMessage: typeof error.response?.data === 'string' ? error.response.data : (error.message || 'Lỗi mạng khi tải lên')
      });
    }
  };

  const removeItem = useCallback((id: string) => {
    setUploadItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const retryItem = useCallback((id: string) => {
    const item = itemsRef.current.find(i => i.id === id);
    if (item && item.status === 'error') {
      startUpload(item);
    }
  }, []);

  return {
    uploadItems,
    addFiles,
    removeItem,
    retryItem
  };
};
