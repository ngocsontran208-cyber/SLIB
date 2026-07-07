import React, { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { damService } from '@slib/api-client';
import { Loader2 } from 'lucide-react';

// Sử dụng Worker từ CDN để tránh lỗi build bundler phức tạp
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface SecurePdfViewerProps {
  assetId: number;
  token?: string;
  width?: number;
}

export const SecurePdfViewer: React.FC<SecurePdfViewerProps> = ({ assetId, token, width = 800 }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    
    const fetchPdf = async () => {
      try {
        setLoading(true);
        // Lấy Blob an toàn qua Axios thay vì dùng iframe src
        const blob = await damService.downloadSecureAsset(assetId, token);
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (err) {
        console.error(err);
        setError('Không thể tải tài liệu. Vui lòng kiểm tra quyền truy cập hoặc đăng nhập lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [assetId, token]);

  useEffect(() => {
    // Chống sao chép nâng cao
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Chặn chuột phải
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Chặn P (Print), S (Save), C (Copy)
        if (['p', 's', 'c'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (node) node.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[400px] bg-slate-50 dark:bg-slate-900 rounded-lg">
        <Loader2 className="animate-spin text-primary-500 mb-4" size={40} />
        <p className="text-sm text-slate-500">Đang giải mã dữ liệu bảo mật...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-200 shadow-sm font-medium">{error}</div>;
  }

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col items-center bg-slate-100 dark:bg-slate-950 p-6 rounded-lg overflow-y-auto h-full w-full select-none"
      style={{ WebkitUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}
    >
      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<Loader2 className="animate-spin text-slate-400" size={32} />}
        className="flex flex-col items-center"
      >
        {Array.from(new Array(numPages), (el, index) => (
          <div key={`page_${index + 1}`} className="mb-6 shadow-xl border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden pointer-events-none">
            <Page 
              pageNumber={index + 1} 
              width={width}
              renderTextLayer={false} // Tắt lớp text để chống bôi đen tuyệt đối (Render như ảnh bitmap)
              renderAnnotationLayer={false}
              className="bg-white"
            />
          </div>
        ))}
      </Document>
      <p className="mt-4 text-xs text-slate-400 font-mono">Đã áp dụng các chính sách bản quyền (DRM). Ghi nhận luồng truy cập lúc {new Date().toLocaleTimeString()}</p>
    </div>
  );
};
