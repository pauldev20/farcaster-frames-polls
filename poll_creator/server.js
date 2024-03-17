const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { exec } = require('child_process');
var cors = require('cors');

const app = express();

app.use(cors())

const PORT = process.env.PORT || 3000;

const coord_priv="macisk.e6f574787e05b5d7622e8b648be71bfc2120ba6230e107e1e581a698791335be"
const coord_pub="macipk.398a064125bfa6572b9fac45e9157546fb61df9aa9b721c2e8da32b07abf83a7"

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for polls
let polls = [];

// Endpoint to create a poll
app.post('/create', (req, res) => {
    const { heading, options } = req.body;
    console.log("create request")

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
    

    exec('cd ../../votelik/maci/cli && node ./build/ts/index.js deployPoll \
    -pk macipk.398a064125bfa6572b9fac45e9157546fb61df9aa9b721c2e8da32b07abf83a7 \
    --maci-address 0x2f3c686579Fdd247D30F6f8ce4ceec2436Bb5708 \
    -t 100 -i 1 -m 2 -b 1 -v ' + options.length, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Internal server error' });
        }
        console.log(`stdout: ${stdout}`);

        // Check the exit code
        if (error && error.code !== 0) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const pollIdRegex = /Poll ID: (\d+)/;
        const pollContractRegex = /Poll contract: (0x[a-fA-F0-9]+)/;

        const pollIdMatch = stdout.match(pollIdRegex);
        const pollContractMatch = stdout.match(pollContractRegex);

        if (pollIdMatch && pollContractMatch) {
            const pollId = pollIdMatch[1];
            const pollContract = pollContractMatch[1];
            
            console.log("Poll ID:", pollId);
            console.log("Poll contract:", pollContract);

            poll['id'] = pollId;
            poll['contract'] = pollContract;
            polls.push(poll);

            return res.status(201).json({ message: 'Poll created successfully' , pollId: pollId});
        }
        res.status(404).json({ message: 'Poll id not found' });
    });

});

// Endpoint to get all polls
app.get('/polls', (req, res) => {
    res.json(polls);
});

app.post('/tally', (req, res) => {
    const tally = req.body;

    const index = polls.findIndex(poll => poll.id === tally.pollId);

    if (index !== -1) {
        polls[index].tally = tally;
        res.json(polls);
    } else {
        res.status(404).json({ error: 'Poll not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
