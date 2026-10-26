const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

app.get('/', (req, res) => {
    res.send('Real-Time Chat Server is Running!');
});

const users = {};

// When a user connects
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // When a user joins the chat
    socket.on('join-chat', (username) => {
        const name = String(username || '').trim().slice(0, 30);

        if (!name) {
            socket.emit('join-error', 'Please enter a valid username.');
            return;
        }

        // Avoid registering the same socket twice
        if (users[socket.id]) {
            return;
        }

        users[socket.id] = name;

        socket.emit('chat-history', messages);

        io.emit('online-users', Object.values(users));

        io.emit('receive-message', {
            username: 'System',
            message: `${name} joined the chat.`,
            type: 'system',
            time: new Date().toLocaleTimeString()
        });

        console.log(`${name} joined the chat.`);
    });

    // When a user sends a message
    socket.on('send-message', (message) => {
        const username = users[socket.id];

        if (!username || typeof message !== 'string') {
            return;
        }

        const text = message.trim().slice(0, 1000);

        if (!text) {
            return;
        }

        const newMessage = {
            username,
            message: text,
            type: 'user',
            time: new Date().toLocaleTimeString()
        };

        messages.push(newMessage);

        // Keep only the latest 100 messages
        if (messages.length > 100) {
            messages.shift();
        }

        io.emit('receive-message', newMessage);
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        const username = users[socket.id];

        if (username) {
            delete users[socket.id];

            io.emit('online-users', Object.values(users));

            io.emit('receive-message', {
                username: 'System',
                message: `${username} left the chat.`,
                type: 'system',
                time: new Date().toLocaleTimeString()
            });

            console.log(`${username} disconnected.`);
        }
    });
});

const messages = [];

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Chat server running at http://localhost:${PORT}`);
});