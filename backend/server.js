// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Your React app's address
        methods: ["GET", "POST"]
    }
});

// --- MongoDB Connection ---
mongoose.connect('mongodb://localhost:27017/quickpolls')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// --- Mongoose Schemas ---
const pollSchema = new mongoose.Schema({
    question: String,
    options: [{
        text: String,
        votes: { type: Number, default: 0 }
    }],
    createdAt: { type: Date, default: Date.now }
});

const Poll = mongoose.model('Poll', pollSchema);

// --- API Routes ---

// GET /polls - Get all polls
app.get('/polls', async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 });
        res.json(polls);
    } catch (err) {
        res.status(500).send(err);
    }
});

// GET /polls/:id - Get a single poll
app.get('/polls/:id', async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).send('Poll not found');
        res.json(poll);
    } catch (err) {
        res.status(500).send(err);
    }
});


// POST /polls - Create a new poll
app.post('/polls', async (req, res) => {
    try {
        const { question, options } = req.body;
        const newPoll = new Poll({
            question,
            options: options.map(text => ({ text, votes: 0 }))
        });
        await newPoll.save();
        res.status(201).json(newPoll);
    } catch (err) {
        res.status(500).send(err);
    }
});

// POST /polls/:id/vote - Vote on a poll
app.post('/polls/:id/vote', async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const pollId = req.params.id;

        // Atomically find the poll and update the vote count
        const poll = await Poll.findById(pollId);
        if (!poll) {
            return res.status(404).send('Poll not found');
        }
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).send('Invalid option index');
        }

        poll.options[optionIndex].votes += 1;
        await poll.save();

        // Emit the update to all connected clients in the poll's room
        io.to(pollId).emit('pollUpdate', poll);

        res.json(poll);
    } catch (err) {
        res.status(500).send(err);
    }
});


// --- WebSocket Logic ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Logic for a client to join a specific poll's "room"
    socket.on('joinPoll', (pollId) => {
        socket.join(pollId);
        console.log(`User ${socket.id} joined poll room ${pollId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


// --- Start Server ---
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));