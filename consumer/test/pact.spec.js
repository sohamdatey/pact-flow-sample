const { PactV3, Matchers } = require('@pact-foundation/pact');
const path = require('path');
const ProviderClient = require('../src/providerClient');

const { integer, string, regex } = Matchers;

// Create a Pact instance
const pact = new PactV3({
  consumer: 'Consumer',
  provider: 'Provider',
  dir: path.join(__dirname, '../../pacts')
});

describe('Consumer Pact Tests', () => {
  describe('Health endpoint', () => {
    it('should get provider health status', async () => {
      // Define the interaction
      await pact.addInteraction({
        states: [{ description: 'provider is healthy' }],
        uponReceiving: 'a health check request',
        withRequest: {
          method: 'GET',
          path: '/health'
        },
        willRespondWith: {
          status: 200,
          body: {
            status: 'OK',
            service: 'Provider'
          }
        }
      });

      // Execute with mocked provider
      return pact.executeTest(async (mockProvider) => {
        const client = new ProviderClient(mockProvider.url);
        const health = await client.getHealth();
        expect(health.status).toBe('OK');
        expect(health.service).toBe('Provider');
        expect(health.message).toBe("Health check successful");
      });
    });
  });

  describe('Get User endpoint', () => {
    it('should get user by ID', async () => {
      await pact.addInteraction({
        states: [{ description: 'user 1 exists' }],
        uponReceiving: 'a request to get user 1',
        withRequest: {
          method: 'GET',
          path: '/user/1'
        },
        willRespondWith: {
          status: regex('20[0-4]', '200'),
          body: {
            id: integer(1),
            name: string('John Doe'),
            email: regex('[\\w\\.-]+@[\\w\\.-]+\\.\\w+', 'john@example.com')
          }
        }
      });

      return pact.executeTest(async (mockProvider) => {
        const client = new ProviderClient(mockProvider.url);
        const user = await client.getUserById('1');
        expect(user.id).toBe('1');
        expect(user.name).toBe('John Doe');
        expect(user.email).toBe('john@example.com');
      });
    });

    it('should return 404 for non-existent user', async () => {
      await pact.addInteraction({
        states: [{ description: 'user does not exist' }],
        uponReceiving: 'a request to get non-existent user',
        withRequest: {
          method: 'GET',
          path: '/user/999'
        },
        willRespondWith: {
          status: 404,
          body: {
            error: 'User not found'
          }
        }
      });

      return pact.executeTest(async (mockProvider) => {
        const client = new ProviderClient(mockProvider.url);
        const user = await client.getUserById('999');
        expect(user).toBeNull();
      });
    });
  });

  describe('Create User endpoint', () => {
    it('should create a new user', async () => {
      await pact.addInteraction({
        states: [{ description: 'a new user can be created' }],
        uponReceiving: 'a request to create a new user',
        withRequest: {
          method: 'POST',
          path: '/user',
          body: {
            name: 'Alice Johnson',
            email: 'alice@example.com'
          }
        },
        willRespondWith: {
          status: 201,
          body: {
            id: '3',
            name: 'Alice Johnson',
            email: 'alice@example.com'
          }
        }
      });

      return pact.executeTest(async (mockProvider) => {
        const client = new ProviderClient(mockProvider.url);
        const newUser = await client.createUser('Alice Johnson', 'alice@example.com');
        expect(newUser.id).toBe('3');
        expect(newUser.name).toBe('Alice Johnson');
        expect(newUser.email).toBe('alice@example.com');
      });
    });
  });
});
