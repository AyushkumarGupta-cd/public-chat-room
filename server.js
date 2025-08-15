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


const app = express();
const PORT = 3000;
const server = http.createServer(app);
const io = new Server(server);


require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
  secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = new User({ email, password: hashed });
    await user.save();
    res.send(
      '✅ Account created! <a href="/">Go to Login</a>'
    );
  } catch {
    res.send(
      '⚠️ Email already exists. <a href="/signup.html">Try Again</a>'
    );
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.send(
      '❌ Invalid credentials. <a href="/">Try Again</a>'
    );
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.send(
      '❌ Invalid credentials. <a href="/">Try Again</a>'
    );
  }

  req.session.userId = user._id;
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
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
  if (!user) {
    return res.send(
      '❌ No account with that email. <a href="/forgot.html">Try Again</a>'
    );
  }

  const token = crypto.randomBytes(20).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000;
  await user.save();

  res.send(
    `🔗 Reset link: <a href="/reset/${token}">Reset Password</a>`
  );
});

app.get('/reset/:token', async (req, res) => {
  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.send('❌ Invalid or expired reset token.');
  }

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

  if (!user) {
    return res.send('❌ Invalid or expired reset token.');
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.send('✅ Password reset successful. <a href="/">Login</a>');
});

app.use((req, res) => {
  res.status(404).send('🚫 Page not found. <a href="/">Go Home</a>');
});

// Keep track of currently active users
const activeUsers = new Set();

io.on('connection', (socket) => {
    console.log('✅ A user connected');

    // This will hold the username of the connected socket
     let currentUsername = null;

    // When the client sends 'user joined', store their username
    socket.on('user joined', (username) => {
        currentUsername = username;                       // save username
        activeUsers.add(username);            // add to active users set

                // Notify others someone joined
        socket.broadcast.emit('user joined', `${username} has joined the chat!`);

        // Send updated active user list to everyone
        io.emit('update users', Array.from(activeUsers));
    });

    // When a user sends a chat message
    socket.on('chat message', (data) => {
        // Broadcast the message to everyone else (excluding sender)
        socket.broadcast.emit('chat message', data);
    });

    // When the user disconnects (closes tab or leaves)
    socket.on('disconnect', () => {
        console.log('❌ A user disconnected');

        // If we know their username, remove from active users
         if (currentUsername) {
            activeUsers.delete(currentUsername);

            // Send updated active user list to everyone
            io.emit('update users', Array.from(activeUsers));
        }
    });
});



server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
