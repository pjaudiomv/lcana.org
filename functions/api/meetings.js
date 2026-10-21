// GET /api/meetings — server-side proxy + edge cache for the LCANA meeting feed.
// Keeps the browser from calling bmlt.sezf.org directly and caches the result
// at Cloudflare's edge so the homepage loads fast and stays up if BMLT is slow.
const BMLT_URL = 'https://bmlt.sezf.org/main_server/client_interface/json/' +
  '?switcher=GetSearchResults&get_used_formats=1&services[]=172&services[]=110&services[]=111';

export async function onRequestGet() {
  try {
    const upstream = await fetch(BMLT_URL, { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!upstream.ok) throw new Error('BMLT ' + upstream.status);
    return new Response(upstream.body, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=600, s-maxage=3600',
        'x-content-type-options': 'nosniff'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Meeting list is temporarily unavailable.' }), {
      status: 502,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
  }
}
