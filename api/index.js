const axios = require('axios');

export default async function handler(req, res) {
  // Ambil endpoint dari query string (misal: /api?endpoint=top-airing)
  const { endpoint } = req.query;
  
  // Base URL Consumet (Gue kasih cadangan yang lebih stabil)
  const CONSUMET_URL = "https://api.consumet.org/anime/gogoanime";

  try {
    const response = await axios.get(`${CONSUMET_URL}/${endpoint}`);
    
    // Kasih header biar gak diblokir browser
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ error: "Server Consumet lagi tepar, Flinn!" });
  }
}
