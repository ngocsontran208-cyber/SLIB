import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { StocktakeSession } from '@slib/types';
import { inventoryService } from '@slib/api-client';
import { Button } from '@slib/ui-core';
import { StocktakeSessionView } from './StocktakeSessionView';

export const InventoryDashboard = () => {
    const { t } = useTranslation();
    const [sessions, setSessions] = useState<StocktakeSession[]>([]);
    const [activeSession, setActiveSession] = useState<StocktakeSession | null>(null);

    const fetchSessions = async () => {
        try {
            const data = await inventoryService.getSessions();
            setSessions(data);
        } catch (error) {
            console.error('Failed to fetch sessions', error);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleCreateSession = async () => {
        const name = prompt('Tên phiên kiểm kê (VD: Kho Mở Tầng 2):');
        if (!name) return;

        try {
            const newSession = await inventoryService.createSession({ name });
            setSessions([newSession, ...sessions]);
            setActiveSession(newSession);
        } catch (error) {
            console.error(error);
        }
    };

    if (activeSession) {
        return <StocktakeSessionView session={activeSession} onClose={() => setActiveSession(null)} />;
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t('inventory.title', 'Kiểm kê Kho (Stocktaking)')}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('inventory.description', 'Quản lý các phiên kiểm kê và nhận dữ liệu thời gian thực từ gậy RFID.')}
                    </p>
                </div>
                <Button onClick={handleCreateSession}>+ Tạo phiên kiểm kê mới</Button>
            </div>

            <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted text-muted-foreground">
                        <tr>
                            <th className="p-4 font-medium">ID</th>
                            <th className="p-4 font-medium">Tên phiên</th>
                            <th className="p-4 font-medium">Bắt đầu</th>
                            <th className="p-4 font-medium">Trạng thái</th>
                            <th className="p-4 font-medium">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {sessions.map(session => (
                            <tr key={session.id} className="hover:bg-muted/50 transition-colors">
                                <td className="p-4">{session.id}</td>
                                <td className="p-4 font-medium">{session.name}</td>
                                <td className="p-4">{new Date(session.startTime).toLocaleString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'InProgress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {session.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <Button variant="outline" size="sm" onClick={() => setActiveSession(session)}>
                                        Mở phiên
                                    </Button>
                                </td>
                            </tr>
                        ))}

                        {sessions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    Chưa có phiên kiểm kê nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
