export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_BASE = 'http://72.61.225.129:5001';
  
  // Get the full path after /api
  const apiPath = req.url.replace(/^\/api/, '');
  const targetUrl = `${API_BASE}${apiPath}`;

  console.log('Proxying:', req.method, targetUrl, req.body);

  try {
    // Build headers
    const headers = {
      'Content-Type': 'application/json',
    };

    // Copy Authorization header if present
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const fetchOptions = {
      method: req.method,
      headers: headers,
    };

    // Add body for POST/PUT/PATCH/DELETE
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      // Vercel already parses req.body as an object
      fetchOptions.body = JSON.stringify(req.body);
      console.log('Request body:', fetchOptions.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log('Backend response:', response.status, data);
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Proxy error', 
      message: error.message,
      stack: error.stack
    });
  }
}
