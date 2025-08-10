const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

// Use a fixed server ID
const SERVER_ID = 'ded7271b-0170-4cdb-9c05-c2078f7fcc98';

// Explicitly serve favicon.ico with the CSP header first
app.get('/favicon.ico', (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self';"
  );
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Middleware to set Content Security Policy (CSP) header for all other requests
app.use(function(req, res, next) {
  // Check if CSP was already set by the favicon handler
  if (!res.hasHeader('Content-Security-Policy')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self';"
    );
  }
  next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// New routes for mcp/ping and mcp/server-id
// This route responds with "pong" to health check pings.
app.get('/mcp/ping', (req, res) => {
  res.send('pong');
});

// This route returns the unique server ID.
app.get('/mcp/server-id', (req, res) => {
  res.send(SERVER_ID);
});

// Start server
app.listen(port, () => {
  console.log(`MCP server listening at http://localhost:${port}`);
  console.log(`Server ID: ${SERVER_ID}`);
});
