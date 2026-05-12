import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const M3U_INDEX   = "https://iptv-org.github.io/iptv/index.m3u";
const M3U_SPORTS  = "https://iptv-org.github.io/iptv/categories/sports.m3u";

const PROXIES = [
  u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://thingproxy.freeboard.io/fetch/${u}`,
];

// ─── HLS Config (tuned for IPTV) ─────────────────────────────────────────────
const HLS_CFG = {
  maxBufferLength: 60,
  maxMaxBufferLength: 120,
  startLevel: 0,
  abrEwmaDefaultEstimate: 500000,
  testBandwidth: false,
  progressive: true,
  lowLatencyMode: false,
  fragLoadingTimeOut: 8000,
  manifestLoadingTimeOut: 8000,
  fragLoadingMaxRetry: 3,
  manifestLoadingMaxRetry: 3,
  enableWorker: false,
};

async function fetchWithFallback(url) {
  // Try direct first — iptv-org has open CORS
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (res.ok) {
      const text = await res.text();
      if (text.includes("#EXTM3U")) return text;
    }
  } catch {}

  // Then try proxies
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(url), { signal: AbortSignal.timeout(12000) });
      if (!res.ok) throw new Error();
      const text = await res.text();
      if (text.includes("#EXTM3U")) return text;
    } catch {}
  }
  throw new Error("All sources failed");
                                             }

// ─── M3U Parser ──────────────────────────────────────────────────────────────
function parseM3U(raw) {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const out = []; let meta = {}; let id = Date.now();
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      meta = {
        name:  (lines[i].match(/,(.+)$/)                 || [])[1]?.trim() || "Unknown",
        group: (lines[i].match(/group-title="([^"]*)"/i) || [])[1]?.trim() || "Other",
        logo:  (lines[i].match(/tvg-logo="([^"]*)"/i)    || [])[1]?.trim() || "",
      };
    } else if (lines[i].startsWith("http") && meta.name) {
      out.push({ uid: `${meta.name}-${id++}`, ...meta, url: lines[i] });
      meta = {};
    }
  }
  return out;
}

// ─── Category styles ─────────────────────────────────────────────────────────
const CAT_STYLE = {
  News:          { bg: "rgba(59,130,246,0.18)",  text: "#60a5fa" },
  Sports:        { bg: "rgba(16,185,129,0.18)",  text: "#34d399" },
  Music:         { bg: "rgba(236,72,153,0.18)",  text: "#f472b6" },
  Kids:          { bg: "rgba(245,158,11,0.18)",  text: "#fbbf24" },
  Entertainment: { bg: "rgba(168,85,247,0.18)",  text: "#c084fc" },
  Documentary:   { bg: "rgba(20,184,166,0.18)",  text: "#2dd4bf" },
  Movies:        { bg: "rgba(239,68,68,0.18)",   text: "#f87171" },
  Religious:     { bg: "rgba(251,191,36,0.18)",  text: "#fde68a" },
  Other:         { bg: "rgba(148,163,184,0.18)", text: "#94a3b8" },
};

function getStyle(group) {
  for (const key of Object.keys(CAT_STYLE)) {
    if (group?.toLowerCase().includes(key.toLowerCase())) return CAT_STYLE[key];
  }
  return CAT_STYLE.Other;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IcoTv = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/>
  </svg>
);
const IcoWifi = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>
  </svg>
);
const IcoHeart = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IcoPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const IcoX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IcoRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcoSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IcoMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const IcoSports = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M4.93 4.93l4.24 4.24"/><path d="M14.83 9.17l4.24-4.24"/>
    <path d="M14.83 14.83l4.24 4.24"/><path d="M9.17 14.83l-4.24 4.24"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>
);

// ─── HLS Player ───────────────────────────────────────────────────────────────
function HLSPlayer({ url, onError }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    if (!url || !videoRef.current) return;
    const video = videoRef.current;

    const loadHLS = async () => {
      try {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          video.play().catch(() => {});
        } else {
          const HLS = (await import("https://cdn.jsdelivr.net/npm/hls.js@1.5.7/dist/hls.min.js")).default || window.Hls;
          if (!HLS) { onError?.(); return; }
          if (hlsRef.current) hlsRef.current.destroy();
          const hls = new HLS(HLS_CFG);
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(HLS.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
          hls.on(HLS.Events.ERROR, (_, data) => { if (data.fatal) onError?.(); });
        }
      } catch { onError?.(); }
    };

    loadHLS();
    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [url]);

  return <video ref={videoRef} controls autoPlay playsInline />;
}

// ─── Channel Card ─────────────────────────────────────────────────────────────
function ChannelCard({ ch, dark, isFav, onWatch, onToggleFav }) {
  const cs = getStyle(ch.group);
  const [imgErr, setImgErr] = useState(false);
  const bd = dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";

  return (
    <div style={{
      background: dark ? "rgba(255,255,255,0.04)" : "#fff",
      border: bd, borderRadius: 18, overflow: "hidden",
      display: "flex", flexDirection: "column",
      boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.08)",
    }}>
      <div style={{ height: 3, background: cs.text }} />
      <div style={{ padding: "12px 12px 14px", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ background: cs.bg, color: cs.text, borderRadius: 20, padding: "3px 9px", fontSize: 9, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase" }}>
            {ch.group}
          </span>
          <button onClick={() => onToggleFav(ch.uid)}
            style={{ background: "none", border: "none", cursor: "pointer", color: isFav ? "#ec4899" : dark ? "#374151" : "#d1d5db", padding: 0, lineHeight: 0 }}>
            <IcoHeart filled={isFav} />
          </button>
        </div>

        <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {ch.logo && !imgErr
            ? <img src={ch.logo} alt={ch.name} onError={() => setImgErr(true)}
                style={{ maxHeight: 48, maxWidth: "100%", objectFit: "contain", borderRadius: 6 }} />
            : <div style={{ width: 44, height: 44, borderRadius: 12, background: cs.bg, display: "flex", alignItems: "center", justifyContent: "center", color: cs.text }}><IcoTv /></div>
          }
        </div>

        <div style={{ fontWeight: 800, fontSize: 12, lineHeight: 1.35, color: dark ? "#e2e8f0" : "#1e293b", minHeight: 30 }}>
          {ch.name}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 5px rgba(239,68,68,0.9)", display: "inline-block" }} />
          <span style={{ fontSize: 9, fontWeight: 800, color: "#ef4444" }}>LIVE</span>
          <span style={{ fontSize: 9, color: dark ? "#4b5568" : "#94a3b8" }}>· Free</span>
        </div>

        <button onClick={() => onWatch(ch)} style={{
          background: "linear-gradient(135deg,#7c3aed,#ec4899)", border: "none", borderRadius: 11,
          color: "#fff", fontWeight: 800, fontSize: 11, padding: "9px 0", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          boxShadow: "0 4px 12px rgba(124,58,237,0.35)", marginTop: "auto", fontFamily: "inherit"
        }}>
          <IcoPlay /> Watch
        </button>
      </div>
    </div>
  );
}

// ─── Player Modal ─────────────────────────────────────────────────────────────
function PlayerModal({ ch, dark, isFav, onClose, onToggleFav }) {
  const [err, setErr]           = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [imgErr, setImgErr]     = useState(false);
  const cs = getStyle(ch.group);
  const bd = dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)";

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(10px)", zIndex: 1000,
      display: "flex", alignItems: "flex-end", justifyContent: "center"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: dark ? "#12141f" : "#f8fafc",
        borderRadius: "26px 26px 0 0", width: "100%", maxWidth: 520,
        overflow: "hidden", boxShadow: "0 -8px 48px rgba(0,0,0,0.6)",
        animation: "slideUp 0.25s cubic-bezier(.22,.68,0,1.2)"
      }}>
        <div style={{ background: "#000" }}>
          {err
            ? <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{ fontSize: 40 }}>📡</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#94a3b8" }}>Stream unavailable</span>
                <span style={{ fontSize: 11, color: "#4b5568", textAlign: "center", maxWidth: 220 }}>May be geo-restricted or offline</span>
              </div>
            : <HLSPlayer key={retryKey} url={ch.url} onError={() => setErr(true)} />
          }
        </div>

        <div style={{ padding: "18px 18px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 50, height: 50, borderRadius: 13, background: dark ? "rgba(255,255,255,0.07)" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
              {ch.logo && !imgErr
                ? <img src={ch.logo} alt={ch.name} onError={() => setImgErr(true)} style={{ maxWidth: 42, maxHeight: 42, objectFit: "contain" }} />
                : <span style={{ color: cs.text }}><IcoTv /></span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 16, color: dark ? "#f1f5f9" : "#0f172a", lineHeight: 1.2 }}>{ch.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 5px rgba(239,68,68,0.9)", display: "inline-block" }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: "#ef4444" }}>LIVE</span>
                <span style={{ background: cs.bg, color: cs.text, borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 800, textTransform: "uppercase" }}>{ch.group}</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", border: "none", borderRadius: 11, padding: 8, cursor: "pointer", color: dark ? "#94a3b8" : "#64748b", display: "flex", lineHeight: 0 }}>
              <IcoX />
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <button onClick={() => onToggleFav(ch.uid)} style={{
              flex: 1, padding: "12px", border: bd,
              background: dark ? "rgba(255,255,255,0.05)" : "#fff",
              borderRadius: 13, fontWeight: 800, fontSize: 12, cursor: "pointer",
              color: isFav ? "#ec4899" : dark ? "#94a3b8" : "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit"
            }}>
              <IcoHeart filled={isFav} /> {isFav ? "Saved" : "Save"}
            </button>
            <button onClick={() => { setErr(false); setRetryKey(k => k + 1); }} style={{
              flex: 1, padding: "12px",
              background: "linear-gradient(135deg,#7c3aed,#ec4899)", border: "none",
              borderRadius: 13, fontWeight: 800, fontSize: 12, cursor: "pointer",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: "0 4px 14px rgba(124,58,237,0.4)", fontFamily: "inherit"
            }}>
              <IcoRefresh /> Retry
            </button>
          </div>

          <div style={{ fontSize: 11, color: dark ? "#374151" : "#94a3b8", lineHeight: 1.7 }}>
            💡 Buffer tuned for fast start · Tap F for fit · ⚙ for quality
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sources Tab ──────────────────────────────────────────────────────────────
function SourcesTab({ dark, onLoadChannels }) {
  const [primary,  setPrimary]  = useState(M3U_INDEX);
  const [fallback, setFallback] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [loaded,   setLoaded]   = useState([]);
  const [msg,      setMsg]      = useState("");

  const inp = {
    width: "100%", padding: "12px 14px", borderRadius: 13,
    border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.1)",
    background: dark ? "rgba(0,0,0,0.3)" : "#fff",
    color: dark ? "#e2e8f0" : "#1e293b",
    fontSize: 12, fontFamily: "inherit", outline: "none",
  };

  const label = t => (
    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: dark ? "#4b5568" : "#94a3b8", marginBottom: 8 }}>{t}</div>
  );

  const handleLoad = async () => {
    setLoading(true); setMsg("");
    const urls = [primary, fallback].filter(Boolean);
    for (const url of urls) {
      try {
        setMsg(`⏳ Trying ${url === primary ? "primary" : "fallback"}…`);
        const text = await fetchWithFallback(url);
        const parsed = parseM3U(text);
        setLoaded(parsed);
        onLoadChannels(parsed);
        setMsg(`✅ Loaded ${parsed.length} channels`);
        setLoading(false);
        return;
      } catch {
        setMsg(`⚠️ ${url === primary ? "Primary" : "Fallback"} failed, trying next…`);
      }
    }
    setMsg("❌ All sources failed. Check your URLs.");
    setLoading(false);
  };

  const card = {
    background: dark ? "rgba(255,255,255,0.04)" : "#fff",
    border: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
    borderRadius: 18, padding: "18px", marginBottom: 14
  };

  return (
    <div style={{ padding: "18px 16px 100px" }}>
      <div style={card}>
        {label("Primary M3U Source")}
        <input style={inp} value={primary} onChange={e => setPrimary(e.target.value)}
          placeholder="https://iptv-org.github.io/iptv/index.m3u" />
      </div>

      <div style={card}>
        {label("Fallback URL (optional)")}
        <input style={{ ...inp, marginBottom: 14 }} value={fallback} onChange={e => setFallback(e.target.value)}
          placeholder="https://backup.com/playlist.m3u" />
        <button onClick={handleLoad} disabled={loading} style={{
          width: "100%", padding: "13px",
          background: "linear-gradient(135deg,#7c3aed,#ec4899)",
          border: "none", borderRadius: 13, color: "#fff",
          fontWeight: 900, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 6px 20px rgba(124,58,237,0.4)", opacity: loading ? 0.7 : 1,
          fontFamily: "inherit"
        }}>
          {loading ? "Loading…" : "Load M3U"}
        </button>
      </div>

      {msg && (
        <div style={{ padding: "12px 14px", borderRadius: 13,
          background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
          border: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
          fontSize: 12, color: dark ? "#94a3b8" : "#64748b", marginBottom: 14 }}>
          {msg}
        </div>
      )}

      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: dark ? "#4b5568" : "#94a3b8", marginBottom: 10 }}>
        Loaded Sources ({loaded.length > 0 ? 1 : 0})
      </div>

      {loaded.length === 0
        ? <div style={{ textAlign: "center", padding: "40px 20px", color: dark ? "#374151" : "#94a3b8", fontSize: 13, fontWeight: 600 }}>No sources loaded yet</div>
        : <div style={{ ...card, marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.7)", display: "inline-block" }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: dark ? "#e2e8f0" : "#1e293b" }}>{loaded.length} channels loaded</span>
            </div>
            <div style={{ fontSize: 11, color: dark ? "#374151" : "#94a3b8", marginTop: 6 }}>
              <span style={{ fontWeight: 800, color: "#7c3aed" }}>Built-in:</span> DW · Al Jazeera · France 24 · Euronews · BBC · CGTN — fetched live from iptv-org.
            </div>
          </div>
      }
    </div>
  );
}

// ─── Sports Tab ───────────────────────────────────────────────────────────────
function SportsTab({ dark, onWatch, favorites, onToggleFav }) {
  const [channels, setChannels] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [error,    setError]    = useState("");

  const bd  = dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";
  const sub = dark ? "#4b5568" : "#94a3b8";

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const text = await fetchWithFallback(M3U_SPORTS);
        const parsed = parseM3U(text);
        setChannels(parsed);
      } catch {
        setError("Failed to load sports channels. Check your connection.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const list = channels.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Sports Hero */}
      <div style={{ margin: "14px 14px 0", padding: "20px 18px", borderRadius: 18, background: "linear-gradient(135deg,rgba(16,185,129,0.18),rgba(59,130,246,0.12))", border: dark ? "1px solid rgba(16,185,129,0.15)" : "1px solid rgba(16,185,129,0.2)" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#34d399", marginBottom: 5 }}>Live · Free · HD</div>
        <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 900, fontSize: 22, background: "linear-gradient(135deg,#34d399,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2, marginBottom: 5 }}>
          Live Sports<br />Channels
        </div>
        <div style={{ fontSize: 11, color: sub }}>{loading ? "Loading…" : `${channels.length} sports channels`}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite", display: "inline-block" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444" }}>LIVE NOW</span>
          <span style={{ fontSize: 10, color: sub }}>· Football · Cricket · NBA & more</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "12px 14px 4px", position: "relative" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sports channels..."
          style={{ width: "100%", padding: "10px 12px 10px 34px", borderRadius: 13, border: bd, background: dark ? "rgba(255,255,255,0.06)" : "#fff", color: dark ? "#e2e8f0" : "#1e293b", fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        <span style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", color: sub }}><IcoSearch /></span>
      </div>

      <div style={{ padding: "4px 16px 8px", fontSize: 10, color: sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
        {list.length} Channels
      </div>

      {loading
        ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid rgba(16,185,129,0.2)", borderTopColor: "#34d399", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: 12, color: sub, fontWeight: 700 }}>Fetching sports channels…</div>
          </div>
        : error
          ? <div style={{ textAlign: "center", padding: "60px 20px", color: "#ef4444", fontSize: 13, fontWeight: 700 }}>{error}</div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 11, padding: "0 13px" }}>
              {list.slice(0, 200).map(ch => (
                <ChannelCard key={ch.uid} ch={ch} dark={dark} isFav={favorites.includes(ch.uid)} onWatch={onWatch} onToggleFav={onToggleFav} />
              ))}
              {list.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 20px", color: sub, fontWeight: 700 }}>No channels found ⚽</div>
              )}
            </div>
      }
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function NileTV() {
  const [dark,      setDark]      = useState(true);
  const [tab,       setTab]       = useState("channels");
  const [channels,  setChannels]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [cat,       setCat]       = useState("All");
  const [playing,   setPlaying]   = useState(null);
  const [error,     setError]     = useState("");

  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("niletv_favs") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("niletv_favs", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFav = uid =>
    setFavorites(p => p.includes(uid) ? p.filter(f => f !== uid) : [...p, uid]);

  // Auto-fetch channels on mount with full fallback chain
  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const text = await fetchWithFallback(M3U_INDEX);
        setChannels(parseM3U(text));
      } catch {
        setError("Failed to load channels. Try adding a source manually.");
        setChannels([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cats = ["All", ...Array.from(new Set(channels.map(c => c.group))).slice(0, 14)];

  const list = tab === "saved"
    ? channels.filter(c => favorites.includes(c.uid))
    : channels.filter(c =>
        (cat === "All" || c.group === cat) &&
        (!search || c.name.toLowerCase().includes(search.toLowerCase()))
      );

  const bg  = dark ? "#0d0f1a" : "#f0f2f7";
  const tx  = dark ? "#e2e8f0" : "#0f172a";
  const sub = dark ? "#4b5568" : "#94a3b8";
  const bd  = dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";

  return (
    <div style={{ background: bg, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans',sans-serif", color: tx }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Outfit:wght@800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.3);border-radius:3px}
        @keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.75)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* ── Header ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100,
        background: dark ? "rgba(13,15,26,0.92)" : "rgba(240,242,247,0.92)",
        backdropFilter: "blur(14px)", borderBottom: bd,
        padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>

        <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, boxShadow: "0 4px 14px rgba(124,58,237,0.4)" }}>
          <IcoTv />
        </div>

        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 900, fontSize: 18, background: "linear-gradient(135deg,#7c3aed,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Nile TV</div>
          <div style={{ fontSize: 9, color: sub, fontWeight: 600 }}>
            {loading ? "Loading…" : `${channels.length} channels · Free live TV`}
          </div>
        </div>

        {(tab === "channels" || tab === "saved") && (
          <div style={{ flex: 1, position: "relative" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search channels..."
              style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: 11, border: bd, background: dark ? "rgba(255,255,255,0.06)" : "#fff", color: tx, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: sub }}><IcoSearch /></span>
          </div>
        )}

        {tab === "sports" && <div style={{ flex: 1 }} />}
        {tab === "sources" && <div style={{ flex: 1 }} />}

        <button onClick={() => setDark(d => !d)} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", border: "none", borderRadius: 11, padding: 8, cursor: "pointer", color: sub, display: "flex", flexShrink: 0, lineHeight: 0 }}>
          {dark ? <IcoSun /> : <IcoMoon />}
        </button>
      </div>

      {/* ── Channels Tab ── */}
      {tab === "channels" && (
        <>
          <div style={{ margin: "14px 14px 0", padding: "20px 18px", borderRadius: 18, background: "linear-gradient(135deg,rgba(124,58,237,0.18),rgba(236,72,153,0.12))", border: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(124,58,237,0.12)" }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#a78bfa", marginBottom: 5 }}>Free · Live · 24/7</div>
            <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 900, fontSize: 22, background: "linear-gradient(135deg,#ec4899,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2, marginBottom: 5 }}>
              Your River to<br />International TV
            </div>
            <div style={{ fontSize: 11, color: sub }}>{channels.length} channels loaded</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite", display: "inline-block" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444" }}>LIVE NOW</span>
              <span style={{ fontSize: 10, color: sub }}>· No sign-up needed</span>
              <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#a78bfa" }}>🛡 Free</span>
            </div>
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 7, padding: "12px 14px 4px", overflowX: "auto" }}>
            {cats.map(c => {
              const active = cat === c;
              return (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding: "6px 14px", borderRadius: 50, border: active ? "none" : bd,
                  background: active ? "linear-gradient(135deg,#7c3aed,#ec4899)" : dark ? "rgba(255,255,255,0.05)" : "#fff",
                  color: active ? "#fff" : sub, fontWeight: active ? 800 : 600,
                  fontSize: 11, cursor: "pointer", whiteSpace: "nowrap",
                  boxShadow: active ? "0 4px 12px rgba(124,58,237,0.4)" : "none",
                  fontFamily: "inherit", flexShrink: 0
                }}>{c}</button>
              );
            })}
          </div>

          <div style={{ padding: "4px 16px 8px", fontSize: 10, color: sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            {list.length} Channels
          </div>

          {loading
            ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7c3aed", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 12, color: sub, fontWeight: 700 }}>Fetching live channels…</div>
              </div>
            : error
              ? <div style={{ textAlign: "center", padding: "60px 20px", color: "#ef4444", fontSize: 13, fontWeight: 700 }}>{error}</div>
              : <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 11, padding: "0 13px 90px" }}>
                  {list.slice(0, 200).map(ch => (
                    <ChannelCard key={ch.uid} ch={ch} dark={dark} isFav={favorites.includes(ch.uid)} onWatch={setPlaying} onToggleFav={toggleFav} />
                  ))}
                  {list.length === 0 && (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 20px", color: sub, fontWeight: 700 }}>No channels found 📺</div>
                  )}
                </div>
          }
        </>
      )}

      {/* ── Sports Tab ── */}
      {tab === "sports" && (
        <SportsTab dark={dark} onWatch={setPlaying} favorites={favorites} onToggleFav={toggleFav} />
      )}

      {/* ── Sources Tab ── */}
      {tab === "sources" && (
        <SourcesTab dark={dark} onLoadChannels={chs => { setChannels(chs); setTab("channels"); }} />
      )}

      {/* ── Saved Tab ── */}
      {tab === "saved" && (
        <div style={{ padding: "14px 13px 90px" }}>
          <div style={{ fontSize: 10, color: sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            {list.length} saved channel{list.length !== 1 ? "s" : ""}
          </div>
          {list.length === 0
            ? <div style={{ textAlign: "center", padding: "60px 20px", color: sub, fontSize: 13, fontWeight: 600 }}>No saved channels yet ♡</div>
            : <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 11 }}>
                {list.map(ch => (
                  <ChannelCard key={ch.uid} ch={ch} dark={dark} isFav={true} onWatch={setPlaying} onToggleFav={toggleFav} />
                ))}
              </div>
          }
        </div>
      )}

      {/* ── Bottom Nav ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        background: dark ? "rgba(13,15,26,0.96)" : "rgba(240,242,247,0.97)",
        backdropFilter: "blur(16px)", borderTop: bd,
        display: "flex", justifyContent: "space-around", padding: "10px 0 16px" }}>
        {[
          { key: "channels", label: "Channels", Icon: IcoTv },
          { key: "sports",   label: "Sports",   Icon: IcoSports },
          { key: "sources",  label: "Sources",  Icon: IcoWifi },
          { key: "saved",    label: "Saved",    Icon: IcoHeart },
        ].map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              color: active
                ? (key === "saved" ? "#ec4899" : key === "sports" ? "#34d399" : "#7c3aed")
                : sub,
              fontFamily: "inherit", padding: "0 16px"
            }}>
              <Icon filled={key === "saved" && active} />
              <span style={{ fontSize: 10, fontWeight: active ? 800 : 600 }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Player Modal ── */}
      {playing && (
        <PlayerModal ch={playing} dark={dark} isFav={favorites.includes(playing.uid)}
          onClose={() => setPlaying(null)} onToggleFav={toggleFav} />
      )}
    </div>
  );
}
