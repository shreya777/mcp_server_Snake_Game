<<<<<<< HEAD
// Basic MCP server using Express.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

// Use a fixed server ID
const SERVER_ID = 'ded7271b-0170-4cdb-9c05-c2078f7fcc98';

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

// Package.json scripts section
{
  "scripts": {
    "start": "node mcp-server.js"
  }
}

// App Engine configuration
runtime: nodejs18
handlers:
  - url: /.*
    script: auto
=======
// Basic MCP server using Express.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

// Use a fixed server ID
const SERVER_ID = 'ded7271b-0170-4cdb-9c05-c2078f7fcc98';

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

// Change directory to the server folder and start the server
process.chdir('d:\\d_drive\\Downloads\\Snake-Game\\Snake-Game\\server');
require('child_process').exec('npm start');

// Package.json scripts section
{
  "scripts": {
    "start": "node mcp-server.js"
  }
}

// App Engine configuration
runtime: nodejs18
handlers:
  - url: /.*
    script: auto
>>>>>>> 8b3f552b8f42d2800ddda228af359d00057e0e60
