const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./netlify/functions/auth');

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Base server response
app.get('/', (req, res) => {
  res.send('Server is running.');
});

// Launch server
app.listen(port, () => {
  console.log(`Server running at https://api.phuturesync.co.za:${port}`);
});
