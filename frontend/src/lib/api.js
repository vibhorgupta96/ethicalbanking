import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8080/api'
});

export const Api = {
  getUser(userId) {
    return client.get(`/user/${userId}`);
  },
  setConsent(userId, payload) {
    return client.post(`/user/${userId}/trustvault`, payload);
  },
  askAi(body) {
    return client.post('/ask', body);
  }
};

