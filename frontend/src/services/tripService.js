import { api } from './api';

export const tripService = {
  createTrip: async (payload) => {
    return api.post('/trips', payload);
  },

  fetchTripDetails: async (tripId) => {
    const path = tripId ? `/trips/${tripId}` : '/trips';
    return api.get(path);
  },

  fetchTripExpenses: async (tripId) => {
    return api.get(`/trips/${tripId}/expenses`);
  },

  fetchTripContributions: async (tripId) => {
    return api.get(`/trips/${tripId}/contributions`);
  },

  fetchTripMembers: async (tripId) => {
    return api.get(`/trips/${tripId}/members`);
  },

  updateTripSettings: async (tripId, payload) => {
    return api.put(`/trips/${tripId}`, payload);
  },

  addExpense: async (tripId, payload) => {
    return api.post(`/trips/${tripId}/expenses`, payload);
  },

  updateExpense: async (tripId, expenseId, payload) => {
    return api.put(`/trips/${tripId}/expenses/${expenseId}`, payload);
  },

  deleteExpense: async (tripId, expenseId) => {
    return api.delete(`/trips/${tripId}/expenses/${expenseId}`);
  },

  addContribution: async (tripId, payload) => {
    return api.post(`/trips/${tripId}/contributions`, payload);
  },

  updateContribution: async (tripId, contributionId, payload) => {
    return api.put(`/trips/${tripId}/contributions/${contributionId}`, payload);
  },

  deleteContribution: async (tripId, contributionId) => {
    return api.delete(`/trips/${tripId}/contributions/${contributionId}`);
  },

  inviteMember: async (tripId, payload) => {
    return api.post(`/trips/${tripId}/members`, payload);
  },

  updateMember: async (tripId, memberId, payload) => {
    return api.put(`/trips/${tripId}/members/${memberId}`, payload);
  },

  removeMember: async (tripId, memberId) => {
    return api.delete(`/trips/${tripId}/members/${memberId}`);
  },

  fetchMemberTemporaryPassword: async (tripId, memberId) => {
    return api.get(`/trips/${tripId}/members/${memberId}/password`);
  }
};
