import api from './api';

export const dashboardService = {
  getMetrics: async () => {
    return api.get('/dashboard/metrics');
  }
};
