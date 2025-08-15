const express = require('express'); 
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('./models/User');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Session with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      secure: false, // true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Serve static files (for frontend HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

// ====================== ROUTES ======================

// Home Page
app.get('/', (req, res) => {
  res.send('🚀 Login App is running');
});

// Signup Route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: '✅ User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    req.session.userId = user._id;
    res.status(200).json({ message: '✅ Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// Protected Route Example
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
  res.json({ message: 'Welcome to your dashboard!' });
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: '❌ Logout error' });
    res.clearCookie('connect.sid');
    res.json({ message: '✅ Logged out successfully' });
  });
});

// ====================== HEALTH CHECK (For Render) ======================
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ====================== START SERVER ======================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));