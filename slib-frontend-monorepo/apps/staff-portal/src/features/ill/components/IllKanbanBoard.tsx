import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IllRequest } from '@slib/types';
import { illService } from '@slib/api-client';
import { IllKanbanColumn } from './IllKanbanColumn';
import { Button, useToast } from '@slib/ui-core';
import { RefreshCw } from 'lucide-react';

const KANBAN_COLUMNS = [
    { id: 'Pending', label: 'Chờ duyệt (Pending)' },
    { id: 'InTransit', label: 'Đang vận chuyển (In Transit)' },
    { id: 'Received', label: 'Đã nhận (Received)' },
    { id: 'Returned', label: 'Đã trả (Returned)' }
];

export const IllKanbanBoard = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [requests, setRequests] = useState<IllRequest[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await illService.getRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch ILL requests', error);
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải danh sách ILL.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleDrop = async (id: number, newStatus: string) => {
        const req = requests.find(r => r.id === id);
        if (!req || req.status === newStatus) return;

        // Optimistic update
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));

        try {
            await illService.updateStatus(id, newStatus);
            toast({
                title: 'Cập nhật thành công',
                description: `Đã chuyển yêu cầu sang trạng thái ${newStatus}.`,
            });
            
            if (newStatus === 'Received') {
                toast({
                    title: 'Đã gửi thông báo',
                    description: 'Hệ thống đã tự động báo cho Sinh viên ra nhận sách.',
                });
            }
        } catch (error) {
            console.error(error);
            // Revert on error
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: req.status } : r));
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể cập nhật trạng thái.',
            });
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-[1400px] h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Mượn liên thư viện (ILL Kanban)
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Kéo thả các yêu cầu mượn qua các cột để đổi trạng thái. Khi kéo vào "Đã nhận", hệ thống sẽ báo cho sinh viên.
                    </p>
                </div>
                <Button variant="outline" onClick={fetchRequests} disabled={loading} className="gap-2">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </Button>
            </div>

            <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                {KANBAN_COLUMNS.map(col => (
                    <IllKanbanColumn
                        key={col.id}
                        title={col.label}
                        status={col.id}
                        requests={requests.filter(r => r.status === col.id)}
                        onDrop={handleDrop}
                    />
                ))}
            </div>
        </div>
    );
};
