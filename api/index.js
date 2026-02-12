const axios = require('axios');

module.exports = async (req, res) => {
    const { endpoint } = req.query;
    const targetUrl = `https://api.consumet.org/anime/gogoanime/${endpoint}`;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const response = await axios.get(targetUrl, { timeout: 8000 });
        return res.status(200).json(response.data);
    } catch (error) {
        // Balikin data kosong biar script.js gak crash kalau API pusat lagi down
        return res.status(200).json({ results: [] });
    }
};
