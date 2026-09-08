import api from './api';

export const offboardingService = {
  getOffboardings: async (params) => {
    return api.get('/offboarding', { params });
  },
  getOffboardingById: async (id) => {
    return api.get(`/offboarding/${id}`);
  },
  createOffboarding: async (data) => {
    return api.post('/offboarding', data);
  },
  updateOffboarding: async (id, data) => {
    return api.put(`/offboarding/${id}`, data);
  },
  cancelOffboarding: async (id, reason) => {
    return api.post(`/offboarding/${id}/cancel`, { reason });
  }
};
