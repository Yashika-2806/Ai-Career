export default async function handler(req, res) {
  // CRITICAL: Set CORS headers BEFORE any logic
  const allowedOrigins = ['https://ai-career-0628.vercel.app', 'http://localhost:5173', 'http://localhost:5174'];
  const origin = req.headers.origin || req.headers.referer || allowedOrigins[0];
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');

  // CRITICAL: Handle OPTIONS immediately
  if (req.method === 'OPTIONS') {
    console.log('✓ OPTIONS preflight handled for:', req.url);
    return res.status(200).end();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 PROXY FUNCTION INVOKED');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', req.body);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const API_BASE = 'http://72.61.225.129:5001';
  
  // Get the full path after /api
  const apiPath = req.url.replace(/^\/api/, '');
  const targetUrl = `${API_BASE}${apiPath}`;

  console.log('→ Target URL:', targetUrl);

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
      if (req.body) {
        fetchOptions.body = JSON.stringify(req.body);
        console.log('→ Request body:', fetchOptions.body);
      } else {
        console.log('⚠️  No body in request');
      }
    }
    console.log('→ Fetching from backend...');
    const response = await fetch(targetUrl, fetchOptions);
    console.log('✓ Backend responded:', response.status, response.statusText);
    
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log('✓ Response data:', JSON.stringify(data).substring(0, 200));
    // Return proxied response
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ PROXY ERROR');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return res.status(500).json({
      success: false,
      error: 'Proxy failed to reach backend',
      message: error.message,
      details: 'Check Vercel function logs for details',
      stack: error.stack
    });
  }
}

// Export configuration for Vercel
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};
