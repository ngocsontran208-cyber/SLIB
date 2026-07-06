export interface ElectronicResourceLicense {
  id: number;
  vendorId: number;
  resourceName: string;
  cost: number;
  concurrentUsers: number;
  validFrom: string;
  validTo: string;
  sushiApiUrl?: string;
  sushiApiKey?: string;
  requestorId?: string;
}

export interface CounterStatistic {
  id: number;
  licenseId: number;
  reportingMonth: string;
  metricType: string;
  totalRequests: number;
  successfulArticleRequests: number;
}
