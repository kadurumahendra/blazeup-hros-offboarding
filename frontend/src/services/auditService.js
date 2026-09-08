import api from './api';

export const auditService = {
  getAuditLogs: async (params) => {
    return api.get('/audit-logs', { params });
  },
  getStats: async () => {
    return api.get('/audit-logs/stats');
  }
};
