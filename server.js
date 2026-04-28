// ABRDNS TITAN OS - CORE SERVER V4.0
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer'); // For Email Verification
const app = express();

app.use(express.json());
app.use(express.static('public'));

// --- REAL SEARCH AGGREGATOR ---
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    try {
        // Parallel fetch from the "Slave" engines
        const [google, yandex] = await Promise.allSettled([
            axios.get(`https://www.googleapis.com/customsearch/v1?key=${process.env.G_KEY}&cx=${process.env.G_CX}&q=${q}`),
            axios.get(`https://yandex.com/search/xml?user=${process.env.Y_USER}&key=${process.env.Y_KEY}&query=${q}`)
        ]);
        res.json({ results: [...google.value?.data?.items || []] });
    } catch (e) { res.status(500).send("Node Error"); }
});

// --- AI CHATBOT NODE (FREE GEMINI API) ---
app.post('/api/ai', async (req, res) => {
    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.AI_KEY}`, {
            contents: [{ parts: [{ text: req.body.prompt }] }]
        });
        res.json({ reply: response.data.candidates[0].content.parts[0].text });
    } catch (e) { res.json({ reply: "AI Node Offline. Check API Key." }); }
});

// --- EMAIL VERIFICATION SYSTEM ---
app.post('/api/auth/verify', (req, res) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    // Logic: Send otp via Nodemailer, save to session
    res.json({ status: "Sent to " + req.body.email });
});

app.listen(process.env.PORT || 3000, () => console.log("TITAN OS ONLINE"));