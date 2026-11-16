const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !Array.isArray(message)) 
            { return res.status(400).json({ error: 'Message harus berupa array' }); 
    }
    }
}