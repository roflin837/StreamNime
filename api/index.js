const axios = require('axios');

module.exports = async (req, res) => {
    // 1. Ambil apa yang mau dicari (endpoint)
    const { endpoint } = req.query;

    // 2. Setting Header biar Browser lo nggak ngamuk (Anti-CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Kalau browser cuma ngetes koneksi (OPTIONS), langsung oke-in
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 3. Validasi: Jangan sampe endpoint kosong
    if (!endpoint) {
        return res.status(400).json({ error: "Lo mau cari apa, Flinn? Endpoint kosong nih." });
    }

    try {
        // 4. Tembak ke Server Pusat Gogoanime
        const targetUrl = `https://api.consumet.org/anime/gogoanime/${endpoint}`;
        console.log("Lagi nembak ke:", targetUrl); // Buat log di Vercel

        const response = await axios.get(targetUrl, {
            timeout: 5000 // Kalau 5 detik gak respon, anggep gagal
        });

        // 5. Kirim hasilnya ke script.js lo
        return res.status(200).json(response.data);

    } catch (error) {
        console.error("Waduh, Error:", error.message);
        return res.status(500).json({ 
            error: "Server Consumet lagi tepar atau link salah.",
            detail: error.message 
        });
    }
};
