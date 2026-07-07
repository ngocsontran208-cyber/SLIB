import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { damService } from '@slib/api-client';
import { type AssetMetadataConfig, AssetType } from '@slib/types';
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

export const MetadataConfigList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [configs, setConfigs] = useState<AssetMetadataConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<AssetMetadataConfig>>({
    assetType: AssetType.PDF,
    fieldName: '',
    dataType: 'text',
    isRequired: false,
    isSearchable: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await damService.getMetadataConfigs();
      setConfigs(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải cấu hình Metadata" });
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
        await damService.updateMetadataConfig(formData.id, formData as AssetMetadataConfig);
        toast({ title: "Thành công", description: "Đã cập nhật cấu hình Metadata." });
      } else {
        await damService.createMetadataConfig(formData as AssetMetadataConfig);
        toast({ title: "Thành công", description: "Đã thêm cấu hình Metadata." });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể lưu cấu hình" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirm_delete', 'Bạn có chắc chắn muốn xóa?'))) return;
    try {
      await damService.deleteMetadataConfig(id);
      toast({ title: "Thành công", description: "Đã xóa cấu hình." });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể xóa." });
    }
  };

  const columns = useMemo<ColumnDef<AssetMetadataConfig>[]>(
    () => [
      {
        accessorKey: 'assetType',
        header: t('asset_type', 'Loại File'),
        cell: ({ row }) => AssetType[row.original.assetType]
      },
      {
        accessorKey: 'fieldName',
        header: t('field_name', 'Tên Trường'),
      },
      {
        accessorKey: 'dataType',
        header: t('data_type', 'Loại Dữ Liệu'),
        cell: ({ row }) => t(`${row.original.dataType}_type`, row.original.dataType)
      },
      {
        accessorKey: 'isRequired',
        header: t('is_required', 'Bắt buộc'),
        cell: ({ row }) => row.original.isRequired ? 'Có' : 'Không'
      },
      {
        accessorKey: 'isSearchable',
        header: t('is_searchable', 'Tìm kiếm'),
        cell: ({ row }) => row.original.isSearchable ? 'Có' : 'Không'
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
    data: configs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">{t('metadata_configs', 'Cấu hình Metadata')}</h2>
        </div>
        <Dialog open={showModal} onOpenChange={isOpen => {
          if(!isOpen) setFormData({ assetType: AssetType.PDF, fieldName: '', dataType: 'text', isRequired: false, isSearchable: true });
          setShowModal(isOpen);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} /> {t('add_metadata_field', 'Thêm Trường Dữ Liệu')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formData.id ? t('edit', 'Sửa') : t('add_metadata_field', 'Thêm Trường Dữ Liệu')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('asset_type', 'Loại File')}</Label>
                <select 
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-900"
                  value={formData.assetType}
                  onChange={e => setFormData({...formData, assetType: parseInt(e.target.value)})}
                >
                  <option value={AssetType.PDF}>PDF</option>
                  <option value={AssetType.Video}>Video</option>
                  <option value={AssetType.Audio}>Audio</option>
                  <option value={AssetType.Image}>Image</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t('field_name', 'Tên Trường')}</Label>
                <Input required value={formData.fieldName} onChange={e => setFormData({...formData, fieldName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t('data_type', 'Loại Dữ Liệu')}</Label>
                <select 
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-900"
                  value={formData.dataType}
                  onChange={e => setFormData({...formData, dataType: e.target.value})}
                >
                  <option value="text">Văn bản (Text)</option>
                  <option value="number">Số (Number)</option>
                  <option value="date">Ngày tháng (Date)</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isRequired} onChange={e => setFormData({...formData, isRequired: e.target.checked})} className="rounded text-primary-600 w-4 h-4" />
                  {t('is_required', 'Bắt buộc nhập')}
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isSearchable} onChange={e => setFormData({...formData, isSearchable: e.target.checked})} className="rounded text-primary-600 w-4 h-4" />
                  {t('is_searchable', 'Cho phép tìm kiếm')}
                </Label>
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
