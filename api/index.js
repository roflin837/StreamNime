const axios = require('axios');

module.exports = async (req, res) => {
    const { endpoint } = req.query;
    
    // Daftar 3 API Provider berbeda (Kalau 1 mampet, pindah ke 2, dst)
    const apiSources = [
        "https://api.consumet.org/anime/gogoanime",
        "https://consumet-api-one.vercel.app/anime/gogoanime",
        "https://api.amvstr.me/api/v2/gogoanime" // API Cadangan Super
    ];

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();

    async function fetchWithRetry(index) {
        if (index >= apiSources.length) throw new Error("MAMPET TOTAL");
        try {
            const response = await axios.get(`${apiSources[index]}/${endpoint}`, { timeout: 10000 });
            // Pastiin data beneran ada isinya
            if (response.data && (response.data.results || Array.isArray(response.data))) {
                return response.data;
            }
            throw new Error("Data Kosong");
        } catch (err) {
            return fetchWithRetry(index + 1);
        }
    }

    try {
        const data = await fetchWithRetry(0);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ results: [], error: "API PUSAT MATI" });
    }
};
