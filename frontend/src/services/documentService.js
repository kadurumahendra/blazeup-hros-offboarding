import api from './api';

export const documentService = {
  generateDocument: async (data) => {
    return api.post('/documents/generate', data);
  },
  getDocumentsByOffboarding: async (offboardingId) => {
    return api.get(`/documents/offboarding/${offboardingId}`);
  },
  getClauses: async () => {
    return api.get('/documents/settings/clauses');
  },
  updateClauses: async (data) => {
    return api.put('/documents/settings/clauses', data);
  },
  downloadPDFBlob: async (docId) => {
    const token = localStorage.getItem('blazeup_token');
    const response = await fetch(`/api/documents/${docId}/download?token=${encodeURIComponent(token || '')}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) {
      throw new Error(`Failed to load document: ${response.statusText}`);
    }
    return response.blob();
  },
  getDownloadUrl: (docId) => {
    const token = localStorage.getItem('blazeup_token');
    return `/api/documents/${docId}/download?token=${encodeURIComponent(token || '')}`;
  }
};
