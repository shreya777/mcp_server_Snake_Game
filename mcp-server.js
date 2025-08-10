// Basic MCP server using Express.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

// Use a fixed server ID
const SERVER_ID = 'ded7271b-0170-4cdb-9c05-c2078f7fcc98';

// Middleware to set Content Security Policy (CSP) header
// Place this after the app initialization and before your routes
app.use(function(req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self';" // Add other directives as needed
  );
  next(); // Pass control to the next middleware or route handler
});

// Test endpoint for MCP connectivity
app.get('/mcp/ping', (req, res) => {
  res.json({ status: 'ok', message: 'MCP server is running' });
});

// Endpoint to get the MCP server ID
app.get('/mcp/server-id', (req, res) => {
  res.json({ serverId: SERVER_ID });
});

// Start server
app.listen(port, () => {
  console.log(`MCP server listening at http://localhost:${port}`);
  console.log(`Server ID: ${SERVER_ID}`);
});
