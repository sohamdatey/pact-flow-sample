const express = require('express');

const app = express();
app.use(express.json());

// Mock database
const users = {
  '1': { id: '1', name: 'John Doe', email: 'john@example.com' },
  '2': { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
};

// API 1: GET /health - Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Provider' });
});

// API 2: GET /user/:id - Get user by ID
app.get('/user/:id', (req, res) => {
  const { id } = req.params;
  const user = users[id];

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// API 3: POST /user - Create new user
app.post('/user', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const newUser = {
    id: String(Object.keys(users).length + 1),
    name,
    email
  };

  users[newUser.id] = newUser;
  res.status(201).json(newUser);
});

module.exports = app;
