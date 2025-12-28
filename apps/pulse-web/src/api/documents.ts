import api from './client';

// Types
export interface Document {
  id: number;
  name: string;
  type: string;
  category: string;
  size: number;
  mime_type: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  tags: string[];
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  ai_summary?: string;
  ai_insights?: string[];
  shared_with?: string[];
}

export interface DocumentVersion {
  id: number;
  version: number;
  filename: string;
  size: number;
  uploaded_by: string;
  changes: string;
  created_at: string;
}

export interface DocumentShare {
  id: number;
  document_id: number;
  shared_with: string;
  permission: 'view' | 'edit' | 'admin';
  shared_by: string;
  shared_at: string;
  expires_at?: string;
}

export interface DocumentAnalysis {
  summary: string;
  key_points: string[];
  entities: { type: string; value: string }[];
  sentiment: string;
  topics: string[];
  risks?: string[];
  recommendations?: string[];
}

// API Functions
export const documentsApi = {
  // Get all documents
  getDocuments: async (params?: { category?: string; status?: string; search?: string }) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  // Get document by ID
  getDocument: async (id: number) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Upload document
  uploadDocument: async (file: File, metadata: { category: string; tags?: string[] }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', metadata.category);
    if (metadata.tags) {
      formData.append('tags', JSON.stringify(metadata.tags));
    }
    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update document metadata
  updateDocument: async (id: number, data: Partial<Document>) => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  // Delete document
  deleteDocument: async (id: number) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  // Get document versions
  getVersions: async (id: number) => {
    const response = await api.get(`/documents/${id}/versions`);
    return response.data;
  },

  // Upload new version
  uploadVersion: async (id: number, file: File, changes: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('changes', changes);
    const response = await api.post(`/documents/${id}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Restore version
  restoreVersion: async (documentId: number, versionId: number) => {
    const response = await api.post(`/documents/${documentId}/versions/${versionId}/restore`);
    return response.data;
  },

  // Share document
  shareDocument: async (id: number, data: { email: string; permission: string; expires_at?: string }) => {
    const response = await api.post(`/documents/${id}/share`, data);
    return response.data;
  },

  // Get shares
  getShares: async (id: number) => {
    const response = await api.get(`/documents/${id}/shares`);
    return response.data;
  },

  // Remove share
  removeShare: async (documentId: number, shareId: number) => {
    const response = await api.delete(`/documents/${documentId}/shares/${shareId}`);
    return response.data;
  },

  // Analyze document with AI
  analyzeDocument: async (id: number) => {
    const response = await api.post(`/documents/${id}/analyze`);
    return response.data;
  },

  // Get document categories
  getCategories: async () => {
    const response = await api.get('/documents/categories');
    return response.data;
  },

  // Search documents
  searchDocuments: async (query: string) => {
    const response = await api.get('/documents/search', { params: { q: query } });
    return response.data;
  },

  // Get recent documents
  getRecentDocuments: async (limit: number = 10) => {
    const response = await api.get('/documents/recent', { params: { limit } });
    return response.data;
  },

  // Get shared with me
  getSharedWithMe: async () => {
    const response = await api.get('/documents/shared-with-me');
    return response.data;
  },

  // Download document
  downloadDocument: async (id: number) => {
    const response = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
    return response.data;
  }
};

export default documentsApi;
