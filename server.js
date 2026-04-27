require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { aggregateAll } = require('./utils/aggregator');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. MIDDLEWARE ---
app.use(express.static('public')); 
app.use(express.json());

// --- 2. DATABASE CONNECTION ---
mongoose.connect('mongodb://localhost:27017/abrdns_search')
    .then(() => console.log("[Database] Karachi-Node Connected Successfully"))
    .catch(err => console.error("[Database] Offline. Ensure MongoDB is running.", err));

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
        // Background Logging
        new SearchLog({ query: q, resultsCount: finalResults.length }).save();
        res.json(finalResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Search Engine Cluster Failure" });
    }
});

// --- 4. TRENDING API ---
app.get('/api/trending', async (req, res) => {
    try {
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

app.listen(PORT, () => {
    console.log(`[ SYSTEM LIVE ON: http://localhost:${PORT} ]`);
});