export const AssetType = {
  PDF: 0,
  Video: 1,
  Audio: 2,
  Image: 3,
  Other: 4
} as const;

export type AssetType = typeof AssetType[keyof typeof AssetType];

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
