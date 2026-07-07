import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { StocktakeSession } from '@slib/types';
import { inventoryService } from '@slib/api-client';
import { Button, Input } from '@slib/ui-core';
import { useSignalR } from '../../../hooks/useSignalR';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StocktakeSessionViewProps {
    session: StocktakeSession;
    onClose: () => void;
}

export const StocktakeSessionView: React.FC<StocktakeSessionViewProps> = ({ session, onClose }) => {
    const { t } = useTranslation();
    
    // Connect to NotificationHub to listen to scans
    const hubUrl = `${(inventoryService as any).api?.defaults?.baseURL?.replace('/api', '') || 'http://localhost:5132'}/notificationHub`;
    const { inventoryScans } = useSignalR(hubUrl);
    
    const [barcode, setBarcode] = useState('');

    const handleSimulateScan = async () => {
        if (!barcode.trim()) return;
        try {
            await inventoryService.scanBarcode({
                sessionId: session.id,
                barcode: barcode
            });
            setBarcode('');
        } catch (error) {
            console.error('Scan failed', error);
        }
    };

    // Filter scans by color for display
    // SignalR adds the latest to the beginning of the array.
    const greenScans = inventoryScans.filter(s => s.resultColor === 'Green');
    const redScans = inventoryScans.filter(s => s.resultColor === 'Red');
    const yellowScans = inventoryScans.filter(s => s.resultColor === 'Yellow');

    return (
        <div className="flex flex-col h-full bg-background rounded-lg">
            <div className="flex justify-between items-center p-4 border-b">
                <div>
                    <h2 className="text-xl font-bold">{session.name}</h2>
                    <p className="text-sm text-muted-foreground">ID: {session.id} | Bắt đầu: {new Date(session.startTime).toLocaleString()}</p>
                </div>
                <Button variant="outline" onClick={onClose}>Đóng phiên</Button>
            </div>

            <div className="p-4 bg-muted/30 border-b flex space-x-4 items-center">
                <Input 
                    placeholder="Giả lập Barcode/EPC từ thiết bị RFID..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSimulateScan()}
                    className="max-w-md"
                />
                <Button onClick={handleSimulateScan}>Giả lập Quét (Test)</Button>
                <div className="text-sm text-muted-foreground ml-auto animate-pulse">
                    Đang lắng nghe thiết bị RFID...
                </div>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-6 p-6 overflow-y-auto">
                {/* Cột Xanh */}
                <div className="flex flex-col bg-card border-t-4 border-t-green-500 rounded-lg shadow-sm">
                    <div className="p-3 bg-green-50/50 border-b flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                        <h3 className="font-semibold text-green-700">Đúng vị trí ({greenScans.length})</h3>
                    </div>
                    <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                        {greenScans.map(scan => (
                            <div key={scan.id} className="p-2 text-sm border rounded bg-background shadow-sm border-l-4 border-l-green-500">
                                <p className="font-medium">{scan.physicalItem?.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">Barcode: {scan.physicalItem?.barcode}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cột Vàng */}
                <div className="flex flex-col bg-card border-t-4 border-t-yellow-500 rounded-lg shadow-sm">
                    <div className="p-3 bg-yellow-50/50 border-b flex items-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                        <h3 className="font-semibold text-yellow-700">Sai kho/Luân chuyển ({yellowScans.length})</h3>
                    </div>
                    <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                        {yellowScans.map(scan => (
                            <div key={scan.id} className="p-2 text-sm border rounded bg-background shadow-sm border-l-4 border-l-yellow-500">
                                <p className="font-medium">{scan.physicalItem?.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Barcode: {scan.physicalItem?.barcode} - <span className="text-yellow-600 font-semibold">{scan.expectedStatus}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cột Đỏ */}
                <div className="flex flex-col bg-card border-t-4 border-t-red-500 rounded-lg shadow-sm">
                    <div className="p-3 bg-red-50/50 border-b flex items-center">
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                        <h3 className="font-semibold text-red-700">Báo mất/Đang cho mượn ({redScans.length})</h3>
                    </div>
                    <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                        {redScans.map(scan => (
                            <div key={scan.id} className="p-2 text-sm border rounded bg-background shadow-sm border-l-4 border-l-red-500">
                                <p className="font-medium">{scan.physicalItem?.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Barcode: {scan.physicalItem?.barcode} - <span className="text-red-600 font-bold uppercase">{scan.expectedStatus}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
