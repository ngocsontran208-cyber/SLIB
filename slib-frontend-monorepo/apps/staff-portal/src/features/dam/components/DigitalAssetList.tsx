import React, { useEffect, useState } from 'react';
import { api } from '@slib/api-client';
import { useSignalR } from '../../../hooks/useSignalR';
import { Loader2 } from 'lucide-react';

const HUB_URL = 'https://localhost:7219/hubs/notification'; // Should be configured via env normally

export const DigitalAssetList: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Hook lắng nghe SignalR
  const { assetStatuses } = useSignalR(HUB_URL);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await api.get('/api/digital-asset');
        setAssets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary-500" /></div>;
  }

  const getStatusBadge = (assetId: number) => {
    // Ưu tiên trạng thái từ SignalR (nếu đang xử lý)
    const statusObj = assetStatuses[assetId];
    if (!statusObj) {
      return <span className="px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-full text-xs font-medium">Sẵn sàng / Chưa cập nhật</span>;
    }

    const { status, message } = statusObj;
    let bgColor = 'bg-blue-100 text-blue-700 border-blue-200';
    
    if (status === 'Completed') bgColor = 'bg-green-100 text-green-700 border-green-200';
    else if (status === 'Processing') bgColor = 'bg-yellow-100 text-yellow-700 border-yellow-200';
    else if (status === 'OCR' || status === 'Thumbnail') bgColor = 'bg-purple-100 text-purple-700 border-purple-200';

    return (
      <div className="flex flex-col gap-1 items-start">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${bgColor}`}>
          {status}
        </span>
        <span className="text-[11px] text-slate-400 font-mono animate-pulse">{message}</span>
      </div>
    );
  };

  const filteredAssets = assets.filter(asset => {
    if (searchTerm && !asset.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (formatFilter && asset.mimeType !== formatFilter) return false;
    
    const statusObj = assetStatuses[asset.id];
    const status = statusObj ? statusObj.status : 'Ready';
    if (statusFilter) {
      if (statusFilter === 'Ready' && statusObj && statusObj.status !== 'Completed') return false;
      if (statusFilter !== 'Ready' && status !== statusFilter) return false;
    }
    return true;
  });

  const formats = Array.from(new Set(assets.map(a => a.mimeType)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex-1 w-full relative">
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên file..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:border-primary-500 outline-none"
          />
          <svg className="w-4 h-4 absolute left-3 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={formatFilter} 
            onChange={e => setFormatFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300"
          >
            <option value="">Tất cả định dạng</option>
            {formats.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Ready">Sẵn sàng / Đã hoàn tất</option>
            <option value="Processing">Đang chờ xử lý</option>
            <option value="Thumbnail">Đang trích xuất ảnh</option>
            <option value="OCR">Đang phân tích OCR</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên File</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Định dạng</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dung lượng</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái (Real-time)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
          {filteredAssets.map((asset) => (
            <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">#{asset.id}</td>
              <td className="px-4 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{asset.title}</td>
              <td className="px-4 py-4 text-sm">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded font-mono text-[10px]">
                  {asset.mimeType}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
              </td>
              <td className="px-4 py-4">
                {getStatusBadge(asset.id)}
              </td>
            </tr>
          ))}
          {filteredAssets.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                {assets.length === 0 ? 'Chưa có tài nguyên số nào.' : 'Không tìm thấy kết quả phù hợp.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
};
