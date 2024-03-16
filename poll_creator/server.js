const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { exec } = require('child_process');

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

    exec('node ../maci/cli/build/ts/index.js deployPoll \
    -pk macipk.78e716652dfd1cc8f5fb0b45f656b493135edba5447cfc5e68c2f568d22e7193 \
    -t 300 -i 1 -m 2 -b 1 -v ' + options.length, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
    });

    options.length
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
