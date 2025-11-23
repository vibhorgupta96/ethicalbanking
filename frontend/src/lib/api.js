import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8080/api'
});

export const Api = {
  getUser(userId) {
    return client.get(`/user/${userId}`);
  },
  listUsers() {
    return client.get('/user');
  },
  login(body) {
    return client.post('/user/login', body);
  },
  setConsent(userId, payload) {
    return client.post(`/user/${userId}/trustvault`, payload);
  },
  askAi(body) {
    return client.post('/ask', body);
  },
  getDecisionInsight(userId) {
    return client.get(`/decision/${userId}`);
  },
  getFairGuardSummary() {
    return client.get('/fairguard/summary');
  },
  simulateFairGuard() {
    return client.post('/fairguard/simulate');
  }
};

