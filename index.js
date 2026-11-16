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

// Urutan model: kalau satu overload/tidak ada, otomatis coba model berikutnya
const MODELS = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini(messages) {
  let lastResponse;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GEMINI_API_KEY}`
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: true
          })
        }
      );

      if (response.ok) return response;
      lastResponse = response;

      console.error(`Gemini ${model} gagal (percobaan ${attempt + 1}):`, response.status);

      // Model tidak ditemukan: langsung pindah ke model berikutnya
      if (response.status === 404) break;

      // Error selain overload/limit (mis. 401, 400): jangan diulang
      if (![429, 500, 503].includes(response.status)) return response;

      // Overload: tunggu 1 detik lalu coba lagi
      await sleep(1000);
    }
  }

  return lastResponse;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: 'messages harus berupa array dan tidak boleh kosong' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ error: 'GEMINI_API_KEY belum diset di file .env' });
    }

    const response = await callGemini(messages);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error dari Gemini API:', response.status, errorText);

      const friendly =
        response.status === 503 || response.status === 429
          ? 'Server AI sedang sibuk. Coba kirim ulang beberapa saat lagi.'
          : `API error (${response.status}). Cek log server.`;

      return res.status(response.status).json({ error: friendly });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('data:')) continue;

        const data = trimmedLine.slice(5).trim();
        if (data === '[DONE]') continue;

        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content;

          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch (error) {
          console.error('Gagal parsing streaming data:', error);
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('SERVER ERROR:', error);

    if (!res.headersSent) {
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Terjadi kesalahan pada server' })}\n\n`);
      res.end();
    }
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

module.exports = app;
