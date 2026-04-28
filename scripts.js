/**
 * ABRDNS TITAN ENGINE - CORE ECOSYSTEM SCRIPT
 * Handles Search, UI Overlays, 30% Ad Probability, and AI Nodes.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Core Elements
    const mainSearch = document.getElementById('mainSearch');
    const searchTrigger = document.getElementById('searchTrigger');
    const resultsCol = document.getElementById('resultsCol');
    const adLink = document.getElementById('phantom-link');
    const aiInput = document.getElementById('aiInput');
    const aiHistory = document.getElementById('aiHistory');

    // --- 1. THE PHANTOM AD (STRICT 30% DENSITY) ---
    // The ad container is pointer-events: none, but the link is auto.
    // We only attach it to the mouse 30% of the time to avoid ruining the UX.
    document.addEventListener('mousemove', (e) => {
        if (!adLink) return;

        const adChance = Math.random();
        if (adChance < 0.3) {
            // Ad follows cursor - 30% probability
            adLink.style.display = 'block';
            adLink.style.pointerEvents = 'auto';
            adLink.style.left = (e.clientX - 2) + 'px';
            adLink.style.top = (e.clientY - 2) + 'px';
        } else {
            // Ad hidden - 70% probability (Safe for clicking UI)
            adLink.style.display = 'none';
            adLink.style.pointerEvents = 'none';
            adLink.style.left = '-500px';
        }
    });

    // --- 2. MULTI-ENGINE SEARCH LOGIC ---
    const performSearch = async () => {
        const query = mainSearch.value.trim();
        if (!query) return;

        // Visual Feedback
        resultsCol.innerHTML = `
            <div class="status-card">
                <h3>SYNCHRONIZING NODES...</h3>
                <p>Aggregating data from Google, Yandex, and Titan Nodes for: <b>${query}</b></p>
            </div>
        `;

        try {
            const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            resultsCol.innerHTML = ''; // Clear status
            
            data.forEach(result => {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'result-card';
                resultDiv.innerHTML = `
                    <div style="font-size:11px; color:var(--accent); margin-bottom:5px;">${result.source} | ${result.url}</div>
                    <h3 style="margin:0 0 10px 0;"><a href="${result.url}" target="_blank" style="text-decoration:none; color:inherit;">${result.title}</a></h3>
                    <p style="margin:0; font-size:14px; color:var(--text-sub);">${result.desc}</p>
                `;
                resultsCol.appendChild(resultDiv);
            });
        } catch (error) {
            console.error("Search Node Error:", error);
            resultsCol.innerHTML = '<div class="status-card"><h3>NODE TIMEOUT</h3><p>Could not connect to global engines.</p></div>';
        }
    };

    // Listeners for Search
    if (searchTrigger) searchTrigger.onclick = performSearch;
    if (mainSearch) {
        mainSearch.onkeypress = (e) => {
            if (e.key === 'Enter') performSearch();
        };
    }

    // --- 3. UI & SYSTEM OVERLAYS ---
    window.toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('titan-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    };

    window.toggleOverlay = (id) => {
        const overlay = document.getElementById(id);
        if (overlay) {
            const isVisible = overlay.style.display === 'flex';
            overlay.style.display = isVisible ? 'none' : 'flex';
        }
    };

    // AI Node Logic
    const sendToAI = () => {
        const text = aiInput.value;
        if (!text) return;
        const userMsg = document.createElement('div');
        userMsg.className = 'msg user';
        userMsg.textContent = text;
        aiHistory.appendChild(userMsg);
        aiInput.value = '';
        
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'msg bot';
            botMsg.textContent = "Titan AI Node: Processing query via Karachi Data Center...";
            aiHistory.appendChild(botMsg);
            aiHistory.scrollTop = aiHistory.scrollHeight;
        }, 600);
    };

    if (document.getElementById('aiSend')) {
        document.getElementById('aiSend').onclick = sendToAI;
        aiInput.onkeypress = (e) => e.key === 'Enter' && sendToAI();
    }

    // Background Personalization
    const bgUploader = document.getElementById('bgUploader');
    if (bgUploader) {
        bgUploader.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                document.body.style.backgroundImage = `url(${ev.target.result})`;
                document.body.style.backgroundSize = 'cover';
            };
            reader.readAsDataURL(file);
        };
    }
});