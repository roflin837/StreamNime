import axios from 'axios';

export default async function handler(req, res) {
  const { path, animeId, episode } = req.query;

  // Header biar gak diblokir provider
  const headers = { "User-Agent": "Mozilla/5.0" };

  try {
    // Jalur 1: Buat dapet info anime & episode (Jikan)
    if (path) {
      const response = await axios.get(`https://api.jikan.moe/v4${path}`);
      return res.status(200).json(response.data);
    }

    // Jalur 2: SCRAPING VIDEO (Pake Gogoanime via Consumet)
    if (animeId && episode) {
      // Kita cari ID versi Gogoanime dulu berdasarkan judul
      const searchRes = await axios.get(`https://consumet-api-production-e816.up.railway.app/anime/gogoanime/${animeId}`);
      
      // Ambil link streaming episode
      const streamRes = await axios.get(`https://consumet-api-production-e816.up.railway.app/anime/gogoanime/watch/${animeId}-episode-${episode}`);
      
      return res.status(200).json(streamRes.data);
    }

    res.status(400).json({ error: "Mau cari apa?" });
  } catch (error) {
    res.status(500).json({ error: "Gagal narik data/video" });
  }
}
