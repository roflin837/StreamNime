// api/index.js
export default async function handler(req, res) {
  const { path } = req.query;
  const API_URL = "https://api.jikan.moe/v4";

  // Header wajib buat nembus blokir browser
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (!path) {
    return res.status(400).json({ error: "Path kosong, Flinn!" });
  }

  try {
    const response = await fetch(`${API_URL}${decodeURIComponent(path)}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Gagal ambil data" });
  }
}
