/**
 * NIMESTREAM ULTIMATE ENGINE v4.0 - GOD MODE
 * Custom build for: Flinn
 * Total lines: 250+ of pure logic
 */

const BASE_API = "/api?endpoint=";
const state = {
    currentCategory: "top-airing",
    page: 1,
    cache: new Map(),
    isSearch: false
};

// --- 1. CORE ENGINE: DATA FETCHING WITH AUTO-RETRY ---
async function fetchFromSource(endpoint, retryCount = 0) {
    if (state.cache.has(endpoint)) return state.cache.get(endpoint);

    try {
        const response = await fetch(`${BASE_API}${encodeURIComponent(endpoint)}`);
        if (!response.ok) throw new Error("Server Mampet");
        
        const data = await response.json();
        
        // Normalisasi Data: Gogoanime kadang kirim .results, kadang langsung array
        const cleanData = data.results || (Array.isArray(data) ? data : []);
        
        if (cleanData.length === 0 && retryCount < 2) {
            console.log("Data kosong, mencoba paksa pancingan...");
            return fetchFromSource(endpoint, retryCount + 1);
        }

        state.cache.set(endpoint, cleanData);
        return cleanData;
    } catch (error) {
        if (retryCount < 2) return fetchFromSource(endpoint, retryCount + 1);
        console.error("Critical API Error:", error);
        return [];
    }
}

// --- 2. UI ENGINE: DYNAMIC GRID RENDERER ---
function renderCards(list, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    
    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-notice">
                <i class="fas fa-exclamation-circle"></i>
                <p>Anime tidak ditemukan di server ini. Coba lagi nanti atau cari judul lain.</p>
                <button onclick="location.reload()" class="refresh-btn">REFRESH SEKARANG</button>
            </div>
        `;
        return;
    }

    list.forEach((anime, index) => {
        const id = anime.id || anime.animeId;
        const title = anime.title || anime.animeTitle;
        const image = anime.image || "https://via.placeholder.com/225x330?text=No+Image";
        
        const card = document.createElement("div");
        card.className = "anime-card";
        card.style.animationDelay = `${index * 0.05}s`;
        card.onclick = () => showAnimeDetail(id);

        card.innerHTML = `
            <div class="card-image-wrap">
                <img src="${image}" alt="${title}" loading="lazy" 
                     onerror="this.src='https://via.placeholder.com/225x330?text=Error+Loading'">
                <div class="overlay-info">
                    <span class="status-badge">SUB</span>
                    <i class="fas fa-play-circle"></i>
                </div>
            </div>
            <div class="card-details">
                <h4 title="${title}">${title.length > 40 ? title.substring(0, 40) + '...' : title}</h4>
                <p>Streaming HD</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 3. CATEGORY MANAGER ---
async function loadMainCategory(gridId, endpoint, label) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = '<div class="loader-wave"><span></span><span></span><span></span></div>';

    const data = await fetchFromSource(endpoint);
    renderCards(data, gridId);
    
    // Update label section jika ada
    const titleEl = grid.parentElement.querySelector('.section-title');
    if (titleEl && label) titleEl.innerHTML = label;
}

// --- 4. DETAIL PAGE ENGINE ---
async function showAnimeDetail(animeId) {
    const home = document.getElementById("home-page");
    const detail = document.getElementById("detail-page");
    
    home.classList.add("hidden");
    detail.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const epList = document.getElementById("episode-list");
    epList.innerHTML = "<div class='loading-dots'>Menarik data episode...</div>";

    const data = await fetchFromSource(`info/${animeId}`);
    
    if (!data || data.length === 0) {
        // Karena 'info' mengembalikan object, bukan array, kita fetch ulang khusus info
        const res = await fetch(`${BASE_API}${encodeURIComponent('info/'+animeId)}`);
        const infoData = await res.json();
        updateDetailUI(infoData);
    } else {
        updateDetailUI(data);
    }
}

function updateDetailUI(data) {
    document.getElementById("detail-title").innerText = data.title || "Unknown Title";
    document.getElementById("detail-img").src = data.image;
    document.getElementById("detail-desc").innerText = data.description || "Tidak ada deskripsi tersedia.";
    
    const epList = document.getElementById("episode-list");
    epList.innerHTML = "";

    if (data.episodes && data.episodes.length > 0) {
        // Sort episode dari yang terbaru
        const sortedEps = [...data.episodes].sort((a, b) => b.number - a.number);
        
        sortedEps.forEach(ep => {
            const btn = document.createElement("button");
            btn.className = "ep-btn";
            btn.innerHTML = `<span>EP</span> ${ep.number}`;
            btn.onclick = () => playVideo(ep.id);
            epList.appendChild(btn);
        });
    } else {
        epList.innerHTML = "<p class='no-ep'>Episode belum tersedia untuk anime ini.</p>";
    }
}

// --- 5. VIDEO PLAYER LOGIC ---
function playVideo(episodeId) {
    const playerContainer = document.querySelector(".player-container");
    const cleanId = episodeId.replace(/-/g, ' ').toUpperCase();
    
    playerBoxVisible(true);
    
    playerContainer.innerHTML = `
        <div class="player-header">
            <h3><i class="fas fa-tv"></i> Menonton: ${cleanId}</h3>
            <button onclick="location.reload()" class="btn-sm">Ganti Server</button>
        </div>
        <div class="iframe-wrapper">
            <iframe src="https://www.consumet.org/anime/gogoanime/watch/${episodeId}?server=gogocdn" 
                    allowfullscreen="true" frameborder="0" scrolling="no"></iframe>
        </div>
        <div class="player-footer">
            <p>Tips: Jika video macet, coba refresh halaman atau ganti koneksi internet lo.</p>
        </div>
    `;
    playerContainer.scrollIntoView({ behavior: 'smooth' });
}

function playerBoxVisible(show) {
    const p = document.querySelector(".player-container");
    if(p) p.style.display = show ? "block" : "none";
}

// --- 6. SEARCH & GLOBAL NAV ---
async function triggerSearch() {
    const searchInput = document.getElementById("searchInput");
    const query = searchInput.value.trim();
    
    if (!query) return;
    
    state.isSearch = true;
    backToHome();
    
    const titleHeader = document.querySelector(".section-title");
    if(titleHeader) titleHeader.innerText = `Hasil Pencarian: ${query}`;
    
    await loadMainCategory("trending-grid", query);
}

function backToHome() {
    document.getElementById("home-page").classList.remove("hidden");
    document.getElementById("detail-page").classList.add("hidden");
    playerBoxVisible(false);
}

// --- 7. GENRE FILTER SYSTEM ---
async function filterGenre(genre) {
    backToHome();
    const grid = "trending-grid";
    const titleHeader = document.querySelector(".section-title");
    if(titleHeader) titleHeader.innerText = `Genre: ${genre}`;
    
    await loadMainCategory(grid, genre.toLowerCase());
}

// --- 8. INITIALIZER (WITH ANTI-BAN DELAY) ---
window.onload
