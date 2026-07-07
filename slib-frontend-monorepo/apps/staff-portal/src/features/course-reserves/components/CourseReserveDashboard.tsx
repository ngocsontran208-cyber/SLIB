import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookSearchList } from './BookSearchList';
import { CourseDropZone } from './CourseDropZone';
import { courseService } from '@slib/api-client';
import type { Course } from '@slib/types';

export const CourseReserveDashboard = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState<Course[]>([]);

    const fetchCourses = async () => {
        try {
            const data = await courseService.getCourses();
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <div className="container mx-auto p-6 max-w-7xl h-[calc(100vh-100px)]">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                    {t('courseReserves.title', 'Tài liệu Dự khóa (Course Reserves)')}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {t('courseReserves.description', 'Kéo thả tài liệu để gán vào các môn học tương ứng.')}
                </p>
            </div>

            <div className="flex gap-6 h-[calc(100%-80px)]">
                {/* Cột trái: Tìm kiếm sách */}
                <div className="w-1/3 min-w-[300px]">
                    <BookSearchList />
                </div>

                {/* Cột phải: Danh sách môn học (Dropzones) */}
                <div className="w-2/3 overflow-y-auto space-y-6 pr-2 pb-10">
                    {courses.map(course => (
                        <CourseDropZone 
                            key={course.id} 
                            course={course} 
                            onItemAdded={fetchCourses}
                        />
                    ))}
                    
                    {courses.length === 0 && (
                        <div className="text-center p-12 bg-card border rounded-lg text-muted-foreground">
                            Chưa có dữ liệu môn học. Vui lòng thêm trong Database (Seed Data).
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
