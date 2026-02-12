const BASE_API = "/api?endpoint=";

async function loadCategory(gridId, endpoint) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '<div class="loading">Sabar, lagi narik data...</div>';
    
    try {
        const response = await fetch(`${BASE_API}${encodeURIComponent(endpoint)}`);
        const data = await response.json();
        
        // Cek semua kemungkinan field data (Gogoanime kadang pake 'results' kadang langsung array)
        const list = data.results || data; 
        
        if (Array.isArray(list) && list.length > 0) {
            renderCards(list, grid);
        } else {
            // JIKA GAGAL, KITA COBA SEARCH MANUAL (Pancingan)
            if(endpoint === "top-airing") {
                loadCategory(gridId, "naruto"); // Pancing pake Naruto kalau top-airing kosong
            } else {
                grid.innerHTML = '<p>Lagi maintenance, coba refresh.</p>';
            }
        }
    } catch (err) {
        grid.innerHTML = '<button class="ep-btn" onclick="location.reload()">API Sibuk, Klik Buat Ulang</button>';
    }
}

function renderCards(list, container) {
    container.innerHTML = "";
    list.slice(0, 10).forEach((anime) => { // Ambil 10 aja biar cepet
        const card = document.createElement("div");
        card.className = "anime-card";
        card.onclick = () => showDetail(anime.id || anime.animeId);
        card.innerHTML = `
            <div class="score-badge">HOT</div>
            <img src="${anime.image}" onerror="this.src='https://via.placeholder.com/200x300'">
            <div class="card-info"><p>${anime.title || anime.animeTitle}</p></div>
        `;
        container.appendChild(card);
    });
}

// ... Fungsi showDetail & playEpisode tetep sama kayak sebelumnya ...
// (Pastiin fungsi showDetail dan playEpisode lo gak diapus ya Flinn)

async function searchAnime() {
    const query = document.getElementById("searchInput").value;
    if (!query) return;
    document.querySelector(".section-title").innerText = `Mencari: ${query}`;
    await loadCategory("trending-grid", query); 
}

window.onload = () => {
    // Panggil satu-satu biar gak tabrakan request-nya
    loadCategory("trending-grid", "top-airing");
    setTimeout(() => loadCategory("isekai-grid", "recent-release"), 2000);
};
