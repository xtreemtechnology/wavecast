export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({ error: 'Missing target url parameter.' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send(`CORS proxy failed to fetch RSS feed: ${response.statusText}`);
    }

    const text = await response.text();

    // Set CORS headers so the browser can read it
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Set appropriate RSS/XML content type
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    
    return res.status(200).send(text);
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: error.message });
  }
}
