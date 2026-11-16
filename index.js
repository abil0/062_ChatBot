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
    });
    }
}

const response = await fetch('https://api.GEMINI.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
    },
    body: JSON.stringify({
        model: 'gemini-1.5-turbo',
        messages: message,
    }),
});

if (!response.ok) {
        const errorData = await response.text();
        console.error('Error from GEMINI API:', errorData);