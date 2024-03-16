const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

const coord_priv=macisk.e6f574787e05b5d7622e8b648be71bfc2120ba6230e107e1e581a698791335be

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

    exec('node ../../votelik/maci/cli/build/ts/index.js deployPoll \
    -pk macisk.e6f574787e05b5d7622e8b648be71bfc2120ba6230e107e1e581a698791335be \
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
