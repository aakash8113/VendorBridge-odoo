import api from './api.js';

export const listActivityLogs = (params) => api.get('/activity', { params });
export const getMyActivityLogs = (params) => api.get('/activity/mine', { params });
