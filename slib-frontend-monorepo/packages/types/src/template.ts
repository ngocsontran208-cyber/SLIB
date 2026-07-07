export interface NotificationTemplate {
    id: number;
    name: string;
    type: 'Email' | 'ZPL'; // Email cho thông báo, ZPL cho máy in mã vạch
    content: string; // HTML hoặc ZPL raw string có chứa biến
    defaultVariables?: string; // JSON chứa danh sách các biến hợp lệ, ví dụ: ["PatronName", "DueDate", "Title"]
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PreviewTemplateRequest {
    templateId?: number;
    content?: string;
    type: 'Email' | 'ZPL';
    mockData: Record<string, string>;
}

export interface PreviewTemplateResponse {
    renderedContent: string;
}
