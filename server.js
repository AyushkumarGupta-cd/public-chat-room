const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const User = require('./models/User');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

// ✅ Handle both local and Render env var names
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret';

// ===== MongoDB Connection =====
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    keepAlive: true
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Stop app if DB fails
  });

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// ===== Routes =====
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = new User({ email, password: hashed });
    await user.save();
    res.send('✅ Account created! <a href="/">Go to Login</a>');
  } catch {
    res.send('⚠️ Email already exists. <a href="/signup.html">Try Again</a>');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send('❌ Invalid credentials. <a href="/">Try Again</a>');

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send('❌ Invalid credentials. <a href="/">Try Again</a>');

  req.session.userId = user._id;
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  res.sendFile(path.join(__dirname, '/public/chat.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.post('/forgot', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send('❌ No account with that email. <a href="/forgot.html">Try Again</a>');

  const token = crypto.randomBytes(20).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000;
  await user.save();

  res.send(`🔗 Reset link: <a href="/reset/${token}">Reset Password</a>`);
});

app.get('/reset/:token', async (req, res) => {
  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) return res.send('❌ Invalid or expired reset token.');

  res.send(`
    <form action="/reset/${req.params.token}" method="POST">
      <input type="password" name="password" placeholder="New Password" required/>
      <button>Reset Password</button>
    </form>
  `);
});

app.post('/reset/:token', async (req, res) => {
  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) return res.send('❌ Invalid or expired reset token.');

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.send('✅ Password reset successful. <a href="/">Login</a>');
});

app.use((req, res) => {
  res.status(404).send('🚫 Page not found. <a href="/">Go Home</a>');
});

// ===== Socket.IO Active Users =====
const activeUsers = new Set();

io.on('connection', (socket) => {
  console.log('✅ A user connected');
  let currentUsername = null;

  socket.on('user joined', (username) => {
    currentUsername = username;
    activeUsers.add(username);
    socket.broadcast.emit('user joined', `${username} has joined the chat!`);
    io.emit('update users', Array.from(activeUsers));
  });

  socket.on('chat message', (data) => {
    socket.broadcast.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ A user disconnected');
    if (currentUsername) {
      activeUsers.delete(currentUsername);
      io.emit('update users', Array.from(activeUsers));
    }
  });
});

// ===== Start Server =====
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
