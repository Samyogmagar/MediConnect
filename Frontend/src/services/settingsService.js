import API from '../config/api';

const settingsService = {
  async getSettings() {
    const response = await API.get('/settings');
    return response.data;
  },

  async updateSettings(payload) {
    const response = await API.put('/settings', payload);
    return response.data;
  },
};

export default settingsService;
