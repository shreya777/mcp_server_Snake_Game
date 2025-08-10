// Basic MCP server using Express.js
const express = require('express');
const path = require('path'); // Required for serving static files
const app = express();
const port = process.env.PORT || 3001;

// Use a fixed server ID
const SERVER_ID = 'ded7271b-0170-4cdb-9c05-c2078f7fcc98';

// Middleware to set Content Security Policy (CSP) header
// Place this after the app initialization and before your routes
app.use(function(req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; img-src 'self' data:; script-src 'self'; style-src 'self';" 
    // Add other directives as needed.
    // 'data:' is added to img-src to allow base64 encoded images, which are sometimes used for favicons or placeholders.
  );
  next(); // Pass control to the next middleware or route handler
});

// Serve static files from the 'public' directory
// This needs to be placed BEFORE your routes if you want routes to override static file requests,
// or AFTER if you want static files to take precedence for conflicting paths.
// For favicon.ico, it's generally best here so the favicon is served.
app.use(express.static(path.join(__dirname, 'public'))); //


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
