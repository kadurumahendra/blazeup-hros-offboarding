import api from './api';

export const workflowService = {
  getTemplates: async (params) => {
    return api.get('/workflows', { params });
  },
  getTemplateById: async (id) => {
    return api.get(`/workflows/${id}`);
  },
  createTemplate: async (data) => {
    return api.post('/workflows', data);
  },
  updateTemplate: async (id, data) => {
    return api.put(`/workflows/${id}`, data);
  },
  duplicateTemplate: async (id) => {
    return api.post(`/workflows/${id}/duplicate`);
  }
};
