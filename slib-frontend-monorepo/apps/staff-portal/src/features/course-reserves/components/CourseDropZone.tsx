import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { courseService } from '@slib/api-client';
import type { Course } from '@slib/types';
import { Button, useToast } from '@slib/ui-core';
import { Trash2 } from 'lucide-react';

interface CourseDropZoneProps {
    course: Course;
    onItemAdded: () => void;
}

export const CourseDropZone: React.FC<CourseDropZoneProps> = ({ course, onItemAdded }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isDragOver, setIsDragOver] = useState(false);

    const activeList = course.reserveLists?.find((l: any) => l.status === 'Active');

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const dataStr = e.dataTransfer.getData('application/json');
        if (!dataStr) return;
        
        try {
            const data = JSON.parse(dataStr);
            if (!activeList) {
                toast({
                    title: 'Lỗi',
                    description: 'Môn học này chưa có danh sách dự khóa Active.',
                    variant: 'destructive'
                });
                return;
            }

            // Note: In real app, we need to let user pick a PhysicalItem (barcode) 
            // since BibliographicRecord can have many items. For demo, we just assume physicalItemId = data.bibliographicRecordId
            await courseService.addItemToReserveList({
                courseReserveListId: activeList.id,
                physicalItemId: data.bibliographicRecordId, // Demo mapping
                reservePolicy: '2 Hours' // Default policy
            });

            toast({
                title: 'Thành công',
                description: `Đã thêm tài liệu vào ${course.name}`,
            });

            onItemAdded();
        } catch (error) {
            console.error('Drop error', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể thêm tài liệu vào danh sách.',
                variant: 'destructive'
            });
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        try {
            await courseService.removeItemFromReserveList(itemId);
            toast({ title: 'Đã xóa tài liệu' });
            onItemAdded();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div 
            className={`border-2 rounded-xl p-4 transition-all ${isDragOver ? 'border-primary bg-primary/5 border-dashed scale-[1.02]' : 'border-border bg-card'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold">{course.code} - {course.name}</h3>
                    <p className="text-sm text-muted-foreground">{course.instructor?.name}</p>
                </div>
                {activeList ? (
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold">Active List: {activeList.term}</span>
                ) : (
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-semibold">No Active List</span>
                )}
            </div>

            <div className="space-y-2 mt-4 min-h-[100px]">
                {activeList?.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-md text-sm">
                        <div className="flex flex-col">
                            <span className="font-medium line-clamp-1">
                                {item.physicalItem?.bibliographicRecord?.title || `Physical Item ID: ${item.physicalItemId}`}
                            </span>
                            <span className="text-xs text-primary mt-1">Policy: {item.reservePolicy}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                ))}

                {(!activeList?.items || activeList.items.length === 0) && (
                    <div className="flex items-center justify-center h-full min-h-[100px] text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                        {t('courseReserves.dropZoneHint', 'Kéo thả sách vào đây...')}
                    </div>
                )}
            </div>
        </div>
    );
};
