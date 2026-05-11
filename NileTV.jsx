import { useState, useEffect, useRef } from "react";

const CHANNELS = [
  // NEWS
  { id: 1, name: "Al Jazeera English", category: "News", country: "🇶🇦", url: "https://live-hls-web-aje.getaj.net/AJE/01.m3u8" },
  { id: 2, name: "DW English", category: "News", country: "🇩🇪", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8" },
  { id: 3, name: "France 24 English", category: "News", country: "🇫🇷", url: "https://stream.france24.com/hls/live/2037078/F24_EN_LO_HLS/master.m3u8" },
  { id: 4, name: "NASA TV", category: "News", country: "🇺🇸", url: "https://nasatv-lh.akamaihd.net/i/NASA_101@319270/master.m3u8" },
  { id: 5, name: "Bloomberg TV", category: "News", country: "🇺🇸", url: "https://bcovlive-a.akamaihd.net/7c8a0f3627ec4b44bfd37ea92f342cba/eu-central-1/5324900973001/playlist.m3u8" },
  { id: 6, name: "Euronews English", category: "News", country: "🇪🇺", url: "https://euronews-euronews-worldwide-1-eu.rakuten.wurl.tv/playlist.m3u8" },
  // SPORTS
  { id: 7, name: "Eurosport 1", category: "Sports", country: "🇪🇺", url: "https://d35e55s7bxkvon.cloudfront.net/eurosport1/eurosport1.isml/eurosport1-audio_und_Track5=96000-video=5128000.m3u8" },
  { id: 8, name: "beIN Sports", category: "Sports", country: "🇶🇦", url: "https://bein-sports.akamaized.net/hls/live/master.m3u8" },
  { id: 9, name: "Sky Sports News", category: "Sports", country: "🇬🇧", url: "https://skysports-skysportsnews-1-gb.samsung.wurl.tv/playlist.m3u8" },
  { id: 10, name: "ESPN International", category: "Sports", country: "🇺🇸", url: "https://espn-espninternational-1-us.samsung.wurl.tv/playlist.m3u8" },
  // MUSIC
  { id: 11, name: "MTV Hits", category: "Music", country: "🇬🇧", url: "https://mtvhits-lh.akamaihd.net/i/MTVHits_1@304661/master.m3u8" },
  { id: 12, name: "VH1", category: "Music", country: "🇺🇸", url: "https://vh1-vh1-1-us.samsung.wurl.tv/playlist.m3u8" },
  { id: 13, name: "BET Soul", category: "Music", country: "🇺🇸", url: "https://betsoul-lh.akamaihd.net/i/BETSoul_1@304661/master.m3u8" },
  { id: 14, name: "Trace Urban", category: "Music", country: "🇿🇦", url: "https://tracetv-lh.akamaihd.net/i/TraceUrban_1@304661/master.m3u8" },
  // CARTOONS
  { id: 15, name: "Cartoon Network", category: "Cartoons", country: "🇺🇸", url: "https://cartoonnetwork-lh.akamaihd.net/i/CartoonNetwork_1@304661/master.m3u8" },
  { id: 16, name: "Boomerang", category: "Cartoons", country: "🇺🇸", url: "https://boomerang-lh.akamaihd.net/i/Boomerang_1@304661/master.m3u8" },
  { id: 17, name: "Nickelodeon", category: "Cartoons", country: "🇺🇸", url: "https://nickelodeon-lh.akamaihd.net/i/Nickelodeon_1@304661/master.m3u8" },
  { id: 18, name: "Disney Channel", category: "Cartoons", country: "🇺🇸", url: "https://disneychannel-lh.akamaihd.net/i/DisneyChannel_1@304661/master.m3u8" },
  // ENTERTAINMENT
  { id: 19, name: "CBS Reality", category: "Entertainment", country: "🇺🇸", url: "https://cbsreality-lh.akamaihd.net/i/CBSReality_1@304661/master.m3u8" },
  { id: 20, name: "Fox Life", category: "Entertainment", country: "🇺🇸", url: "https://foxlife-lh.akamaihd.net/i/FoxLife_1@304661/master.m3u8" },
  { id: 21, name: "TLC International", category: "Entertainment", country: "🇺🇸", url: "https://tlc-lh.akamaihd.net/i/TLC_1@304661/master.m3u8" },
  { id: 22, name: "Crime & Investigation", category: "Entertainment", country: "🇬🇧", url: "https://crimeinvestigation-lh.akamaihd.net/i/CrimeInvestigation_1@304661/master.m3u8" },
  // DOCUMENTARY
  { id: 23, name: "National Geographic", category: "Documentary", country: "🇺🇸", url: "https://natgeo-lh.akamaihd.net/i/NatGeo_1@304661/master.m3u8" },
  { id: 24, name: "Discovery Channel", category: "Documentary", country: "🇺🇸", url: "https://discovery-lh.akamaihd.net/i/Discovery_1@304661/master.m3u8" },
  { id: 25, name: "Animal Planet", category: "Documentary", country: "🇺🇸", url: "https://animalplanet-lh.akamaihd.net/i/AnimalPlanet_1@304661/master.m3u8" },
  { id: 26, name: "History Channel", category: "Documentary", country: "🇺🇸", url: "https://history-lh.akamaihd.net/i/History_1@304661/master.m3u8" },
];

const CATS = ["All", "News", "Sports", "Music", "Cartoons", "Entertainment", "Documentary"];

const catColors = {
  News: { bg: "rgba(59,130,246,0.15)", text: "#3b82f6", glow: "rgba(59,130,246,0.3)" },
  Sports: { bg: "rgba(16,185,129,0.15)", text: "#10b981", glow: "rgba(16,185,129,0.3)" },
  Music: { bg: "rgba(236,72,153,0.15)", text: "#ec4899", glow: "rgba(236,72,153,0.3)" },
  Cartoons: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  Entertainment: { bg: "rgba(124,58,237,0.15)", text: "#7c3aed", glow: "rgba(124,58,237,0.3)" },
  Documentary: { bg: "rgba(20,184,166,0.15)", text: "#14b8a6", glow: "rgba(20,184,166,0.3)" },
};

const getCSS = (dark) => `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@700;800;900&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

  body {
    background: ${dark ? "#1e2130" : "#e8eaf0"};
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: ${dark ? "#cdd5e0" : "#3d4458"};
    min-height: 100vh;
    transition: background 0.4s ease, color 0.4s ease;
  }

  :root {
    --bg: ${dark ? "#1e2130" : "#e8eaf0"};
    --s1: ${dark ? "#141620" : "#b8bec9"};
    --s2: ${dark ? "#28304a" : "#ffffff"};
    --text: ${dark ? "#cdd5e0" : "#3d4458"};
    --sub: ${dark ? "#6b7794" : "#8b93a8"};
    --grad1: linear-gradient(135deg, #7c3aed, #ec4899);
    --grad2: linear-gradient(135deg, #3b82f6, #7c3aed);
    --grad3: linear-gradient(135deg, #ec4899, #3b82f6);
  }

  .nf {
    background: ${dark
      ? "rgba(255,255,255,0.05)"
      : "var(--bg)"};
    box-shadow: ${dark
      ? "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)"
      : "8px 8px 16px var(--s1), -8px -8px 16px var(--s2)"};
    border-radius: 20px;
    ${dark ? "border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(12px);" : ""}
    transition: all 0.3s ease;
  }

  .ns {
    background: ${dark ? "rgba(255,255,255,0.04)" : "var(--bg)"};
    box-shadow: ${dark
      ? "0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)"
      : "4px 4px 10px var(--s1), -4px -4px 10px var(--s2)"};
    border-radius: 14px;
    ${dark ? "border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(8px);" : ""}
    transition: all 0.3s ease;
  }

  .np {
    background: ${dark ? "rgba(0,0,0,0.2)" : "var(--bg)"};
    box-shadow: ${dark
      ? "inset 0 2px 8px rgba(0,0,0,0.4)"
      : "inset 5px 5px 10px var(--s1), inset -5px -5px 10px var(--s2)"};
    border-radius: 16px;
    transition: all 0.3s ease;
  }

  .btn-ghost {
    background: ${dark ? "rgba(255,255,255,0.06)" : "var(--bg)"};
    box-shadow: ${dark
      ? "0 2px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)"
      : "4px 4px 10px var(--s1), -4px -4px 10px var(--s2)"};
    border: ${dark ? "1px solid rgba(255,255,255,0.07)" : "none"};
    cursor: pointer; border-radius: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700; color: var(--text);
    transition: all 0.18s ease;
  }
  .btn-ghost:hover {
    box-shadow: ${dark
      ? "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
      : "2px 2px 6px var(--s1), -2px -2px 6px var(--s2)"};
  }
  .btn-ghost:active {
    box-shadow: ${dark
      ? "inset 0 2px 8px rgba(0,0,0,0.5)"
      : "inset 3px 3px 7px var(--s1), inset -3px -3px 7px var(--s2)"};
  }

  .btn-grad {
    background: var(--grad1);
    border: none; cursor: pointer; border-radius: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800; color: white;
    box-shadow: 0 6px 20px rgba(124,58,237,0.4);
    transition: all 0.18s ease;
  }
  .btn-grad:hover { box-shadow: 0 8px 28px rgba(124,58,237,0.55); transform: translateY(-1px); }
  .btn-grad:active { transform: translateY(0); }

  .neu-input {
    background: ${dark ? "rgba(0,0,0,0.2)" : "var(--bg)"};
    box-shadow: ${dark
      ? "inset 0 2px 8px rgba(0,0,0,0.35)"
      : "inset 4px 4px 9px var(--s1), inset -4px -4px 9px var(--s2)"};
    border: ${dark ? "1px solid rgba(255,255,255,0.06)" : "none"};
    outline: none; border-radius: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: var(--text); font-size: 14px; font-weight: 500;
    transition: all 0.3s ease;
  }
  .neu-input::placeholder { color: var(--sub); }

  .cat-pill {
    padding: 8px 18px; border-radius: 50px; border: none;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700; font-size: 12px; white-space: nowrap;
    transition: all 0.2s ease;
  }

  .channel-card {
    background: ${dark ? "rgba(255,255,255,0.04)" : "var(--bg)"};
    box-shadow: ${dark
      ? "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)"
      : "8px 8px 18px var(--s1), -8px -8px 18px var(--s2)"};
    border-radius: 18px;
    ${dark ? "border: 1px solid rgba(255,255,255,0.06);" : ""}
    cursor: pointer;
    transition: transform 0.22s ease, box-shadow 0.22s ease;
    overflow: hidden;
  }
  .channel-card:hover {
    transform: translateY(-4px);
    box-shadow: ${dark
      ? "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)"
      : "12px 12px 24px var(--s1), -8px -8px 20px var(--s2)"};
  }

  .live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 6px rgba(239,68,68,0.8);
    animation: pulse 1.5s infinite;
    flex-shrink: 0;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.85); }
  }

  .tag {
    display: inline-block; padding: 3px 10px; border-radius: 20px;
    font-size: 10px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase;
  }

  .badge {
    background: var(--grad1); color: white; border-radius: 50%;
    width: 19px; height: 19px; display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 900;
    position: absolute; top: -6px; right: -6px;
    box-shadow: 0 3px 10px rgba(124,58,237,0.45);
  }

  .player-wrap {
    background: #000;
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    box-shadow: ${dark ? "0 8px 40px rgba(0,0,0,0.6)" : "8px 8px 20px var(--s1), -4px -4px 12px var(--s2)"};
  }

  .modal-bg {
    position: fixed; inset: 0;
    background: ${dark ? "rgba(10,12,20,0.75)" : "rgba(160,170,190,0.5)"};
    backdrop-filter: blur(8px);
    z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: fadeIn 0.2s ease;
  }
  .modal {
    background: ${dark ? "rgba(28,32,50,0.95)" : "var(--bg)"};
    box-shadow: ${dark ? "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)" : "16px 16px 32px var(--s1), -16px -16px 32px var(--s2)"};
    ${dark ? "border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px);" : ""}
    border-radius: 26px; padding: 24px;
    width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
    animation: modalIn 0.25s ease;
  }

  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes modalIn { from { transform: scale(0.94) translateY(12px); opacity:0; } to { transform: scale(1) translateY(0); opacity:1; } }

  .toast {
    position: fixed; bottom: 24px; right: 18px;
    background: ${dark ? "rgba(28,32,50,0.95)" : "var(--bg)"};
    box-shadow: ${dark ? "0 8px 32px rgba(0,0,0,0.5)" : "8px 8px 18px var(--s1), -8px -8px 18px var(--s2)"};
    ${dark ? "border: 1px solid rgba(255,255,255,0.08);" : ""}
    border-radius: 16px; padding: 13px 20px;
    font-weight: 700; font-size: 13px; color: var(--text);
    z-index: 9999; animation: toastIn 0.3s ease;
    display: flex; align-items: center; gap: 10px;
  }
  .toast-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--grad1); flex-shrink: 0; }
  @keyframes toastIn { from { transform: translateY(14px) scale(0.96); opacity:0; } to { transform: translateY(0) scale(1); opacity:1; } }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${dark ? "rgba(255,255,255,0.1)" : "var(--s1)"}; border-radius: 2px; }

  video { width: 100%; display: block; max-height: 240px; background: #000; }
`;

// SVG Icons
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const MoonIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const SunIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const CloseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlayIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const TvIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>;
const WifiIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>;

const WaveIcon = () => (
  <svg width="32" height="10" viewBox="0 0 80 20" fill="none">
    <path d="M0 10 Q10 0 20 10 Q30 20 40 10 Q50 0 60 10 Q70 20 80 10" stroke="url(#wg2)" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <defs><linearGradient id="wg2" x1="0" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient></defs>
  </svg>
);

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
          const hls = new HLS({ enableWorker: false, lowLatencyMode: true });
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

export default function NileTV() {
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [playing, setPlaying] = useState(null);
  const [toast, setToast] = useState(null);
  const [streamError, setStreamError] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("niletv_favs") || "[]"); } catch { return []; }
  });
  const [showFavs, setShowFavs] = useState(false);

  useEffect(() => { localStorage.setItem("niletv_favs", JSON.stringify(favorites)); }, [favorites]);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const openChannel = (ch) => { setPlaying(ch); setStreamError(false); };

  const displayList = CHANNELS.filter(c =>
    (cat === "All" || c.category === cat) &&
    (!showFavs || favorites.includes(c.id)) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const C = {
    text: dark ? "#cdd5e0" : "#3d4458",
    sub: dark ? "#6b7794" : "#8b93a8",
    grad1: "linear-gradient(135deg, #7c3aed, #ec4899)",
    grad2: "linear-gradient(135deg, #3b82f6, #7c3aed)",
    grad3: "linear-gradient(135deg, #ec4899, #3b82f6)",
  };

  return (
    <>
      <style>{getCSS(dark)}</style>

      {/* HEADER */}
      <div style={{ background: dark ? "rgba(20,22,38,0.95)" : "#e8eaf0", backdropFilter: dark ? "blur(16px)" : "none", borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "none", boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 14px #b8bec999", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 200, transition: "all 0.4s ease" }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 22, background: C.grad2, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>Nile TV</div>
          <WaveIcon />
        </div>

        <div style={{ flex: 1, position: "relative" }}>
          <input className="neu-input" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search channels..." style={{ width: "100%", padding: "10px 14px 10px 38px" }} />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.sub }}><SearchIcon /></span>
        </div>

        <button className="btn-ghost" onClick={() => { setShowFavs(f => !f); setCat("All"); }}
          style={{ padding: "10px 13px", fontSize: 16, color: showFavs ? "#ec4899" : C.sub }}>
          {showFavs ? "♥" : "♡"}
        </button>

        <button className="btn-ghost" onClick={() => setDark(d => !d)} style={{ padding: "10px 13px", color: C.sub }}>
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* HERO */}
      <div style={{ margin: "18px 18px 0", padding: "26px 24px", borderRadius: 22, background: dark ? "rgba(255,255,255,0.03)" : "rgba(124,58,237,0.07)", boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)" : "8px 8px 18px #b8bec9, -8px -8px 18px #ffffff", border: dark ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#7c3aed", marginBottom: 8 }}>Free · Live · 24/7</div>
        <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 26, background: C.grad3, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.15, marginBottom: 8 }}>
          Your River to<br />International TV
        </div>
        <div style={{ fontSize: 12, color: C.sub, fontWeight: 500, lineHeight: 1.65 }}>
          {CHANNELS.length} live channels · News, Sports, Music &amp; more
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
          <div className="live-dot" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444" }}>LIVE NOW</span>
          <span style={{ fontSize: 11, color: C.sub, fontWeight: 500 }}>· Stream free, no sign-up</span>
        </div>
      </div>

      {/* CATS */}
      <div style={{ display: "flex", gap: 9, padding: "16px 18px 10px", overflowX: "auto" }}>
        {CATS.map(c => {
          const active = cat === c && !showFavs;
          return (
            <button key={c} className="cat-pill" onClick={() => { setCat(c); setShowFavs(false); }}
              style={{
                background: active ? "linear-gradient(135deg,#7c3aed,#ec4899)" : dark ? "rgba(255,255,255,0.05)" : "#e8eaf0",
                color: active ? "white" : C.sub,
                boxShadow: active ? "0 4px 16px rgba(124,58,237,0.4)" : dark ? "0 2px 8px rgba(0,0,0,0.25)" : "4px 4px 10px #b8bec9, -4px -4px 10px #ffffff",
                border: dark && !active ? "1px solid rgba(255,255,255,0.06)" : "none",
                fontWeight: active ? 800 : 600,
              }}>
              {c}
            </button>
          );
        })}
      </div>

      {/* COUNT */}
      <div style={{ padding: "4px 20px 8px", fontSize: 12, color: C.sub, fontWeight: 600 }}>
        {showFavs ? `${displayList.length} saved channel${displayList.length !== 1 ? "s" : ""}` : `${displayList.length} channels`}
      </div>

      {/* CHANNEL GRID */}
      <div style={{ padding: "6px 18px 52px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {displayList.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "52px 20px", color: C.sub, fontWeight: 700, fontSize: 14 }}>
            {showFavs ? "No saved channels yet ♡" : "No channels found 📺"}
          </div>
        )}
        {displayList.map(ch => {
          const cc = catColors[ch.category] || catColors.News;
          const isFav = favorites.includes(ch.id);
          return (
            <div key={ch.id} className="channel-card">
              {/* Color bar */}
              <div style={{ height: 3, background: cc.text, opacity: 0.7 }} />
              <div style={{ padding: "16px 16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span className="tag" style={{ background: cc.bg, color: cc.text }}>{ch.category}</span>
                  <button onClick={() => { toggleFav(ch.id); notify(isFav ? "Removed from saved" : "Channel saved!"); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: isFav ? "#ec4899" : C.sub, lineHeight: 1, padding: 0 }}>
                    {isFav ? "♥" : "♡"}
                  </button>
                </div>

                <div style={{ fontSize: 28, textAlign: "center", padding: "14px 0" }}>{ch.country}</div>

                <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.3, color: C.text }}>{ch.name}</div>

                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div className="live-dot" style={{ width: 6, height: 6 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444" }}>LIVE</span>
                  <span style={{ fontSize: 10, color: C.sub, fontWeight: 500, marginLeft: 2 }}>Free</span>
                </div>

                <button className="btn-grad" style={{ padding: "9px", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12 }}
                  onClick={() => openChannel(ch)}>
                  <PlayIcon /> Watch
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PLAYER MODAL */}
      {playing && (
        <div className="modal-bg" onClick={() => setPlaying(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{playing.country}</span>
                <div>
                  <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 16, color: C.text }}>{playing.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <div className="live-dot" style={{ width: 6, height: 6 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444" }}>LIVE</span>
                    {(() => { const cc = catColors[playing.category]; return <span className="tag" style={{ background: cc?.bg, color: cc?.text, marginLeft: 4 }}>{playing.category}</span>; })()}
                  </div>
                </div>
              </div>
              <button className="btn-ghost" style={{ padding: 8 }} onClick={() => setPlaying(null)}><CloseIcon /></button>
            </div>

            <div className="player-wrap" style={{ marginBottom: 16 }}>
              {streamError ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: C.sub }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📡</div>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Stream unavailable</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6 }}>This stream may be geo-restricted or temporarily offline. Try another channel.</div>
                </div>
              ) : (
                <HLSPlayer url={playing.url} onError={() => setStreamError(true)} />
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" style={{ flex: 1, padding: "11px", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                onClick={() => { toggleFav(playing.id); notify(favorites.includes(playing.id) ? "Removed" : "Saved!"); }}>
                {favorites.includes(playing.id) ? "♥ Saved" : "♡ Save"}
              </button>
              <button className="btn-grad" style={{ flex: 1, padding: "11px", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                onClick={() => setStreamError(false)}>
                <WifiIcon /> Retry
              </button>
            </div>

            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: dark ? "rgba(0,0,0,0.2)" : "rgba(124,58,237,0.06)", fontSize: 11, color: C.sub, lineHeight: 1.6 }}>
              💡 Some streams may require a VPN to access from your region.
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast"><div className="toast-dot" />{toast}</div>}
    </>
  );
}
