const { Verifier } = require('@pact-foundation/pact');
const path = require('path');
const app = require('../src/app');

describe('Provider Pact Verification', () => {
  let server;
  const port = 3000;

  beforeAll(() => {
    return new Promise((resolve) => {
      server = app.listen(port, () => {
        console.log(`Provider test server running on port ${port}`);
        resolve();
      });
    });
  });

  afterAll(() => {
    if (server) {
      return new Promise((resolve) => {
        server.close(() => {
          console.log('Provider test server closed');
          resolve();
        });
      });
    }
  });

  it('should validate the expectations of consumer', async () => {
    const opts = {
      // Note: relative path from provider folder
      pactUrls: [path.join(__dirname, '../../pacts/consumer-provider.json')],
      provider: 'Provider',
      providerBaseUrl: `http://localhost:${port}`,
      stateHandlers: {
        'user 1 exists': async () => {
          // This state is already set in our mock database
          return true;
        },
        'user does not exist': async () => {
          // This state is implicit - just don't find the user
          return true;
        },
        'a new user can be created': async () => {
          // Reset or prepare state for user creation
          return true;
        }
      }
    };

    // Verify the pact
    const output = await new Verifier(opts).verifyProvider();
    expect(output).toBeDefined();
  });
});
