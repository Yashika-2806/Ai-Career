export default async function handler(req, res) {
  const API_BASE = 'http://72.61.225.129:5001';
  
  // Get the path after /api/
  const path = req.url.replace('/api/', '');
  
  try {
    const response = await fetch(`${API_BASE}/${path}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
