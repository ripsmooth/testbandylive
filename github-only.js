/*
 * Bandylive GitHub Pages - no Vercel adapter.
 * NOTE: Browser JavaScript cannot bypass TorneoPal CORS policy. This adapter
 * tries direct requests and reports the browser's real error if CORS blocks them.
 * Shared settings are local to this browser profile; they are NOT synchronized
 * between unrelated devices / OBS profiles.
 */
(function () {
  'use strict';
  const STORE_DEFAULT = 'bandylive.githubOnly.defaultMatch.v1';
  const STORE_VIS = 'bandylive.githubOnly.graphicsVisibility.v1';
  const nativeFetch = window.fetch.bind(window);
  const defaults = { ottelu: '', pvm: '', turnaus: 'sjpl_2627', updatedAt: null };
  const defaultVisibility = { scorebug: true, lowerthird: false, stats: false, lineups: false, updatedAt: null };

  function read(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? Object.assign({}, fallback, JSON.parse(raw)) : Object.assign({}, fallback); }
    catch (_) { return Object.assign({}, fallback); }
  }
  function jsonResponse(data, status) {
    return new Response(JSON.stringify(data), { status: status || 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
  function errResponse(message, status) {
    return new Response(JSON.stringify({ error: message }), { status: status || 503, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
  function getBody(init) {
    try {
      if (init && typeof init.body === 'string') return JSON.parse(init.body);
      return {};
    } catch (_) { return {}; }
  }
  function directUrl(kind, incoming) {
    const u = new URL(incoming.href);
    if (kind === 'live') {
      const target = new URL('https://sjpl.api.torneopal.com/taso/ajax.php');
      target.searchParams.set('db', 'sjpl');
      target.searchParams.set('action', 'liveupdate');
      target.searchParams.set('pvm', u.searchParams.get('pvm') || new Date().toISOString().slice(0, 10));
      target.searchParams.set('turnaus', u.searchParams.get('turnaus') || 'sjpl_2627');
      return target.href;
    }
    if (kind === 'match') {
      const target = new URL('https://finbandy.torneopal.fi/taso/ottelu.php');
      target.searchParams.set('ottelu', u.searchParams.get('ottelu') || '');
      return target.href;
    }
    if (kind === 'standings') {
      const target = new URL('https://finbandy.torneopal.fi/taso/sarja.php');
      target.searchParams.set('turnaus', u.searchParams.get('turnaus') || 'sjpl_2627');
      target.searchParams.set('sarja', u.searchParams.get('sarja') || 'MBL');
      return target.href;
    }
    return null;
  }

  window.fetch = async function (input, init) {
    let incoming;
    try { incoming = new URL(typeof input === 'string' ? input : input.url, location.href); }
    catch (_) { return nativeFetch(input, init); }
    const path = incoming.pathname.replace(/\/$/, '');
    const method = String((init && init.method) || (typeof input !== 'string' && input.method) || 'GET').toUpperCase();

    if (path.endsWith('/api/default-match')) {
      if (method === 'GET') return jsonResponse(read(STORE_DEFAULT, defaults));
      if (method === 'POST') {
        const body = getBody(init);
        const ottelu = String(body.ottelu || '').trim();
        const pvm = String(body.pvm || '').trim();
        const turnaus = String(body.turnaus || 'sjpl_2627').trim();
        if (!/^\d{1,12}$/.test(ottelu)) return errResponse('Anna kelvollinen ottelun ID (numerot).', 400);
        if (pvm && !/^\d{4}-\d{2}-\d{2}$/.test(pvm)) return errResponse('Päivämäärän muodon pitää olla VVVV-KK-PP.', 400);
        if (!/^[a-zA-Z0-9_-]{1,80}$/.test(turnaus)) return errResponse('Virheellinen turnaustunnus.', 400);
        const state = { ottelu, pvm, turnaus, updatedAt: new Date().toISOString() };
        try { localStorage.setItem(STORE_DEFAULT, JSON.stringify(state)); }
        catch (_) { return errResponse('Selaimen paikallinen tallennus ei ole käytettävissä.', 503); }
        return jsonResponse(state);
      }
      return errResponse('GitHub Pages -versiossa sallitaan vain GET ja POST.', 405);
    }

    if (path.endsWith('/api/graphics-state')) {
      if (method === 'GET') return jsonResponse(read(STORE_VIS, defaultVisibility));
      if (method === 'POST') {
        const body = getBody(init), current = read(STORE_VIS, defaultVisibility);
        const next = {
          scorebug: typeof body.scorebug === 'boolean' ? body.scorebug : !!current.scorebug,
          lowerthird: typeof body.lowerthird === 'boolean' ? body.lowerthird : !!current.lowerthird,
          stats: typeof body.stats === 'boolean' ? body.stats : !!current.stats,
          lineups: typeof body.lineups === 'boolean' ? body.lineups : !!current.lineups,
          updatedAt: new Date().toISOString()
        };
        try { localStorage.setItem(STORE_VIS, JSON.stringify(next)); }
        catch (_) { return errResponse('Selaimen paikallinen tallennus ei ole käytettävissä.', 503); }
        return jsonResponse(next);
      }
      return errResponse('GitHub Pages -versiossa sallitaan vain GET ja POST.', 405);
    }

    let kind = null;
    if (path.endsWith('/api/live')) kind = 'live';
    else if (path.endsWith('/api/match')) kind = 'match';
    else if (path.endsWith('/api/standings')) kind = 'standings';
    if (kind) {
      const target = directUrl(kind, incoming);
      // Use native fetch intentionally: browser CORS is enforced and cannot be bypassed here.
      return nativeFetch(target, Object.assign({ cache: 'no-store' }, init || {}));
    }
    return nativeFetch(input, init);
  };

  window.BANDYLIVE_GITHUB_ONLY = {
    mode: 'github-pages-direct',
    limitations: [
      'TorneoPalin suorat haut riippuvat TorneoPalin CORS-asetuksista.',
      'Oletusottelu ja grafiikoiden näkyvyys tallennetaan vain tähän selaimen profiiliin.',
      'GitHub Pages ei tarjoa palvelinpuolen API-reittejä.'
    ]
  };
})();
