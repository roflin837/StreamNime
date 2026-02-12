export default async function handler(req, res) {
  // 1. Ambil path dari query string
  const { path } = req.query;
  const API_URL = "https://api.jikan.moe/v4";

  // 2. Header CORS (Wajib biar frontend lo bisa akses)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request (khusus browser)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 3. Validasi: Jangan biarkan fetch jalan kalau path kosong
  if (!path || path === "undefined") {
    return res.status(400).json({
      error: "Mana path-nya, Flinn? Jangan dikosongin!",
    });
  }

  try {
    // 4. Proses Fetch ke Jikan API
    const targetUrl = `${API_URL}${decodeURIComponent(path)}`;
    const response = await fetch(targetUrl);

    // Cek kalau Jikan lagi sibuk (Rate Limit)
    if (response.status === 429) {
      return res
        .status(429)
        .json({ error: "Server Jikan lagi rame, coba sedetik lagi." });
    }

    const data = await response.json();

    // 5. Kirim hasil ke frontend
    res.status(200).json(data);
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Server Backend lagi teler." });
  }
}
