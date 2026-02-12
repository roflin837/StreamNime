const axios = require('axios');

export default async function handler(req, res) {
  // Ambil endpoint dari query string
  const { endpoint } = req.query;
  
  if (!endpoint) {
    return res.status(400).json({ error: "Endpointnya mana, Flinn?" });
  }

  // Daftar server Consumet cadangan
  const servers = [
    "https://api.consumet.org/anime/gogoanime",
    "https://consumet-api-production-e852.up.railway.app/anime/gogoanime"
  ];

  // Tambahkan Header CORS biar browser gak ngeblokir
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Tembak server pertama
    const response = await axios.get(`${servers[0]}/${endpoint}`);
    return res.status(200).json(response.data);
  } catch (error) {
    try {
      // Kalau gagal, tembak server cadangan
      const response = await axios.get(`${servers[1]}/${endpoint}`);
      return res.status(200).json(response.data);
    } catch (err) {
      console.error("Semua API tepar:", err.message);
      return res.status(500).json({ error: "Server Consumet lagi down parah!" });
    }
  }
}
