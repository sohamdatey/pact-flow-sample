# Pact-Flow Contract Testing Demo

A minimal example demonstrating how pact-flow contract testing works with a Provider service and Consumer service.

## Project Structure

```
pact-flow/
├── provider/           # Provider service with Express APIs
├── consumer/           # Consumer service that calls provider APIs
├── pacts/              # Generated pact files (contract definitions)
└── package.json        # Root package.json with workspaces
```

## Components

### Provider Service (Port 3000)

Express server that exposes 3 APIs:

1. **GET /health** - Health check endpoint
   - Returns: `{ status: "OK", service: "Provider" }`

2. **GET /user/:id** - Get user by ID
   - Returns: `{ id, name, email }` or 404 error

3. **POST /user** - Create new user
   - Body: `{ name, email }`
   - Returns: `{ id, name, email }`

### Consumer Service (Port 3001)

Node.js service that consumes provider APIs:

- **ProviderClient** - Client class to call provider APIs
- **GET /consumer/user/:id** - Endpoint that fetches user from provider
- **GET /consumer/health** - Endpoint that checks provider health

## How Pact Contract Testing Works

### Pact Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PACT CONTRACT TESTING FLOW                       │
└─────────────────────────────────────────────────────────────────────┘

PHASE 1: CONSUMER DEFINES CONTRACT
╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║  Consumer Service                                                   ║
║  ┌───────────────────────────────────────────────────────────┐    ║
║  │ Consumer Test (pact.spec.js)                              │    ║
║  │ ┌─────────────────────────────────────────────────────┐   │    ║
║  │ │ 1. Define expected interactions:                   │   │    ║
║  │ │    - GET /health → 200 {status: "OK"}             │   │    ║
║  │ │    - GET /user/1 → 200 {id, name, email}          │   │    ║
║  │ │    - POST /user → 201 {id, name, email}           │   │    ║
║  │ │                                                     │   │    ║
║  │ │ 2. Run tests with MOCK Provider                   │   │    ║
║  │ │ 3. Pact library records all interactions           │   │    ║
║  │ └─────────────────────────────────────────────────────┘   │    ║
║  └───────────────────────────────────────────────────────────┘    ║
║                              ↓                                     ║
║                      GENERATES PACT FILE                           ║
║                   pacts/Consumer-Provider.json                     ║
║                   (Contract Definition)                            ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝

PHASE 2: PROVIDER VERIFIES CONTRACT
╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║  Provider Service                                                   ║
║  ┌───────────────────────────────────────────────────────────┐    ║
║  │ Provider Test (pact.spec.js)                              │    ║
║  │ ┌─────────────────────────────────────────────────────┐   │    ║
║  │ │ 1. Read pact file (Consumer's expectations)       │   │    ║
║  │ │ 2. Start actual Provider service                  │   │    ║
║  │ │ 3. Replay all interactions against Provider       │   │    ║
║  │ │ 4. Verify responses match contract                │   │    ║
║  │ │                                                     │   │    ║
║  │ │ Result: ✓ All interactions verified               │   │    ║
║  │ │      OR ✗ Contract broken - tests FAIL            │   │    ║
║  │ └─────────────────────────────────────────────────────┘   │    ║
║  └───────────────────────────────────────────────────────────┘    ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝

BENEFITS
┌─────────────────────────────────────────────────────────────────────┐
│ ✓ Consumer clearly documents API expectations                       │
│ ✓ Provider knows exactly what NOT to break                          │
│ ✓ Detects breaking changes before production                        │
│ ✓ Enables independent development of Consumer & Provider            │
│ ✓ Prevents integration issues in CI/CD pipelines                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 1. Consumer Test (Defines the Contract)
- Located in `consumer/test/pact.spec.js`
- Consumer defines expectations (interactions) with the Provider
- Test interactions mock the Provider responses
- Running these tests generates a **pact file** (`pacts/consumer-provider.json`)

### 2. Pact File (The Contract)
- JSON file that defines the contract between Consumer and Provider
- Contains all interactions (requests/responses) the Consumer expects
- This is the "contract" that both sides must adhere to

### 3. Provider Test (Verifies the Contract)
- Located in `provider/test/pact.spec.js`
- Provider reads the pact file and verifies it can fulfill all interactions
- Ensures actual Provider implementation matches Consumer expectations
- Prevents breaking changes to the API

## Installation

```bash
# Install dependencies for all workspaces
npm install

# Or install individually
cd provider && npm install
cd ../consumer && npm install
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Consumer Tests Only (Generate Pact)
```bash
npm run test:consumer
```
This generates `pacts/consumer-provider.json`

### Run Provider Tests Only (Verify Against Pact)
```bash
npm run test:provider
```
This verifies the provider meets all consumer expectations defined in the pact file.

## Running Services

### Start Provider
```bash
npm run start:provider
# Provider runs on http://localhost:3000
```

### Start Consumer
```bash
npm run start:consumer
# Consumer runs on http://localhost:3001
# Make sure provider is running first
```

## Manual Testing

Once both services are running:

```bash
# Test provider directly
curl http://localhost:3000/health
curl http://localhost:3000/user/1
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Test consumer (uses provider)
curl http://localhost:3001/consumer/health
curl http://localhost:3001/consumer/user/1
```

## Key Pact Concepts

1. **Interaction** - A request/response pair that defines part of the contract
2. **Mock Provider** - Pact creates a mock server during consumer tests
3. **Pact File** - JSON contract file generated from consumer tests
4. **Verification** - Provider tests verify they can fulfill the pact contract
5. **Regression Prevention** - If provider breaks contract, tests fail

## Workflow

```
1. Consumer writes tests defining what it needs from Provider
   ↓
2. Consumer tests run with mocked Provider → generates pact file
   ↓
3. Provider runs tests to verify it meets the pact contract
   ↓
4. If provider breaks contract → provider tests fail
   ↓
5. Contract-driven development ensures compatibility
```

## Next Steps

Try modifying the APIs or tests to see how Pact prevents breaking changes:

- Change an API response in `provider/src/app.js`
- Run provider tests - they should fail if contract is broken
- This is how Pact prevents integration issues in CI/CD pipelines

## Dependencies

- **express** - Web framework
- **axios** - HTTP client
- **@pact-foundation/pact** - Pact testing library
- **jest** - Testing framework
