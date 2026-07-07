import React, { useState } from 'react';
import type { IllRequest } from '@slib/types';
import { IllKanbanCard } from './IllKanbanCard';

interface IllKanbanColumnProps {
    title: string;
    status: string;
    requests: IllRequest[];
    onDrop: (id: number, newStatus: string) => void;
}

export const IllKanbanColumn: React.FC<IllKanbanColumnProps> = ({ title, status, requests, onDrop }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDropEvent = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const requestId = parseInt(e.dataTransfer.getData('requestId'), 10);
        if (requestId) {
            onDrop(requestId, status);
        }
    };

    const handleDragStart = (e: React.DragEvent, id: number) => {
        e.dataTransfer.setData('requestId', id.toString());
    };

    return (
        <div 
            className={`flex flex-col bg-muted/30 border rounded-xl overflow-hidden min-w-[280px] transition-colors ${isDragOver ? 'border-primary bg-primary/5' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropEvent}
        >
            <div className="p-3 bg-muted border-b flex justify-between items-center">
                <h3 className="font-semibold text-sm">{title}</h3>
                <span className="bg-background px-2 py-0.5 rounded-full text-xs font-medium border text-muted-foreground">
                    {requests.length}
                </span>
            </div>

            <div className="flex-1 p-2 overflow-y-auto space-y-2 min-h-[150px]">
                {requests.map(req => (
                    <IllKanbanCard key={req.id} request={req} onDragStart={handleDragStart} />
                ))}
                
                {requests.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                        Kéo thả vào đây...
                    </div>
                )}
            </div>
        </div>
    );
};
