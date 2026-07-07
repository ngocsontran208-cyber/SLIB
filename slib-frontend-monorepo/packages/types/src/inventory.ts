export interface StocktakeSession {
    id: number;
    name: string;
    startTime: string;
    endTime?: string;
    status: string;
    createdBy: string;
    scans?: StocktakeScan[];
}

export interface StocktakeScan {
    id: number;
    sessionId: number;
    physicalItemId: number;
    scannedAt: string;
    expectedStatus: string;
    resultColor: string;
    physicalItem?: any;
}

export interface CreateSessionRequest {
    name: string;
}

export interface ScanRequest {
    sessionId: number;
    barcode: string;
}
