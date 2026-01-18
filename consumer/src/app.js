const express = require('express');
const ProviderClient = require('./providerClient');

const app = express();
const providerClient = new ProviderClient(process.env.PROVIDER_URL || 'http://localhost:3000');

// Consumer endpoint that gets user from provider
app.get('/consumer/user/:id', async (req, res) => {
  try {
    const user = await providerClient.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consumer endpoint for health that checks provider
app.get('/consumer/health', async (req, res) => {
  try {
    const providerHealth = await providerClient.getHealth();
    res.json({ status: 'OK', service: 'Consumer', provider: providerHealth });
  } catch (error) {
    res.status(503).json({ error: 'Provider unavailable' });
  }
});

module.exports = app;
