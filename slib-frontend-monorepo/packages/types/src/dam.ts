export enum AssetType {
  PDF = 0,
  Video = 1,
  Audio = 2,
  Image = 3,
  Other = 4
}

export interface AssetMetadataConfig {
  id?: number;
  assetType: AssetType;
  fieldName: string;
  dataType: string;
  isRequired: boolean;
  isSearchable: boolean;
}

export interface DrmPolicy {
  id?: number;
  policyName: string;
  allowDownload: boolean;
  watermarkText?: string | null;
  maxPreviewPages: number;
  expirationDays: number;
}
