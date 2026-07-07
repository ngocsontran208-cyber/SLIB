import api from './axios';
import type { AssetMetadataConfig, DrmPolicy } from '@slib/types';

export const damService = {
  // Metadata Configs
  getMetadataConfigs: async (): Promise<AssetMetadataConfig[]> => {
    const res = await api.get('/api/digital-asset/metadata-configs');
    return res.data;
  },
  createMetadataConfig: async (config: AssetMetadataConfig): Promise<AssetMetadataConfig> => {
    const res = await api.post('/api/digital-asset/metadata-configs', config);
    return res.data;
  },
  updateMetadataConfig: async (id: number, config: AssetMetadataConfig): Promise<void> => {
    await api.put(`/api/digital-asset/metadata-configs/${id}`, config);
  },
  deleteMetadataConfig: async (id: number): Promise<void> => {
    await api.delete(`/api/digital-asset/metadata-configs/${id}`);
  },

  // DRM Policies
  getDrmPolicies: async (): Promise<DrmPolicy[]> => {
    const res = await api.get('/api/digital-asset/drm-policies');
    return res.data;
  },
  createDrmPolicy: async (policy: DrmPolicy): Promise<DrmPolicy> => {
    const res = await api.post('/api/digital-asset/drm-policies', policy);
    return res.data;
  },
  updateDrmPolicy: async (id: number, policy: DrmPolicy): Promise<void> => {
    await api.put(`/api/digital-asset/drm-policies/${id}`, policy);
  },
  deleteDrmPolicy: async (id: number): Promise<void> => {
    await api.delete(`/api/digital-asset/drm-policies/${id}`);
  },

  // Secure Streaming Support
  downloadSecureAsset: async (assetId: number, token?: string): Promise<Blob> => {
    const url = token ? `/api/digital-asset/stream/${assetId}?token=${token}` : `/api/digital-asset/stream/${assetId}`;
    const res = await api.get(url, {
      responseType: 'blob'
    });
    return res.data;
  },

  // Register Asset Metadata
  registerDigitalAsset: async (data: { assetIds: number[], drmPolicyId: number, bibliographicRecordId: number }): Promise<void> => {
    await api.post('/api/digital-asset/register', data);
  },
};

export const uploadService = {
  initUpload: async (req: { fileName: string, totalSize: number, contentType: string }): Promise<{ sessionId: string }> => {
    const res = await api.post('/api/upload/init', req);
    return res.data;
  },
  uploadChunk: async (sessionId: string, chunkIndex: number, file: Blob): Promise<void> => {
    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('file', file);
    
    await api.post('/api/upload/chunk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  completeUpload: async (sessionId: string): Promise<{ message: string, filePath: string, checksum: string, assetId: number }> => {
    const formData = new FormData();
    formData.append('sessionId', sessionId);
    const res = await api.post('/api/upload/complete', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};
