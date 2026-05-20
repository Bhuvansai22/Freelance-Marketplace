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
    origin: (origin, callback) => {
      // Dynamically echo the origin to allow any client connection (including custom subdomains / Vercel previews)
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://freelance-marketplace-dk90.onrender.com',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In development, allow any origin
    if (process.env.NODE_ENV === 'development') return callback(null, true);
    return callback(new Error(`CORS policy blocked the request from origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/ai-assessments', require('./routes/aiAssessmentRoutes'));

// Health Check Endpoint (for Render / uptime monitors)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Basic Route
app.get('/', (req, res) => {
  res.send('Hirenova Marketplace API is running...');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register user for global notifications
  socket.on('register_user', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`Socket ${socket.id} registered for notifications: ${userId}`);
    }
  });

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
      
      // Global Notification to receiver
      io.to(receiverId.toString()).emit('new_message_notification', messageData);
      
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
