const axios = require('axios');

class ProviderClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000
    });
  }

  // Call provider health check
  async getHealth() {
    try {
      const response = await this.client.get('/health');
      return {
        status: response.data.status,
        service: response.data.service,
        message: "Health check successful"
      }
    } catch (error) {
      console.error('Health check failed:', error.message);
      throw error;
    }
  }

  // Get user by ID from provider
  async getUserById(userId) {
    try {
      const response = await this.client.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`User ${userId} not found`);
        return null;
      }
      console.error('Get user failed:', error.message);
      throw error;
    }
  }

  // Create new user in provider
  async createUser(name, email) {
    try {
      const response = await this.client.post('/user', { name, email });
      return response.data;
    } catch (error) {
      console.error('Create user failed:', error.message);
      throw error;
    }
  }
}

module.exports = ProviderClient;
