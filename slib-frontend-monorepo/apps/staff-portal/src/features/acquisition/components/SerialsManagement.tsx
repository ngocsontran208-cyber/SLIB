import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookMarked, Search, Filter, CalendarDays, CheckCircle, Package } from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Button, Input, useToast, Skeleton
} from '@slib/ui-core';
import { SerialsService } from '@slib/api-client';
import type { SerialIssue } from '@slib/types';

export const SerialsManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [issues, setIssues] = useState<SerialIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchIssues = async () => {
    setLoading(true);
    try {
      // Gọi API giả lập cho mượt, đợi backend ghép nối xong
      // const data = await SerialsService.getExpectedIssues();
      const mockData: SerialIssue[] = [
        { id: 1, serialSubscriptionId: 101, enumeration: 'v.1 no.1', chronology: '2024-01', expectedDate: '2024-01-15T00:00:00Z', status: 'Expected' },
        { id: 2, serialSubscriptionId: 101, enumeration: 'v.1 no.2', chronology: '2024-02', expectedDate: '2024-02-15T00:00:00Z', status: 'Expected' },
        { id: 3, serialSubscriptionId: 102, enumeration: 'v.15 no.4', chronology: '2024-04', expectedDate: '2024-04-10T00:00:00Z', status: 'Received', physicalItemId: 5001 },
      ];
      setIssues(mockData);
    } catch (error) {
      console.error("Lỗi lấy danh sách ấn phẩm", error);
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải danh sách.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleCheckIn = async (issueId: number) => {
    try {
      // await SerialsService.checkInIssue(issueId);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status: 'Received', physicalItemId: Date.now() } : issue
      ));
      toast({ title: 'Thành công', description: 'Đã nhận ấn phẩm và tự động sinh Mã vạch (Barcode).' });
    } catch (error) {
      console.error("Lỗi Check-in", error);
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Nhận ấn phẩm thất bại.' });
    }
  };

  const filteredIssues = issues.filter(issue => 
    issue.enumeration.toLowerCase().includes(searchTerm.toLowerCase()) || 
    issue.chronology.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookMarked className="text-primary-500" />
            {t('serials_management', 'Quản lý Ấn phẩm định kỳ')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Theo dõi kỳ xuất bản và nhận tạp chí dựa trên MARC 21 (853/863).
          </p>
        </div>
        
        <Button className="gap-2">
          <Package size={16} /> Tạo Đăng ký mới (Subscription)
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Tìm theo tập/số, kỳ..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter size={16} /> Bộ lọc trạng thái
          </Button>
        </div>

        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Kỳ xuất bản (Chronology)</TableHead>
                <TableHead>Tập/Số (Enumeration)</TableHead>
                <TableHead>Ngày dự kiến nhận</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  <TableRow><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  <TableRow><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                </>
              ) : filteredIssues.length > 0 ? (
                filteredIssues.map(issue => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-slate-400" />
                        {issue.chronology}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400">
                      {issue.enumeration}
                    </TableCell>
                    <TableCell>
                      {new Date(issue.expectedDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        issue.status === 'Expected' 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' 
                          : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                      }`}>
                        {issue.status === 'Expected' ? 'Chưa nhận' : 'Đã nhận'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {issue.status === 'Expected' ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleCheckIn(issue.id)}
                          className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
                        >
                          <CheckCircle size={14} /> Check-in
                        </Button>
                      ) : (
                        <span className="text-sm text-slate-400">Barcode: {issue.physicalItemId}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Không tìm thấy kỳ xuất bản nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
