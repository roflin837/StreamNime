// 1. KONFIGURASI
const API_BASE = "/api";

// 2. FUNGSI LOAD DATA (Langsung tembak Jikan API)
async function loadCategory(id, jikanPath) {
  const grid = document.getElementById(id);
  if (!grid) return;

  const finalUrl = `https://api.jikan.moe/v4${jikanPath}`;

  try {
    const response = await fetch(finalUrl);
    const data = await response.json();

    if (data.data) {
      renderCards(data.data, grid);
    } else {
      throw new Error("Data zonk");
    }
  } catch (err) {
    console.error("Error load data:", err);
    grid.innerHTML = `<button class="retry-btn" onclick="loadCategory('${id}', '${jikanPath}')">Coba Lagi</button>`;
  }
}

// 3. FUNGSI RENDER KARTU
function renderCards(list, container) {
  container.innerHTML = "";
  list.forEach((anime) => {
    const card = document.createElement("div");
    card.className = "anime-card";
    card.addEventListener("click", () => showDetail(anime));

    card.innerHTML = `
      <div class="score-badge">★ ${anime.score || "N/A"}</div>
      <div class="ep-badge">Ep ${anime.episodes || "?"}</div>
      <img src="${anime.images.jpg.large_image_url}" loading="lazy">
      <p>${anime.title}</p>
    `;
    container.appendChild(card);
  });
}

// 4. FITUR SEARCH
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchAnime();
});

async function searchAnime() {
  const query = document.getElementById("searchInput").value;
  if (!query) return;

  const grid = document.getElementById("trending-grid");
  grid.innerHTML = "<p>Mencari anime...</p>";
  showHome();

  const finalUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`;

  try {
    const res = await fetch(finalUrl);
    const data = await res.json();
    renderCards(data.data, grid);
    document.querySelector(".section-title").innerText = `Hasil: ${query}`;
  } catch (err) {
    grid.innerHTML = "<p>Gagal mencari.</p>";
  }
}

// 5. DETAIL PAGE & PLAYER
function showDetail(anime) {
  document.getElementById("home-page").classList.add("hidden");
  document.getElementById("detail-page").classList.remove("hidden");

  document.getElementById("detail-title").innerText = anime.title;
  document.getElementById("detail-img").src = anime.images.jpg.large_image_url;
  document.getElementById("detail-desc").innerText = anime.synopsis || "Gak ada deskripsi.";

  const epList = document.getElementById("episode-list");
  epList.innerHTML = "";
  const totalEp = anime.episodes || 12;

  for (let i = 1; i <= totalEp; i++) {
    const btn = document.createElement("button");
    btn.className = "ep-btn";
    btn.innerText = i;
    btn.onclick = () => playEpisode(anime.mal_id, i);
    epList.appendChild(btn);
  }
  window.scrollTo(0, 0);
}

function playEpisode(id, ep) {
  const container = document.querySelector(".player-container");
  
  const servers = {
    VIP: `https://vidsrc.cc/v2/embed/anime/${id}/${ep}`,
    Alternative: `https://vidlink.pro/anime/${id}/${ep}`,
    Backup: `https://vidsrc.su/embed/anime/${id}/${ep}`
  };

  container.innerHTML = `
    <h2 id="playing-episode" style="margin-bottom: 10px;">Nonton Episode ${ep}</h2>
    <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; background:#000; border-radius:12px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
      <iframe id="main-player" src="${servers.VIP}" 
        style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" 
        allowfullscreen></iframe>
    </div>
    
    <div class="server-list" style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
      <button onclick="changeServer('${servers.VIP}')" style="padding: 10px 15px; background: #6c5ce7; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Server VIP</button>
      <button onclick="changeServer('${servers.Alternative}')" style="padding: 10px 15px; background: #444; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Server 2</button>
      <button onclick="changeServer('${servers.Backup}')" style="padding: 10px 15px; background: #444; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Server 3</button>
    </div>
  `;
}

// Fungsi ganti server global
window.changeServer = function(url) {
  const player = document.getElementById("main-player");
  if (player) {
    player.src = url;
  }
};

function showHome() {
  document.getElementById("home-page").classList.remove("hidden");
  document.getElementById("detail-page").classList.add("hidden");
  
  const player = document.getElementById("main-player");
  if (player) player.src = ""; // Stop video
}

// 6. GENRE FILTER
async function filterGenre(genreId, genreName) {
  const grid = document.getElementById("trending-grid");
  if (!grid) return;

  document.getElementById("isekai-grid").parentElement.style.display = "none";
  document.getElementById("action-grid").parentElement.style.display = "none";
  document.getElementById("romance-grid").parentElement.style.display = "none";

  grid.innerHTML = `<p>Memuat genre ${genreName}...</p>`;
  showHome();

  await loadCategory("trending-grid", `/anime?genres=${genreId}&limit=24&order_by=score&sort=desc`);
  document.querySelector(".section-title").innerText = `Genre: ${genreName}`;
  window.scrollTo({ top: 400, behavior: 'smooth' });
}

// 7. INISIALISASI SAAT START
window.onload = async () => {
  await loadCategory("trending-grid", "/top/anime?limit=12&filter=airing");
  setTimeout(() => loadCategory("isekai-grid", "/anime?genres=62&limit=12"), 1000);
  setTimeout(() => loadCategory("action-grid", "/anime?genres=1&limit=12"), 2000);
  setTimeout(() => loadCategory("romance-grid", "/anime?genres=22&limit=12"), 3000);
};
