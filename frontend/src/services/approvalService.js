import api from './api';

export const approvalService = {
  getMyTasks: async () => {
    return api.get('/approvals/my-tasks');
  },
  getTaskById: async (id) => {
    return api.get(`/approvals/${id}`);
  },
  approveTask: async (id, data) => {
    return api.post(`/approvals/${id}/approve`, data);
  },
  rejectTask: async (id, data) => {
    return api.post(`/approvals/${id}/reject`, data);
  },
  sendReminder: async (id, stageId) => {
    return api.post(`/approvals/${id}/reminder`, { stageId });
  }
};
