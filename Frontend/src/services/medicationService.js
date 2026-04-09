import API from '../config/api';

const medicationService = {
  async getMedications(filters = {}) {
    const response = await API.get('/medications', { params: filters });
    return response.data;
  },

  async getMedicationById(id) {
    const response = await API.get(`/medications/${id}`);
    return response.data;
  },
};

export default medicationService;
