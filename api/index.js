const axios = require('axios');

module.exports = async (req, res) => {
    const { endpoint } = req.query;
    
    // Daftar server pusat Consumet dunia (Serep kalau satu down)
    const apiSources = [
        "https://api.consumet.org/anime/gogoanime",
        "https://consumet-api-production-e852.up.railway.app/anime/gogoanime",
        "https://api-consumet-org-five.vercel.app/anime/gogoanime"
    ];

    // Header Keamanan & Akses Global
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (!endpoint) return res.status(400).json({ error: "Endpoint mana nyet?" });

    // Fungsi paksa narik data sampe dapet
    async function tryFetch(index) {
        if (index >= apiSources.length) throw new Error("Semua server dunia tepar!");
        
        try {
            const url = `${apiSources[index]}/${endpoint}`;
            const response = await axios.get(url, { timeout: 8000 });
            return response.data;
        } catch (err) {
            console.error(`Server ${index} gagal, nyoba server berikutnya...`);
            return tryFetch(index + 1);
        }
    }

    try {
        const data = await tryFetch(0);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ results: [], message: error.message });
    }
};
