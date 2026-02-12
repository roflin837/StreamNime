const BASE_API = "/api?endpoint=";

async function loadCategory(gridId, endpoint) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '<div class="loading">Memuat anime...</div>';
    
    try {
        const response = await fetch(`${BASE_API}${encodeURIComponent(endpoint)}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            renderCards(data.results, grid);
        } else {
            grid.innerHTML = '<p style="color:white;">Anime tidak ditemukan di server ini.</p>';
        }
    } catch (err) {
        grid.innerHTML = '<button class="ep-btn" onclick="location.reload()">Server Sibuk, Coba Lagi</button>';
    }
}

function renderCards(list, container) {
    container.innerHTML = "";
    list.forEach((anime) => {
        const card = document.createElement("div");
        card.className = "anime-card";
        card.onclick = () => showDetail(anime.id);
        card.innerHTML = `
            <div class="score-badge">SUB</div>
            <img src="${anime.image}" alt="${anime.title}" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
            <div class="card-info"><p>${anime.title}</p></div>
        `;
        container.appendChild(card);
    });
}

async function showDetail(animeId) {
    document.getElementById("home-page").classList.add("hidden");
    document.getElementById("detail-page").classList.remove("hidden");
    window.scrollTo(0, 0);
    const epList = document.getElementById("episode-list");
    epList.innerHTML = "Memuat episode...";

    try {
        const res = await fetch(`${BASE_API}info/${animeId}`);
        const data = await res.json();
        document.getElementById("detail-title").innerText = data.title;
        document.getElementById("detail-img").src = data.image;
        document.getElementById("detail-desc").innerText = data.description || "Tidak ada deskripsi.";
        
        epList.innerHTML = "";
        data.episodes.forEach((ep) => {
            const btn = document.createElement("button");
            btn.className = "ep-btn";
            btn.innerText = `Ep ${ep.number}`;
            btn.onclick = () => playEpisode(ep.id);
            epList.appendChild(btn);
        });
    } catch (err) {
        epList.innerHTML = "Gagal memuat episode.";
    }
}

function playEpisode(episodeId) {
    const container = document.querySelector(".player-container");
    container.innerHTML = `
        <h2 id="playing-episode">Memutar: ${episodeId.replace(/-/g, ' ')}</h2>
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; background:#000; border-radius:12px;">
            <iframe src="https://www.consumet.org/anime/gogoanime/watch/${episodeId}?server=gogocdn" 
                style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" 
                allowfullscreen></iframe>
        </div>
    `;
}

async function searchAnime() {
    const query = document.getElementById("searchInput").value;
    if (!query) return;
    document.getElementById("home-page").classList.remove("hidden");
    document.getElementById("detail-page").classList.add("hidden");
    document.querySelector(".section-title").innerText = `Hasil Pencarian: ${query}`;
    await loadCategory("trending-grid", query); 
}

window.onload = () => {
    // Pakai endpoint yang paling stabil di Gogoanime
    loadCategory("trending-grid", "top-airing"); 
    setTimeout(() => loadCategory("isekai-grid", "recent-release"), 1200); 
    setTimeout(() => loadCategory("action-grid", "top-airing?page=2"), 2500);
};
