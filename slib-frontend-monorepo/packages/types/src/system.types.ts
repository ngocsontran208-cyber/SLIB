export interface SruTarget {
  id: number;
  name: string;
  baseUrl: string;
  isActive: boolean;
}

export interface Sip2Device {
  id: number;
  name: string;
  ipAddress: string;
  port: number;
  location: string;
  isActive: boolean;
  createdAt: string;
}

export interface LibraryPolicy {
  id: number;
  policyKey: string;
  policyValue: string;
  description?: string;
  updatedAt: string;
  updatedBy?: string;
}
