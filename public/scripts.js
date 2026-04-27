/* --- DYNAMIC STATE --- */
let masterDataCache = []; 

// 1. Load Trending on Startup
window.onload = () => {
    loadTrendingData();
};

async function loadTrendingData() {
    const sideInfo = document.getElementById('sideInfo');
    try {
        const response = await fetch('/api/trending');
        const data = await response.json();

        if (data.length > 0) {
            let html = '<ul class="trending-list" style="list-style:none; padding:0;">';
            data.forEach(item => {
                html += `
                    <li style="margin-bottom:12px; border-bottom:1px solid #222; padding-bottom:5px;">
                        <span style="color:var(--brand-pink); font-size:10px;">#HOT</span>
                        <a href="#" onclick="autoSearch('${item.query}')" style="color:#ccc; text-decoration:none; margin-left:10px;">${item.query}</a>
                        <div style="font-size:9px; color:#555;">${new Date(item.timestamp).toLocaleTimeString()}</div>
                    </li>`;
            });
            sideInfo.innerHTML = html + '</ul>';
        }
    } catch (err) {
        sideInfo.innerHTML = "Trending node offline.";
    }
}

function autoSearch(q) {
    document.getElementById('searchInput').value = q;
    executeSearch(); 
}

/* --- TAB FILTER ENGINE --- */
async function switchTab(filterType, element) {
    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');

    if (masterDataCache.length === 0) return;

    const container = document.getElementById('resultsDisplay');
    container.innerHTML = ""; 

    let filtered = [];
    if (filterType === 'all') filtered = masterDataCache;
    else if (filterType === 'research') filtered = masterDataCache.filter(item => item.source === 'RESEARCH_GATE');
    else if (filterType === 'binary') filtered = masterDataCache.filter(item => item.source.includes('BINARY'));
    else if (filterType === 'media') filtered = masterDataCache.filter(item => item.source === 'MEDIA_NODE');

    if (filtered.length === 0) {
        container.innerHTML = `<div class="no-results">No nodes in <b>${filterType}</b>.</div>`;
    } else {
        // Use your existing render function here
        renderAdvancedResults(filtered); 
    }
}