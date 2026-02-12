/**
 * NIMESTREAM ULTIMATE ENGINE v3.5 - FINAL BUILD
 * Created for: Flinn
 */

const BASE_API = "/api?endpoint=";
const cacheStore = new Map();

// --- 1. MESIN PENGAMBIL DATA TINGKAT TINGGI ---
async function fetchData(endpoint) {
    if (cacheStore.has(endpoint)) return cacheStore.get(endpoint);
    
    try {
        const response = await fetch(`${BASE_API}${encodeURIComponent(endpoint)}`);
        if (!response.ok) throw new Error("Kabel API Putus");
        const data = await response.json();
        
        // Simpan di cache biar gak usah load ulang kalo pindah page
        cacheStore.set(endpoint, data);
        return data;
    } catch (error) {
        console.error("Fetch Error:", error);
        return null;
    }
}

// --- 2. LOADER KATEGORI (ANTI-KOSONG) ---
async function loadCategory(gridId, endpoint, customTitle = null) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    // Visual Loading ceritanya biar keren
    grid.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>MENYAMBUNGKAN KE DATABASE PUSAT...</p>
        </div>
    `;

    const data = await fetchData(endpoint);
    // Gogoanime Data Normalizer (Nangkep .results atau Array langsung)
    const list = data?.results || (Array.isArray(data) ? data : []);

    if (list.length > 0) {
        if (customTitle) {
            const titleEl = grid.parentElement.querySelector('.section-title');
            if (titleEl) titleEl.innerText = customTitle;
        }
        renderGrid(list, grid);
    } else {
        grid.innerHTML = `
            <div class="error-ui">
                <p>Data server lagi mampet. Coba cari manual atau paksa muat ulang.</p>
                <button class="retry-btn" onclick="location.reload()">REFRESH HALAMAN</button>
            </div>
        `;
    }
}

// --- 3. RENDERING ENGINE (WITH AUTO-IMAGE RECOVERY) ---
function renderGrid(items, container) {
    container.innerHTML = "";
    items.forEach((item, i) => {
        const animeId = item.id || item.animeId;
        const animeTitle = item.title || item.animeTitle;
        const poster = item.image || "https://via.placeholder.com/225x330?text=No+Image";

        const card = document.createElement("div");
        card.className = "anime-card";
        card.style.animationDelay = `${i * 0.05}s`;
        card.onclick = () => showAnimeDetail(animeId);

        card.innerHTML = `
            <div class="card-thumb">
                <img src="${poster}" alt="${animeTitle}" loading="lazy" 
                     onerror="this.src='https://via.placeholder.com/225x330?text=Poster+Error'">
                <div class="card-tag">HD</div>
                <div class="hover-play"><i class="fas fa-play"></i></div>
            </div>
            <div class="card-body">
                <h4>${animeTitle.length > 45 ? animeTitle.substring(0, 45) + '...' : animeTitle}</h4>
                <div class="card-meta">
                    <span>Gogoanime</span>
                    <span class="dot">•</span>
                    <span>Sub Indo</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 4. DETAIL PAGE & EPISODE MANAGER ---
async function showAnimeDetail(id) {
    const home = document.getElementById("home-page");
    const detail = document.getElementById("detail-page");
    
    home.classList.add("hidden");
    detail.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const listContainer = document.getElementById("episode-list");
    listContainer.innerHTML = "<div class='loader-sm'>Narik data episode...</div>";

    const data = await fetchData(`info/${id}`);
    if (!data) {
        listContainer.innerHTML = "<p>Gagal narik detail anime.</p>";
        return;
    }

    // Update Detail UI secara brutal
    document.getElementById("detail-title").innerText = data.title;
    document.getElementById("detail-img").src = data.image;
    document.getElementById("detail-desc").innerText = data.description || "Sinopsis gak ada.";
    
    // List Episodes (Urutin dari yang terbaru)
    listContainer.innerHTML = "";
    if (data.episodes && data.episodes.length > 0) {
        data.episodes.sort((a, b) => b.number - a.number).forEach(ep => {
            const epBtn = document.createElement("button");
            epBtn.className = "ep-btn";
            epBtn.innerHTML = `<span>EPISODE</span> <strong>${ep.number}</strong>`;
            epBtn.onclick = () => initPlayer(ep.id);
            listContainer.appendChild(epBtn);
        });
    } else {
        listContainer.innerHTML = "<p>Belum ada episode rilis.</p>";
    }
}

// --- 5. VIDEO PLAYER ENGINE (STABLE) ---
function initPlayer(epId) {
    const playerBox = document.querySelector(".player-container");
    const displayTitle = epId.replace(/-/g, ' ').toUpperCase();
    
    playerBox.innerHTML = `
        <div class="player-top">
            <h3><i class="fas fa-film"></i> Menonton: ${displayTitle}</h3>
        </div>
        <div class="video-wrapper">
            <iframe src="https://www.consumet.org/anime/gogoanime/watch/${epId}?server=gogocdn" 
                    allowfullscreen="true" frameborder="0" scrolling="no"></iframe>
        </div>
        <div class="player-bottom">
            <p>Video macet? Klik tombol <strong>Server</strong> di dalam player.</p>
        </div>
    `;
    playerBox.scrollIntoView({ behavior: 'smooth' });
}

// --- 6. SEARCH & NAVIGATION SYSTEM ---
async function execSearch() {
    const box = document.getElementById("searchInput");
    const val = box.value.trim();
    if (!val) return;

    goToHome();
    document.querySelector(".section-title").innerText = `Hasil Cari: ${val}`;
    await loadCategory("trending-grid", val);
}

function goToHome() {
    document.getElementById("home-page").classList.remove("hidden");
    document.getElementById("detail-page").classList.add("hidden");
}

// --- 7. AUTO-STARTUP (DENGAN JEDA ANTI-BAN) ---
window.onload = () => {
    console.log("NimeStream v3.5 Powered On.");
    
    // Load category utama tanpa delay
    loadCategory("trending-grid", "top-airing", "Sedang Populer");
    
    // Jeda biar IP Vercel gak diblokir server pusat (Rate Limit)
    setTimeout(() => {
        loadCategory("isekai-grid", "recent-release", "Terakhir Diupdate");
    }, 2000);

    setTimeout(() => {
        loadCategory("action-grid", "top-airing?page=2", "Action Hits");
    }, 4500);
};

// Listener Enter Key
document.getElementById("searchInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") execSearch();
});
