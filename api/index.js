import axios from 'axios';

export default async function handler(req, res) {
  const { path, animeId, episode } = req.query;
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Jalur data poster (Jikan)
    if (path) {
      const response = await axios.get(`https://api.jikan.moe/v4${path}`);
      return res.status(200).json(response.data);
    }

    // Jalur nembak VIDEO (Scraping via Consumet)
    if (animeId && episode) {
      // Kita pake provider Gogoanime karena paling stabil gratisannya
      const streamRes = await axios.get(`https://consumet-api-production-e816.up.railway.app/anime/gogoanime/watch/${animeId}-episode-${episode}`);
      return res.status(200).json(streamRes.data);
    }
  } catch (error) {
    res.status(500).json({ error: "Gagal narik data" });
  }
}
