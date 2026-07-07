import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { damService } from '@slib/api-client';
import type { DrmPolicy } from '@slib/types';
import { Plus, Trash2, Edit } from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Button, Input, Label,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  useToast, Skeleton
} from '@slib/ui-core';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef
} from '@tanstack/react-table';

export const DrmPolicyList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [policies, setPolicies] = useState<DrmPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<DrmPolicy>>({
    policyName: '',
    allowDownload: false,
    maxPreviewPages: 10,
    watermarkText: 'CONFIDENTIAL - %Email%',
    expirationDays: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await damService.getDrmPolicies();
      setPolicies(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải DRM Policies" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.id) {
        await damService.updateDrmPolicy(formData.id, formData as DrmPolicy);
        toast({ title: "Thành công", description: "Đã cập nhật DRM Policy." });
      } else {
        await damService.createDrmPolicy(formData as DrmPolicy);
        toast({ title: "Thành công", description: "Đã thêm DRM Policy." });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể lưu Policy" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirm_delete', 'Bạn có chắc chắn muốn xóa?'))) return;
    try {
      await damService.deleteDrmPolicy(id);
      toast({ title: "Thành công", description: "Đã xóa Policy." });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể xóa." });
    }
  };

  const columns = useMemo<ColumnDef<DrmPolicy>[]>(
    () => [
      {
        accessorKey: 'policyName',
        header: t('policy_name', 'Tên Chính Sách'),
      },
      {
        accessorKey: 'allowDownload',
        header: t('allow_download', 'Cho phép tải về'),
        cell: ({ row }) => row.original.allowDownload ? 'Có' : 'Không (Chỉ xem online)'
      },
      {
        accessorKey: 'maxPreviewPages',
        header: t('max_preview_pages', 'Số trang đọc thử'),
        cell: ({ row }) => row.original.maxPreviewPages === 0 ? 'Toàn bộ' : row.original.maxPreviewPages
      },
      {
        accessorKey: 'watermarkText',
        header: t('watermark_text', 'Watermark'),
        cell: ({ row }) => row.original.watermarkText || '-'
      },
      {
        id: 'actions',
        header: () => <div className="text-right">{t('actions', 'Thao tác')}</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => {
                setFormData(row.original);
                setShowModal(true);
              }}
            >
              <Edit size={14} /> {t('edit', 'Sửa')}
            </Button>
            <Button 
              variant="destructive"
              size="icon" 
              className="h-8 w-8"
              onClick={() => handleDelete(row.original.id!)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )
      }
    ],
    [t]
  );

  const table = useReactTable({
    data: policies,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">{t('drm_policies', 'Chính sách DRM')}</h2>
        </div>
        <Dialog open={showModal} onOpenChange={isOpen => {
          if(!isOpen) setFormData({ policyName: '', allowDownload: false, maxPreviewPages: 10, watermarkText: 'CONFIDENTIAL - %Email%', expirationDays: 0 });
          setShowModal(isOpen);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} /> {t('add_drm_policy', 'Thêm DRM Policy')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formData.id ? t('edit', 'Sửa') : t('add_drm_policy', 'Thêm DRM Policy')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('policy_name', 'Tên Chính Sách')}</Label>
                <Input required value={formData.policyName} onChange={e => setFormData({...formData, policyName: e.target.value})} placeholder="Ví dụ: Đồ án Tốt nghiệp 2024" />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-md dark:border-slate-800">
                <div className="space-y-0.5">
                  <Label>{t('allow_download', 'Cho phép tải về')}</Label>
                  <p className="text-xs text-slate-500">Nếu tắt, người dùng chỉ có thể xem online.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.allowDownload} onChange={e => setFormData({...formData, allowDownload: e.target.checked})} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <div className="space-y-2">
                <Label>{t('max_preview_pages', 'Giới hạn số trang đọc thử')}</Label>
                <Input type="number" required min={0} value={formData.maxPreviewPages} onChange={e => setFormData({...formData, maxPreviewPages: parseInt(e.target.value)})} />
                <p className="text-xs text-slate-500">Nhập 0 để cho phép đọc toàn bộ tài liệu.</p>
              </div>
              <div className="space-y-2">
                <Label>{t('watermark_text', 'Nội dung Watermark (chống chụp màn hình)')}</Label>
                <Input value={formData.watermarkText || ''} onChange={e => setFormData({...formData, watermarkText: e.target.value})} placeholder="CONFIDENTIAL - %Email%" />
                <p className="text-xs text-slate-500">Hỗ trợ các biến như %Email%, %Username%, %Date%.</p>
              </div>
              <div className="flex justify-end pt-4 gap-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>{t('cancel', 'Hủy')}</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '...' : t('save', 'Lưu lại')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-16 text-center">
                  <Skeleton className="h-10 w-full rounded" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t('no_data', 'Chưa có dữ liệu')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
