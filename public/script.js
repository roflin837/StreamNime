const API_BASE = "/api";

// 1. FUNGSI LOAD DATA (DENGAN LOGIKA LOCALHOST/VERCEL)
async function loadCategory(id, jikanPath) {
  const grid = document.getElementById(id);
  if (!grid) return;

  const isLocal =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost";
  const finalUrl = isLocal
    ? `https://api.jikan.moe/v4${jikanPath}`
    : `${API_BASE}?path=${encodeURIComponent(jikanPath)}`;

  try {
    const response = await fetch(finalUrl);
    const data = await response.json();

    if (data.data) {
      renderCards(data.data, grid);
    } else {
      throw new Error("Data zonk");
    }
  } catch (err) {
    console.error("Eror nih:", err);
    grid.innerHTML = `<button class="retry-btn" onclick="loadCategory('${id}', '${jikanPath}')">Coba Lagi</button>`;
  }
}

// 2. FUNGSI RENDER (SETIAP KARTU BISA DIKLIK)
function renderCards(list, container) {
  container.innerHTML = "";
  list.forEach((anime) => {
    const card = document.createElement("div");
    card.className = "anime-card";

    card.addEventListener("click", () => {
      showDetail(anime);
    });

    card.innerHTML = `
            <div class="score-badge">★ ${anime.score || "N/A"}</div>
            <div class="ep-badge">Ep ${anime.episodes || "?"}</div>
            <img src="${anime.images.jpg.large_image_url}" loading="lazy">
            <p>${anime.title}</p>
        `;
    container.appendChild(card);
  });
}

// 3. FITUR SEARCH & ENTER
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchAnime();
});

async function searchAnime() {
  const query = document.getElementById("searchInput").value;
  if (!query) return;

  const grid = document.getElementById("trending-grid");
  grid.innerHTML = "<p>Mencari anime...</p>";
  showHome(); // Balik ke home biar hasil pencarian keliatan

  // Gunakan logika isLocal juga di search
  const isLocal =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost";
  const searchPath = `/anime?q=${encodeURIComponent(query)}&limit=20`;
  const finalUrl = isLocal
    ? `https://api.jikan.moe/v4${searchPath}`
    : `${API_BASE}?path=${encodeURIComponent(searchPath)}`;

  try {
    const res = await fetch(finalUrl);
    const data = await res.json();
    renderCards(data.data, grid);
    document.querySelector(".section-title").innerText = `Hasil: ${query}`;
  } catch (err) {
    grid.innerHTML = "<p>Gagal mencari.</p>";
  }
}

// 4. DETAIL PAGE & PLAYER
function showDetail(anime) {
  document.getElementById("home-page").classList.add("hidden");
  document.getElementById("detail-page").classList.remove("hidden");

  document.getElementById("detail-title").innerText = anime.title;
  document.getElementById("detail-img").src = anime.images.jpg.large_image_url;
  document.getElementById("detail-desc").innerText =
    anime.synopsis || "Gak ada deskripsi.";

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

function showHome() {
  document.getElementById("home-page").classList.remove("hidden");
  document.getElementById("detail-page").classList.add("hidden");
  document.getElementById("video-iframe").src = "";
}

async function playEpisode(id, ep) {
  const video = document.getElementById("video-player"); // Ganti tag <iframe> jadi <video> di HTML!
  const title = document.getElementById("playing-episode");
  
  title.innerText = "Sabar, lagi nembus server...";
  
  try {
    // Kita panggil backend api kita buat dapetin link video mentah
    // Kita pake slug judul buat Gogoanime (contoh: "one-piece")
    const animeSlug = document.getElementById("detail-title").innerText.toLowerCase().replace(/ /g, "-");
    const response = await fetch(`/api?animeId=${animeSlug}&episode=${ep}`);
    const data = await response.json();

    const streamUrl = data.sources.find(s => s.quality === 'default' || s.quality === '720p').url;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else {
      video.src = streamUrl;
    }
    
    title.innerText = `Nonton Episode ${ep}`;
    document.querySelector(".player-container").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    title.innerText = "Aduhh, server videonya lagi buntu. Coba episode lain.";
  }
}

// 5. JALANKAN ANTREAN LOAD DATA
window.onload = async () => {
  await loadCategory("trending-grid", "/top/anime?limit=12&filter=airing");
  setTimeout(
    () => loadCategory("isekai-grid", "/anime?genres=62&limit=12"),
    1000,
  );
  setTimeout(
    () => loadCategory("action-grid", "/anime?genres=1&limit=12"),
    2000,
  );
  setTimeout(
    () => loadCategory("romance-grid", "/anime?genres=22&limit=12"),
    3000,
  );
};

async function filterGenre(genreId, genreName) {
  const grid = document.getElementById("trending-grid");
  if (!grid) return;

  // Sembunyiin section lain biar fokus ke hasil genre
  document.getElementById("isekai-grid").parentElement.style.display = "none";
  document.getElementById("action-grid").parentElement.style.display = "none";
  document.getElementById("romance-grid").parentElement.style.display = "none";

  grid.innerHTML = `<p>Memuat genre ${genreName}...</p>`;
  showHome(); // Pastiin balik ke home kalau lagi di halaman detail

  // Panggil data genre lewat API
  await loadCategory("trending-grid", `/anime?genres=${genreId}&limit=24&order_by=score&sort=desc`);
  
  // Ganti judul biar user tau lagi liat genre apa
  document.querySelector(".section-title").innerText = `Genre: ${genreName}`;
  
  // Scroll halus ke atas biar kelihatan hasilnya
  window.scrollTo({ top: 400, behavior: 'smooth' });
}
