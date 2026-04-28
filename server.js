require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Only once!
const { aggregateAll } = require('./utils/aggregator');

const app = express();
const PORT = process.env.PORT || 3000;
module.exports = app;

// --- 1. MIDDLEWARE ---
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- 2. DATABASE CONNECTION ---
// Using a fallback to prevent crashing on Vercel
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abrdns_search';

mongoose.connect(mongoURI)
    .then(() => console.log("[Database] Karachi-Node Connected"))
    .catch(err => console.log("[Database] Running in Offline Mode (Localhost unavailable on Cloud)"));

const SearchSchema = new mongoose.Schema({
    query: String,
    timestamp: { type: Date, default: Date.now },
    resultsCount: Number
});
const SearchLog = mongoose.model('SearchLog', SearchSchema);

// --- 3. MASTER SEARCH API ---
app.get('/api/search', async (req, res) => {
    const { q, type = 'all' } = req.query;
    if (!q) return res.status(400).json({ error: "Empty Query" });

    try {
        const finalResults = await aggregateAll(q, type);
        // Silently fail logging if DB is offline
        if (mongoose.connection.readyState === 1) {
            new SearchLog({ query: q, resultsCount: finalResults.length }).save().catch(() => {});
        }
        res.json(finalResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Search Engine Cluster Failure" });
    }
});

// --- 4. TRENDING API ---
app.get('/api/trending', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return res.json([]);
        const trending = await SearchLog.find().sort({ timestamp: -1 }).limit(5);
        res.json(trending);
    } catch (err) { res.json([]); }
});

// --- 5. SYSTEM STATUS ---
app.get('/api/status', (req, res) => {
    res.json({ 
        status: "ONLINE", 
        version: "1.0.4", 
        cluster: "Karachi-Node-01",
        database: mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED"
    });
});

// --- 6. ROOT ROUTE ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[ SYSTEM LIVE ON PORT: ${PORT} ]`);
});