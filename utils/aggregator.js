/**
 * ABRDNS SEARCH AGGREGATOR - PRO VERSION
 * Path: /utils/aggregator.js
 */
const axios = require('axios');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

async function aggregateAll(query, type) {
    const searchStreams = [];
    const startTime = Date.now();

    // --- 1. BINARY & TECH CLUSTER (GitHub) ---
    if (type === 'all' || type === 'binary') {
        searchStreams.push(
            axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`, {
                headers: { 'User-Agent': 'Abrdns-Engine-v1' } // Required by GitHub API
            })
            .then(res => (res.data.items || []).slice(0, 8).map(item => ({
                title: item.full_name,
                url: item.html_url,
                snippet: item.description || "Technical data node found.",
                source: "BINARY_NODE",
                score: 90 + (item.stargazers_count / 1000)
            })))
            .catch(() => [])
        );
    }

    // --- 2. ACADEMIC CLUSTER (ArXiv XML Parsing) ---
    if (type === 'all' || type === 'research') {
        searchStreams.push(
            axios.get(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=5`)
            .then(async (res) => {
                const parsed = await parser.parseStringPromise(res.data);
                const entries = parsed.feed.entry || [];
                return entries.map(e => ({
                    title: e.title[0].trim(),
                    url: e.id[0],
                    snippet: e.summary[0].slice(0, 200).trim() + "...",
                    source: "RESEARCH_GATE",
                    score: 95
                }));
            })
            .catch(() => [])
        );
    }

    // --- 3. NEWS & INTEL CLUSTER ---
    if (type === 'all' || type === 'news') {
        searchStreams.push(Promise.resolve([
            {
                title: `Live Intel: ${query}`,
                url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iar=news`,
                snippet: "Real-time news events and intelligence reports from the DDG Index.",
                source: "NEWS_FEED",
                score: 80
            }
        ]));
    }

    // --- 4. MEDIA CLUSTER ---
    if (type === 'all' || type === 'media') {
        searchStreams.push(Promise.resolve([
            {
                title: `${query} | Global Media Analysis`,
                url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(query)}`,
                snippet: "Visual intelligence and video logs from international nodes.",
                source: "MEDIA_NODE",
                score: 85
            }
        ]));
    }

    // --- MERGE & RANKING ENGINE ---
    const allResults = await Promise.all(searchStreams);
    const flattened = allResults.flat();
    
    // Sort by score descending
    const finalIndex = flattened.sort((a, b) => b.score - a.score);
    
    console.log(`[Abrdns] Aggregated ${finalIndex.length} sources in ${Date.now() - startTime}ms`);
    return finalIndex;
}

module.exports = { aggregateAll };