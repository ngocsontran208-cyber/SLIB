export * from './user.types';
export * from './cataloging.types';

export interface AuthorityRecord {
  id: number;
  authorityType: string;
  mainEntry: string;
  fields: any[]; // MarcField[]
  createdAt: string;
  updatedAt?: string;
}

export interface BibAuthorityLink {
  id: number;
  bibliographicRecordId: number;
  authorityRecordId: number;
  linkedTag: string;
}

export interface SerialSubscription {
  id: number;
  bibliographicRecordId: number;
  purchaseOrderLineId?: number;
  source: string;
  title: string;
  issn: string;
  startDate: string;
  endDate: string;
  status: string;
  predictionPatterns?: PredictionPattern[];
  issues?: SerialIssue[];
}

export interface PredictionPattern {
  id: number;
  serialSubscriptionId: number;
  marcPattern: string;
  frequency: string;
  volumeCaption: string;
  issueCaption: string;
}

export interface SerialIssue {
  id: number;
  serialSubscriptionId: number;
  enumeration: string;
  chronology: string;
  expectedDate: string;
  status: string;
  physicalItemId?: number;
}

export * from './course';
export * from './inventory';
export * from './ill';
export * from './circulation.types';
export * from './template';
export * from './acquisition.types';
export * from './erm.types';
export * from './system.types';
