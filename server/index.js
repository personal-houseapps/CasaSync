const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { queries } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
});

// Serve static files from client build (production)
const clientBuild = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuild));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  // --- Lists ---
  socket.on('lists:get', () => {
    const lists = queries.getLists.all();
    socket.emit('lists:data', lists);
  });

  socket.on('lists:create', ({ name, emoji }) => {
    queries.createList.run(name, emoji || '📋');
    const lists = queries.getLists.all();
    io.emit('lists:data', lists);
  });

  socket.on('lists:delete', ({ id }) => {
    queries.deleteList.run(id);
    const lists = queries.getLists.all();
    io.emit('lists:data', lists);
  });

  // --- Items ---
  socket.on('items:get', ({ listId }) => {
    const items = queries.getItems.all(listId);
    socket.emit('items:data', { listId, items });
  });

  socket.on('items:add', ({ listId, text, addedBy }) => {
    queries.addItem.run(listId, text, addedBy);
    const items = queries.getItems.all(listId);
    io.emit('items:data', { listId, items });
  });

  socket.on('items:toggle', ({ itemId, user, listId }) => {
    queries.toggleItem.run(user, itemId);
    const items = queries.getItems.all(listId);
    io.emit('items:data', { listId, items });
  });

  socket.on('items:delete', ({ itemId, listId }) => {
    queries.deleteItem.run(itemId);
    const items = queries.getItems.all(listId);
    io.emit('items:data', { listId, items });
  });

  socket.on('items:clearCompleted', ({ listId }) => {
    queries.clearCompleted.run(listId);
    const items = queries.getItems.all(listId);
    io.emit('items:data', { listId, items });
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
  });
});

// SPA fallback - serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`CasaSync server running on http://localhost:${PORT}`);
});
