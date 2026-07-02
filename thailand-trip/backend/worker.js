// Cloudflare Worker: proxies Claude API requests for the Thailand trip app's
// group mode, so the whole group shares one Anthropic API key (kept secret,
// server-side) instead of each person needing their own key.
//
// Access is gated by a shared ACCESS_CODE secret, not a full user system —
// this is meant for a small closed group (family/friends), not public use.

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/v1/messages' || request.method !== 'POST') {
      return json({ error: { message: 'Not found' } }, 404, cors);
    }

    const accessCode = request.headers.get('x-access-code');
    if (!accessCode || accessCode !== env.ACCESS_CODE) {
      return json({ error: { message: 'קוד גישה שגוי' } }, 401, cors);
    }

    const body = await request.text();

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body
    });

    const headers = new Headers(upstream.headers);
    Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
    return new Response(upstream.body, { status: upstream.status, headers });
  }
};

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, x-access-code'
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'content-type': 'application/json' }
  });
}
