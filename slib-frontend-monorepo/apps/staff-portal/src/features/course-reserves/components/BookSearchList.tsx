import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Input, Button } from '@slib/ui-core';
import { SearchService } from '@slib/api-client';

export const BookSearchList = () => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            // Dùng Elasticsearch API để tìm kiếm sách
            const res = await SearchService.search(query);
            setResults(res.items || res || []);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, item: any) => {
        // Ta chỉ có ID của BibliographicRecord từ ES. 
        // Nhưng yêu cầu là PhysicalItemId. Để đơn giản ta giả định 
        // ở backend khi kéo thả thả vào ta sẽ map sang PhysicalItem,
        // Hoặc ta truyền metadata
        e.dataTransfer.setData('application/json', JSON.stringify({
            bibliographicRecordId: item.id,
            title: item.title,
            // Ở thực tế cần query PhysicalItems của Bib này
        }));
    };

    return (
        <div className="flex flex-col h-full bg-card rounded-lg shadow-sm border p-4">
            <h2 className="text-lg font-semibold mb-4">{t('courseReserves.bookSearch', 'Search Books')}</h2>
            
            <div className="flex space-x-2 mb-4">
                <Input 
                    placeholder={t('courseReserves.searchPlaceholder', 'Title, ISBN...')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                    <Search className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
                {results.map((item, idx) => (
                    <div 
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        className="p-3 border rounded-md bg-background hover:border-primary/50 cursor-grab active:cursor-grabbing transition-colors"
                    >
                        <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">ID: {item.id}</p>
                    </div>
                ))}
                
                {results.length === 0 && !loading && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                        {t('common.noData', 'No data')}
                    </div>
                )}
            </div>
        </div>
    );
};
