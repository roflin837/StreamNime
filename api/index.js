const axios = require('axios');

module.exports = async (req, res) => {
    const { endpoint } = req.query;
    const servers = [
        "https://api.consumet.org/anime/gogoanime",
        "https://consumet-api-production-e852.up.railway.app/anime/gogoanime"
    ];

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    try {
        // Coba server utama
        const response = await axios.get(`${servers[0]}/${endpoint}`, { timeout: 5000 });
        return res.status(200).json(response.data);
    } catch (error) {
        try {
            // Kalau gagal, paksa server cadangan
            const backup = await axios.get(`${servers[1]}/${endpoint}`, { timeout: 5000 });
            return res.status(200).json(backup.data);
        } catch (err) {
            return res.status(200).json({ results: [] }); 
        }
    }
};
