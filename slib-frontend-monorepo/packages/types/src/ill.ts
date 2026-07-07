export interface IllPartner {
    id: number;
    name: string;
    email: string;
    contactPerson: string;
    apiEndpoint: string;
}

export interface IllRequest {
    id: number;
    patronId: number;
    patron?: any;
    title: string;
    author: string;
    partnerId: number;
    partner?: IllPartner;
    status: string;
    requestedAt: string;
    expectedDate?: string;
}
