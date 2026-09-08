import api from './api';

export const accessRevocationService = {
  getAll: async () => {
    return api.get('/access-revocation');
  },
  getByCase: async (offboardingId) => {
    return api.get(`/access-revocation/${offboardingId}`);
  },
  revokeSingle: async (offboardingId, data) => {
    return api.post(`/access-revocation/${offboardingId}/revoke`, data);
  },
  revokeAll: async (offboardingId, data) => {
    return api.post(`/access-revocation/${offboardingId}/revoke-all`, data);
  }
};
