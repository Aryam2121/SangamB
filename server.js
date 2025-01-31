const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const{Server} = require('socket.io');
// Import routes
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
// Middleware
app.use(bodyParser.json());
app.use('/api/chat', chatRoutes); // Chat API routes

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Socket.io logic
let users = {}; // Stores the connected users

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Add user to the users object
  socket.on('join', (username) => {
    users[username] = socket.id;
    console.log(`${username} joined with socket ID: ${socket.id}`);
  });

  // Handle chat messages
  socket.on('chatMessage', (msg) => {
    const receiverSocketId = users[msg.receiver];
    if (receiverSocketId) {
      // Emit the message to the receiver
      io.to(receiverSocketId).emit('message', msg);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const receiverSocketId = users[data.receiver];
    if (receiverSocketId) {
      // Emit typing status to the receiver
      io.to(receiverSocketId).emit('typing', data);
    }
  });

  socket.on('disconnect', () => {
    // Remove the user from users object when disconnected
    for (const user in users) {
      if (users[user] === socket.id) {
        delete users[user];
        console.log(`${user} disconnected`);
        break;
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
