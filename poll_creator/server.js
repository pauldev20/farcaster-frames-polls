const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for polls
let polls = [];

// Endpoint to create a poll
app.post('/create', (req, res) => {
    const { heading, options } = req.body;

    // Check if all required fields are provided
    if (!heading || !options || options.length < 2 || options.length > 4) {
        return res.status(400).json({ error: 'Invalid poll data' });
    }

    // Create poll object
    const poll = {
        heading,
        options
    };

    // Store poll in memory
    polls.push(poll);

    res.status(201).json({ message: 'Poll created successfully' });
});

// Endpoint to get all polls
app.get('/polls', (req, res) => {
    res.json(polls);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
