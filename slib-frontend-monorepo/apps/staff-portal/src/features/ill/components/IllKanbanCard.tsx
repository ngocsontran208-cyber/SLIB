import React from 'react';
import type { IllRequest } from '@slib/types';
import { Book, User, Calendar } from 'lucide-react';

interface IllKanbanCardProps {
    request: IllRequest;
    onDragStart: (e: React.DragEvent, id: number) => void;
}

export const IllKanbanCard: React.FC<IllKanbanCardProps> = ({ request, onDragStart }) => {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, request.id)}
            className="bg-card border p-3 rounded shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
        >
            <h4 className="font-semibold text-sm line-clamp-2 mb-2 flex items-start gap-2">
                <Book className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {request.title}
            </h4>
            
            <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span className="line-clamp-1">{request.author}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <span className="font-medium text-foreground">
                        {request.partner?.name || 'Partner'}
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                        <Calendar className="w-3 h-3" />
                        {new Date(request.requestedAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
};
