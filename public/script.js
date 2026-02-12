const BASE_API = "/api?endpoint=";

async function loadCategory(gridId, endpoint) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        const response = await fetch(`${BASE_API}${encodeURIComponent(endpoint)}`);
        const data = await response.json();
        
        // Gogoanime kadang balikin .results, kadang langsung array. Ini buat nangkep keduanya.
        const list = data.results || (Array.isArray(data) ? data : null);
        
        if (list && list.length > 0) {
            renderCards(list, grid);
        } else {
            grid.innerHTML = '<p>Kosong, coba refresh atau cari manual.</p>';
        }
    } catch (err) {
        grid.innerHTML = '<p>Server Error.</p>';
    }
}

function renderCards(list, container) {
    container.innerHTML = "";
    list.forEach((anime) => {
        const card = document.createElement("div");
        card.className = "anime-card";
        // Support ID lama (animeId) atau ID baru (id)
        const id = anime.id || anime.animeId;
        card.onclick = () => showDetail(id);
        card.innerHTML = `
            <div class="score-badge">HD</div>
            <img src="${anime.image}" onerror="this.src='https://via.placeholder.com/200x300'">
            <div class="card-info"><p>${anime.title || anime.animeTitle}</p></div>
        `;
        container.appendChild(card);
    });
}

async function showDetail(animeId) {
    document.getElementById("home-page").classList.add("hidden");
    document.getElementById("detail-page").classList.remove("hidden");
    const epList = document.getElementById("episode-list");
    epList.innerHTML = "Memuat...";

    try {
        const res = await fetch(`${BASE_API}info/${animeId}`);
        const data = await res.json();
        document.getElementById("detail-title").innerText = data.title;
        document.getElementById("detail-img").src = data.image;
        document.getElementById("detail-desc").innerText = data.description || "";
        
        epList.innerHTML = "";
        data.episodes.forEach((ep) => {
            const btn = document.createElement("button");
            btn.className = "ep-btn";
            btn.innerText = `Ep ${ep.number}`;
            btn.onclick = () => playEpisode(ep.id);
            epList.appendChild(btn);
        });
    } catch (err) {
        epList.innerHTML = "Gagal.";
    }
}

function playEpisode(episodeId) {
    const container = document.querySelector(".player-container");
    container.innerHTML = `
        <h2 id="playing-episode">Nonton ${episodeId}</h2>
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; background:#000; border-radius:12px;">
            <iframe src="https://www.consumet.org/anime/gogoanime/watch/${episodeId}?server=gogocdn" 
                style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen></iframe>
        </div>
    `;
}

async function searchAnime() {
    const query = document.getElementById("searchInput").value;
    if (!query) return;
    document.querySelector(".section-title").innerText = `Hasil: ${query}`;
    await loadCategory("trending-grid", query); 
}

window.onload = () => {
    loadCategory("trending-grid", "top-airing");
    setTimeout(() => loadCategory("isekai-grid", "recent-release"), 1500);
};
