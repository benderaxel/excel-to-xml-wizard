
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 8081;

// Enable CORS for all requests
app.use(cors({
  origin: ['http://localhost:8080', 'http://frontend:8080'],
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

// Create proxy middleware for Mercedes API with improved error handling
const mercedesProxy = createProxyMiddleware({
  target: process.env.MERCEDES_API_URL || 'http://mercedes:8000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''  // Remove /api prefix before forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to Mercedes API`);
    
    // Log headers for debugging
    if (req.method === 'POST' && req.url.includes('/upload')) {
      console.log('Original request headers:', req.headers);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log response for debugging
    if (req.method === 'POST' && req.url.includes('/upload')) {
      console.log(`Proxy response status: ${proxyRes.statusCode}`);
      console.log('Proxy response headers:', proxyRes.headers);
    }
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
