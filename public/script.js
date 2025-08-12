const socket = io();

// Prompt user for their name
let username = prompt("Enter your name:");
if (!username || username.trim() === "") {
    username = "Anonymous";
}

// Notify the server that a new user has joined
socket.emit('user joined', username);

const messages = document.getElementById('messages');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');

sendButton.addEventListener('click', () => {
    const msg = messageInput.value;
    if (msg.trim()) {
        // Send message with username to the server
        socket.emit('chat message', { username, message: msg });
        addMessage(username, msg, true); // Display sender's message
        messageInput.value = '';
    }
});


// 👥 Active Users Sidebar
const userList = document.getElementById('active-users'); // the <ul> in sidebar

// Listen for updates to active users list
// Update user list in sidebar
socket.on("update users", (users) => {
  userList.innerHTML = ""; // Clear current list

  users.forEach((user) => {
    const li = document.createElement("li");

    const circle = document.createElement("span");
    circle.classList.add("active-user-circle");

    li.appendChild(circle);
    li.appendChild(document.createTextNode(" " + user));

    userList.appendChild(li);
  });
});

// Listen for incoming messages
socket.on('chat message', (data) => {
    addMessage(data.username, data.message, false); // Display incoming message
});

// Listen for "user joined" messages
socket.on('user joined', (msg) => {
    addSystemMessage(msg); // Display system message
});

// Function to add a message to the chat
function addMessage(user, msg, isSelf) {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${user}:</strong> ${msg}`;
    item.classList.add(isSelf ? 'self' : 'incoming'); // Apply styling based on sender
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight; // Auto-scroll to the latest message
}

// Function to add a system message (e.g., user joined)
function addSystemMessage(msg) {
    const item = document.createElement('li');
    item.textContent = msg;
    item.classList.add('system');
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight; // Auto-scroll to the latest message
}

// 🎵 Music Logic
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("audio");
  const progress = document.getElementById("progress");
  const volume = document.getElementById("volume");
  const nowPlaying = document.getElementById("now-playing");
  const playlistEl = document.getElementById("playlist");

    const searchInput = document.getElementById("search-music");

  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const songs = playlistEl.querySelectorAll("li");
    songs.forEach(song => {
      if (song.textContent.toLowerCase().includes(query)) {
        song.style.display = "list-item";
      } else {
        song.style.display = "none";
      }
    });
  });

  const playlist = [
  { name: "Teri Yaadein", src: "music/Teri Yaadeinglory 128 Kbps.mp3" },
  { name: "The Phoogdi Dance", src: "music/The Phoogdi Dance Housefull 5 128 Kbps.mp3" },
  { name: "The Po Po", src: "music/The Po Po Son Of Sardaar 2 128 Kbps.mp3" },
  { name: "Ting Ling Sajna", src: "music/Ting Ling Sajna Bhool Chuk Maaf 128 Kbps.mp3" },
  { name: "Title Track Jewel Thief", src: "music/Title Track Jewel Thief 128 Kbps.mp3" },
  { name: "Title Track Saiyaara", src: "music/Title Track Saiyaara 128 Kbps.mp3" },
  { name: "Title Track Singham Again", src: "music/Title Track Singham Again 128 Kbps.mp3" },
  { name: "Tu Saath Hai Toh", src: "music/Tu Saath Hai Toh Master Of Melody 128 Kbps.mp3" },
  { name: "Tum Ho Toh (Saiyaara)", src: "music/Tum Ho Toh Saiyaara 128 Kbps.mp3" },
  { name: "Tum Ho Toh (Saiyaara) 320", src: "music/Tum Ho Toh Saiyaara 320 Kbps.mp3" },
  { name: "Tumhe Dillagi", src: "music/Tumhe Dillagi Raid 2 128 Kbps.mp3" },
  { name: "Zamaana Lage", src: "music/Zamaana Lage Metro In Dino 128 Kbps.mp3" },
  { name: "Beautiful Sajna", src: "music/Beautiful Sajna Pintu Ki Pappi 128 Kbps.mp3" },
  { name: "Chor Bazari", src: "music/Chor Bazari Phir Se Bhool Chuk Maaf 128 Kbps.mp3" },
  { name: "Dekha Ji Dekha", src: "music/Dekha Ji Dekha Maine Jyoti Nooran 128 Kbps.mp3" },
  { name: "Dil E Nadaan", src: "music/Dil E Nadaan Housefull 5 128 Kbps.mp3" },
  { name: "Dum Hai To Rok Ke Bata", src: "music/Dum Hai To Rok Ke Bata Pushpa 2 The Rule 128 Kbps.mp3" },
  { name: "Galatfehmi", src: "music/Galatfehmi Nadaaniyan 128 Kbps.mp3" },
  { name: "Gori Hai Kalaiyan", src: "music/Gori Hai Kalaiyan Mere Husband Ki Biwi 128 Kbps.mp3" },
  { name: "Haqeeqat", src: "music/Haqeeqat Akhil Sachdeva 128 Kbps.mp3" },
  { name: "Ikk Vaari", src: "music/Ikk Vaari Mere Husband Ki Biwi 128 Kbps.mp3" },
  { name: "Ilzaam", src: "music/Ilzaam Jewel Thief 128 Kbps.mp3" },
  { name: "Ishq Mein", src: "music/Ishq Mein Nadaaniyan 128 Kbps.mp3" },
  { name: "Ishq Mera", src: "music/Ishq Mera Jubin Nautiyal 128 Kbps.mp3" },
  { name: "Jaadu Do", src: "music/Jaadu Do Patti 128 Kbps.mp3" },
  { name: "Jaadu Jewel Thief 1", src: "music/Jaadu Jewel Thief The Heist Begins 128 Kbps (1).mp3" },
  { name: "Jaadu Jewel Thief", src: "music/Jaadu Jewel Thief The Heist Begins 128 Kbps.mp3" },
  { name: "Jaane Tu", src: "music/Jaane Tu Chhaava 128 Kbps.mp3" },
  { name: "Kissik", src: "music/Kissik Pushpa 2 The Rule 128 Kbps.mp3" },
  { name: "Koi Naa", src: "music/Koi Naa Bhool Chuk Maaf 128 Kbps.mp3" },
  { name: "Laal Pari", src: "music/Laal Pari Housefull 5 128 Kbps.mp3" },
  { name: "Lady Singham", src: "music/Lady Singham Singham Again 128 Kbps.mp3" },
  { name: "Maaye", src: "music/Maaye Sky Force 128 Kbps.mp3" },
  { name: "Mere Dholna 3.0", src: "music/Mere Dholna 3.0 Sonu Version Bhool Bhulaiyaa 3 128 Kbps.mp3" },
  { name: "Money Money", src: "music/Money Money Raid 2 128 Kbps.mp3" },
  { name: "Naamumkin", src: "music/Naamumkin Maalik 320 Kbps.mp3" },
  { name: "Nachdi", src: "music/Nachdi Son Of Sardaar 2 128 Kbps.mp3" },
  { name: "Nasha", src: "music/Nasha Raid 2 128 Kbps.mp3" },
  { name: "Peelings", src: "music/Peelings Pushpa 2 The Rule 128 Kbps.mp3" },
  { name: "Pehla Tu Duja Tu", src: "music/Pehla Tu Duja Tu Son Of Sardaar 2 128 Kbps.mp3" },
  { name: "Pyaar Bhi Jhootha", src: "music/Pyaar Bhi Jhootha The Miranda Brothers 128 Kbps.mp3" },
  { name: "Qayamat", src: "music/Qayamat Housefull 5 128 Kbps.mp3" },
  { name: "Rooh", src: "music/Rooh Yo Yo Honey Singh 128 Kbps.mp3" },
  { name: "Shopping List", src: "music/Shopping List Leonization 128 Kbps.mp3" },
  { name: "Sultana", src: "music/Sultana Be Happy 128 Kbps.mp3" },
  { name: "Taaka Taaki", src: "music/Taaka Taaki Pintu Ki Pappi 128 Kbps.mp3" },
  { name: "Tandoori Days", src: "music/Tandoori Days Badass Ravi Kumar 128 Kbps.mp3" },
  { name: "Tere Liye Jaanam", src: "music/Tere Liye Jaanam Astitva 128 Kbps.mp3" }
];


  let currentSongIndex = 0;
  let isPlaying = false;

  function loadPlaylist() {
    playlist.forEach((song, index) => {
      const li = document.createElement("li");
      li.textContent = song.name;
      li.addEventListener("click", () => {
        currentSongIndex = index;
        loadSong();
        playMusic();
      });
      playlistEl.appendChild(li);
    });
  }

  function loadSong() {
    audio.src = playlist[currentSongIndex].src;
    nowPlaying.textContent = "Now Playing: " + playlist[currentSongIndex].name;
  }

  function playMusic() {
    audio
      .play()
      .then(() => {
        isPlaying = true;
      })
      .catch((err) => {
        console.error("Playback error:", err);
      });
  }

  function pauseMusic() {
    audio.pause();
    isPlaying = false;
  }

  window.togglePlay = () => (isPlaying ? pauseMusic() : playMusic());

  window.prevSong = () => {
    currentSongIndex =
      (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong();
    playMusic();
  };

  window.nextSong = () => {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong();
    playMusic();
  };

  audio.addEventListener("timeupdate", () => {
    progress.max = audio.duration;
    progress.value = audio.currentTime;
  });

  progress.addEventListener("input", () => {
    audio.currentTime = progress.value;
  });

  volume.addEventListener("input", () => {
    audio.volume = volume.value;
  });

  audio.addEventListener("ended", () => window.nextSong());

  loadPlaylist();
  loadSong();
});

// 😊 Emoji
const emojiBtn = document.getElementById("emoji-btn");
const emojiPicker = document.getElementById("emoji-picker");

emojiBtn.addEventListener("click", () => {
  emojiPicker.style.display =
    emojiPicker.style.display === "none" ? "block" : "none";
});

emojiPicker.addEventListener("emoji-click", (event) => {
  messageInput.value += event.detail.unicode;
  emojiPicker.style.display = "none";
  messageInput.focus();
});
