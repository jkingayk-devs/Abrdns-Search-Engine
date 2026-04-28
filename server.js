const express = require('express');
const app = express();
const path = require('path');

// Serve all files from the root directory for local Node.js testing
app.use(express.static(__dirname));

// Primary Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Advanced Search API - Aggregating from multiple simulated nodes
app.get('/search', (req, res) => {
    const query = req.query.q || "";
    const timestamp = new Date().toISOString();
    
    // Simulating deep-web and global engine results
    const results = [
        {
            title: `Google Result: ${query}`,
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            desc: "Primary index result retrieved via Titan Bridge.",
            source: "Google"
        },
        {
            title: `Yandex Node: ${query}`,
            url: "https://yandex.com/search",
            desc: "Eastern European data node synchronization complete.",
            source: "Yandex"
        },
        {
            title: `Abrdns Intelligence: ${query} Analysis`,
            url: "https://abrdns.node/internal",
            desc: "Internal Titan Engine proprietary data analysis for query injection.",
            source: "Titan"
        },
        {
            title: "64-bit Executable Header Analysis",
            url: "https://titan.engine/binary",
            desc: "Binary inspection node ready for EasyPeasy.exe analysis.",
            source: "Binary"
        }
    ];

    console.log(`[${timestamp}] Query Injected: ${query}`);
    res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ===============================================
    🚀 TITAN MULTI-ENGINE CORE ONLINE
    📡 LOCAL TEST SERVER: http://localhost:${PORT}
    🛠️ READY FOR VERCEL DEPLOYMENT
    ===============================================
    `);
});