
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 8081;

// Enable CORS for all requests
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
}));

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/proxy-health', (req, res) => {
  res.json({ status: 'ok', message: 'API Proxy is running' });
});

// Create proxy middleware for Mercedes API
const mercedesProxy = createProxyMiddleware({
  target: process.env.MERCEDES_API_URL || 'http://mercedes:8000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''  // Remove /api prefix before forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to Mercedes API`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error connecting to Mercedes API',
      error: err.message
    });
  }
});

// Apply proxy middleware to routes
app.use('/api', mercedesProxy);

// Start server
app.listen(port, () => {
  console.log(`API Proxy server listening at http://localhost:${port}`);
  console.log(`Proxying to Mercedes API at: ${process.env.MERCEDES_API_URL || 'http://mercedes:8000'}`);
});
