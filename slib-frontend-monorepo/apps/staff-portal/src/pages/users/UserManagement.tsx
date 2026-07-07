import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@slib/api-client';
import { Users, Shield, UserX, UserCheck, Search, Filter } from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Button, Input, Label,
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  useToast, Skeleton
} from '@slib/ui-core';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef
} from '@tanstack/react-table';

interface Role {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  isActive: boolean;
  roles: string[];
}

export const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sheet & Dialog State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Role State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Table State
  const [globalFilter, setGlobalFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/api/RoleManager/users'),
        api.get('/api/RoleManager/roles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      if (rolesRes.data.length > 0) {
        setSelectedRoleId(rolesRes.data[0].id.toString());
      }
    } catch (error) {
      console.error("Failed to fetch Users data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (user: User) => {
    try {
      await api.put(`/api/RoleManager/users/${user.id}/active`, !user.isActive, {
        headers: { 'Content-Type': 'application/json' }
      });
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
      toast({ title: "Thành công", description: "Đã cập nhật trạng thái người dùng." });
    } catch (error) {
      console.error("Failed to toggle user status", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể cập nhật trạng thái." });
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      await api.post(`/api/RoleManager/assign-role?userId=${selectedUser.id}&roleId=${selectedRoleId}`);
      await fetchData();
      setIsSheetOpen(false);
      toast({ title: "Thành công", description: "Đã phân quyền thành công." });
    } catch (error) {
      console.error("Failed to assign role", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể phân quyền." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/api/RoleManager/roles', { name: newRoleName, description: newRoleDesc });
      await fetchData(); 
      setShowCreateRoleModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      toast({ title: "Thành công", description: "Đã tạo Role mới." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi tạo Role", description: error.response?.data || "Failed to create role" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'username',
        header: t('username', 'Tài khoản'),
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-900 dark:text-white">{row.original.username}</div>
            <div className="text-xs text-slate-500">{row.original.email}</div>
          </div>
        )
      },
      {
        accessorKey: 'fullName',
        header: t('fullname', 'Họ tên'),
      },
      {
        accessorKey: 'roles',
        header: t('roles', 'Vai trò'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles.length > 0 ? (
              row.original.roles.map(role => (
                <span key={role} className="px-2 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 rounded text-xs">
                  {role}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Không có</span>
            )}
          </div>
        )
      },
      {
        accessorKey: 'isActive',
        header: t('status', 'Trạng thái'),
        cell: ({ row }) => (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            row.original.isActive 
              ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
              : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
          }`}>
            {row.original.isActive ? t('active', 'Hoạt động') : t('inactive', 'Bị khóa')}
          </span>
        )
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
                setSelectedUser(row.original);
                setIsSheetOpen(true);
              }}
            >
              <Shield size={14} />
              {t('assign_role', 'Phân quyền')}
            </Button>
            <Button 
              variant={row.original.isActive ? "destructive" : "default"}
              size="icon" 
              className="h-8 w-8"
              title={row.original.isActive ? t('ban_user', 'Khóa') : t('unban_user', 'Mở khóa')}
              onClick={() => handleToggleActive(row.original)}
            >
              {row.original.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
            </Button>
          </div>
        )
      }
    ],
    [t]
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      }
    }
  });

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-primary-500" />
            {t('user_config_title', 'Quản lý Người dùng')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('user_config_desc', 'Phân quyền và quản lý tài khoản thủ thư/nhân viên')}
          </p>
        </div>
        
        <Dialog open={showCreateRoleModal} onOpenChange={setShowCreateRoleModal}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Shield size={16} /> Tạo Role mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Role Hệ Thống</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRole} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Tên Role</Label>
                <Input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} required placeholder="Vd: Manager" />
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Input value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} placeholder="Mô tả quyền hạn..." />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '...' : 'Lưu lại'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
        
        {/* Table Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Tìm kiếm người dùng..." 
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter size={16} /> Bộ lọc
          </Button>
        </div>

        {/* Data Table */}
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
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
                <>
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-16 text-center">
                      <Skeleton className="h-10 w-full rounded" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-16 text-center">
                      <Skeleton className="h-10 w-full rounded" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-16 text-center">
                      <Skeleton className="h-10 w-full rounded" />
                    </TableCell>
                  </TableRow>
                </>
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
                    Không tìm thấy dữ liệu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-slate-500">
            Hiển thị {table.getRowModel().rows.length} trong số {table.getPrePaginationRowModel().rows.length} kết quả
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trang trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Trang sau
            </Button>
          </div>
        </div>
      </div>

      {/* Assign Role Drawer (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Quản lý Phân quyền</SheetTitle>
            <SheetDescription>
              Thay đổi vai trò của người dùng {selectedUser?.fullName} ({selectedUser?.email}).
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleAssignRole} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label>Vai trò hệ thống</Label>
              <select 
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:border-primary-500"
                required
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name} - {r.description}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm">
              <span className="font-bold">Lưu ý:</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>Librarian: Chỉ truy cập Lưu thông, Biên mục, Bổ sung.</li>
                <li>Admin: Toàn quyền truy cập cả hệ thống.</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật Quyền'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

    </div>
  );
};
