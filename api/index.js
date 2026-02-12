const axios = require('axios');

module.exports = async (req, res) => {
    const { endpoint } = req.query;
    // Pake URL Consumet yang paling stabil saat ini
    const targetUrl = `https://api.consumet.org/anime/gogoanime/${endpoint}`;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const response = await axios.get(targetUrl, { timeout: 10000 });
        // Kalau Gogoanime lagi maintenance, kita kasih tau script.js
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("API Error:", error.message);
        return res.status(500).json({ results: [], error: error.message });
    }
};
