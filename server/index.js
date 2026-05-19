const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup for real-time communication
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('Freelancer Marketplace API is running...');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a private secure chat room between two users
  socket.on('join_room', (data) => {
    const { userId, contactId } = data;
    if (userId && contactId) {
      const roomName = [userId.toString(), contactId.toString()].sort().join('_');
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined private room: ${roomName}`);
    }
  });
  
  // Real-time Chat Messaging inside private room
  socket.on('send_message', (messageData) => {
    const { sender, receiver } = messageData;
    
    // Resolve sender and receiver IDs (populated objects or string IDs)
    const senderId = sender && typeof sender === 'object' ? sender._id : sender;
    const receiverId = receiver && typeof receiver === 'object' ? receiver._id : receiver;
    
    if (senderId && receiverId) {
      const roomName = [senderId.toString(), receiverId.toString()].sort().join('_');
      // Broadcast strictly to members inside this private room only
      io.to(roomName).emit('receive_message', messageData);
      console.log(`Message from ${senderId} to ${receiverId} broadcast to room: ${roomName}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
