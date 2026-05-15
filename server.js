const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 81;

app.use(express.json());

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from API!' });
});

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  // Initialize room property for the client
  ws.room = null;

  ws.on('message', (message) => {
    const msg = JSON.parse(message.toString());

    if (msg.type === 'join') {
      // Handle joining a room
      ws.room = msg.room;
      console.log(`Client joined room: ${msg.room}`);
      console.log(`Assigned room to client: ${ws.room}`);
    } else if (msg.type === 'message') {
      // Broadcast message to clients in the same room
      console.log('Broadcasting message to clients in room:', ws.room);
      wss.clients.forEach((client) => {
        console.log(`Comparing client and sender: client === sender -> ${client === ws}`);
        console.log(`Client room: ${client.room}, Sender room: ${ws.room}`);
        if (
          client.readyState === WebSocket.OPEN &&
          client.room === ws.room &&
          client !== ws
        ) {
          client.send(`${msg.id}: ${msg.message}`);
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
});