const BASE_API = "/api?endpoint=";

// 1. FUNGSI UTAMA LOAD DATA
async function loadCategory(gridId, endpoint) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    grid.innerHTML = '<div class="loading">Memuat anime...</div>';
    
    try {
        const response = await fetch(`${BASE_API}/${endpoint}`);
        const data = await response.json();
        
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
        
        // Simpan data ID Gogoanime buat dipake pas klik
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
    const homePage = document.getElementById("home-page");
    const detailPage = document.getElementById("detail-page");
    
    homePage.classList.add("hidden");
    detailPage.classList.remove("hidden");
    window.scrollTo(0, 0);

    try {
        const res = await fetch(`${BASE_API}/info/${animeId}`);
        const data = await res.json();

        document.getElementById("detail-title").innerText = data.title;
        document.getElementById("detail-img").src = data.image;
        document.getElementById("detail-desc").innerText = data.description || "No description.";
        
        // Render Daftar Episode
        const epList = document.getElementById("episode-list");
        epList.innerHTML = "";
        
        data.episodes.forEach((ep) => {
            const btn = document.createElement("button");
            btn.className = "ep-btn";
            btn.innerText = `Ep ${ep.number}`;
            btn.onclick = () => playEpisode(ep.id);
            epList.appendChild(btn);
        });

    } catch (err) {
        alert("Gagal memuat detail anime.");
    }
}

// 4. PLAYER MULTI-SERVER (GOGOANIME)
function playEpisode(episodeId) {
    const container = document.querySelector(".player-container");
    const statusText = document.getElementById("playing-episode");
    
    statusText.innerText = `Memutar: ${episodeId.replace(/-/g, ' ')}`;

    // Pake Proxy Player biar gak kena block 404 LiteSpeed
    const streamUrl = `https://api.consumet.org/anime/gogoanime/watch/${episodeId}`;

    container.innerHTML = `
        <h2 id="playing-episode">Nonton ${episodeId}</h2>
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; background:#000; border-radius:12px;">
            <iframe src="https://www.consumet.org/anime/gogoanime/watch/${episodeId}?server=gogocdn" 
                style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" 
                allowfullscreen></iframe>
        </div>
        <div class="server-info" style="margin-top:10px; color:#aaa; font-size:12px;">
            <p>Tips: Gunakan tombol 'Server' di dalam player jika video tidak muncul.</p>
        </div>
    `;
}

// 5. FITUR SEARCH
async function searchAnime() {
    const query = document.getElementById("searchInput").value;
    if (!query) return;
    
    showHome();
    const grid = document.getElementById("trending-grid");
    document.querySelector(".section-title").innerText = `Hasil Pencarian: ${query}`;
    
    await loadCategory("trending-grid", query);
}

// 6. BACK TO HOME
function showHome() {
    document.getElementById("home-page").classList.remove("hidden");
    document.getElementById("detail-page").classList.add("hidden");
    // Bersihin player biar gak berat
    const container = document.querySelector(".player-container");
    container.innerHTML = '<h2 id="playing-episode">Pilih Episode</h2>';
}

// 7. INISIALISASI
window.onload = () => {
    loadCategory("trending-grid", "top-airing");
    setTimeout(() => loadCategory("isekai-grid", "summer"), 1000); // Kategori musiman
    setTimeout(() => loadCategory("action-grid", "action"), 2000);
};
