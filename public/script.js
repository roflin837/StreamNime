const BASE_API = "/api?endpoint=";

// 1. FUNGSI UTAMA LOAD DATA
async function loadCategory(gridId, endpoint) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    grid.innerHTML = '<div class="loading">Memuat anime...</div>';
    
    try {
        const response = await fetch(`${BASE_API}/${endpoint}`);
        const data = await response.json(); // UDAH DIBERESIN DARI TYPO 'eresponse'
        
        if (data.results && data.results.length > 0) {
            renderCards(data.results, grid);
        } else {
            grid.innerHTML = '<p>Anime tidak ditemukan.</p>';
        }
    } catch (err) {
        console.error("Gagal load:", err);
        grid.innerHTML = '<button class="ep-btn" onclick="location.reload()">Server Error, Muat Ulang</button>';
    }
}

// 2. RENDER KARTU KE GRID
function renderCards(list, container) {
    container.innerHTML = "";
    list.forEach((anime) => {
        const card = document.createElement("div");
        card.className = "anime-card";
        card.onclick = () => showDetail(anime.id);

        card.innerHTML = `
            <div class="score-badge">Populer</div>
            <img src="${anime.image}" alt="${anime.title}" loading="lazy">
            <div class="card-info">
                <p>${anime.title}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// 3. HALAMAN DETAIL & AMBIL EPISODE
async function showDetail(animeId) {
    document.getElementById("home-page").classList.add("hidden");
    document.getElementById("detail-page").classList.remove("hidden");
    window.scrollTo(0, 0);

    const epList = document.getElementById("episode-list");
    epList.innerHTML = "Memuat episode...";

    try {
        // Panggil lewat API proxy kita
        const res = await fetch(`${BASE_API}info/${animeId}`);
        const data = await res.json();

        document.getElementById("detail-title").innerText = data.title;
        document.getElementById("detail-img").src = data.image;
        document.getElementById("detail-desc").innerText = data.description || "No description.";
        
        epList.innerHTML = "";
        data.episodes.forEach((ep) => {
            const btn = document.createElement("button");
            btn.className = "ep-btn";
            btn.innerText = `Ep ${ep.number}`;
            btn.onclick = () => playEpisode(ep.id);
            epList.appendChild(btn);
        });

    } catch (err) {
        console.error("Detail error:", err);
        epList.innerHTML = "Gagal memuat episode.";
    }
}

// 4. PLAYER
function playEpisode(episodeId) {
    const container = document.querySelector(".player-container");
    const statusText = document.getElementById("playing-episode");
    
    statusText.innerText = `Memutar: ${episodeId.replace(/-/g, ' ')}`;

    container.innerHTML = `
        <h2 id="playing-episode">Nonton ${episodeId}</h2>
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; background:#000; border-radius:12px;">
            <iframe src="https://www.consumet.org/anime/gogoanime/watch/${episodeId}?server=gogocdn" 
                style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" 
                allowfullscreen></iframe>
        </div>
    `;
}

// 5. SEARCH & NAVIGATION
async function searchAnime() {
    const query = document.getElementById("searchInput").value;
    if (!query) return;
    
    showHome();
    document.querySelector(".section-title").innerText = `Hasil Pencarian: ${query}`;
    await loadCategory("trending-grid", encodeURIComponent(query)); 
}

function showHome() {
    document.getElementById("home-page").classList.remove("hidden");
    document.getElementById("detail-page").classList.add("hidden");
    const container = document.querySelector(".player-container");
    container.innerHTML = '<h2 id="playing-episode">Pilih Episode</h2>';
}

// 6. INIT
window.onload = () => {
    loadCategory("trending-grid", "top-airing");
    setTimeout(() => loadCategory("isekai-grid", "summer"), 1000);
    setTimeout(() => loadCategory("action-grid", "action"), 2000);
};
