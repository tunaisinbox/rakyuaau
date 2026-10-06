import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { DetailedBuilding, BuildingLayer, TokyoTower, Skytree } from './TokyoBuildings';

/* ── Tokyo weather + time-based sky palette ── */
function useSkyPalette() {
  const [palette, setPalette] = useState(null);
  useEffect(() => {
    let cancelled = false;

    const compute = async () => {
      const now = new Date();
      const tokyoHour = (now.getUTCHours() + 9) % 24;
      let phase;
      if (tokyoHour >= 5 && tokyoHour < 8) phase = 'dawn';
      else if (tokyoHour >= 8 && tokyoHour < 17) phase = 'day';
      else if (tokyoHour >= 17 && tokyoHour < 19) phase = 'dusk';
      else phase = 'night';

      const palettes = {
        dawn: { sky: 'linear-gradient(180deg, #E8A0A0 0%, #F0C0A4 18%, #FFE0C4 38%, #C8DAF0 62%, #DCEEF8 82%, #E8F4FC 100%)', haze: 'rgba(255,210,190,0.25)', window: 'rgba(255,218,120,0.5)', cloud: 'rgba(255,250,245,0.78)', bldg: 'rgba(95,108,124,0.72)', frame: 'rgba(71,85,105,0.22)' },
        day:  { sky: 'linear-gradient(180deg, #4A90D9 0%, #6FB0E8 22%, #9DCCEF 45%, #C4E0F5 70%, #DCEEF8 88%, #E8F4FC 100%)', haze: 'rgba(180,215,235,0.2)', window: 'rgba(120,195,255,0.4)', cloud: 'rgba(255,255,255,0.9)', bldg: 'rgba(72,86,106,0.68)', frame: 'rgba(51,65,85,0.22)' },
        dusk: { sky: 'linear-gradient(180deg, #162848 0%, #C85A3A 18%, #E8845A 38%, #F4A878 55%, #FFC8A0 75%, #E8D0B8 100%)', haze: 'rgba(220,130,90,0.25)', window: 'rgba(255,210,80,0.58)', cloud: 'rgba(255,215,180,0.68)', bldg: 'rgba(62,72,88,0.75)', frame: 'rgba(51,65,85,0.25)' },
        night:{ sky: 'linear-gradient(180deg, #080E1C 0%, #11203A 20%, #182E4E 42%, #243C5E 62%, #1A2A42 100%)', haze: 'rgba(16,26,46,0.32)', window: 'rgba(255,215,70,0.78)', cloud: 'rgba(48,58,78,0.48)', bldg: 'rgba(16,26,40,0.94)', frame: 'rgba(35,45,60,0.5)' },
      };

      let p = { ...palettes[phase], phase, cloudFactor: 0.3, rain: false, snow: false, fog: false, temp: null };

      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=weather_code,cloud_cover,precipitation,temperature_2m,is_day');
        const w = await res.json();
        const cur = w?.current;
        if (cur) {
          const cc = cur.cloud_cover ?? 30;
          const wc = cur.weather_code ?? 0;
          p.cloudFactor = Math.max(0.08, cc / 100);
          p.rain = (wc >= 51 && wc <= 67) || (wc >= 80 && wc <= 82) || (wc >= 95 && wc <= 99);
          p.snow = (wc >= 71 && wc <= 77) || wc === 85 || wc === 86;
          p.fog = wc >= 45 && wc <= 48;
          p.temp = cur.temperature_2m ?? null;
        }
      } catch { /* offline fallback: default cloudFactor */ }

      if (!cancelled) setPalette(p);
    };

    compute();
    const t = setInterval(compute, 600000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);
  return palette;
}

/* ── Running train ── */
function Train({ duration, delay, dir, baseH }) {
  const w = 130;
  const h = 26;
  return (
    <motion.div className="absolute" style={{ bottom: '50px', left: 0 }}
      animate={{ x: dir > 0 ? [-w, window.innerWidth + w] : [window.innerWidth + w, -w] }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Body */}
        <rect x="0" y="0" width={w} height={h} rx="6" fill="rgba(56,189,248,0.75)" stroke="rgba(56,189,248,0.5)" strokeWidth="0.5" />
        {/* Windows */}
        {[14, 32, 50, 68, 86, 104].map((dx, i) => (
          <rect key={i} x={dx} y="4" width="10" height={h - 10} rx="2" fill="rgba(255,255,255,0.3)" />
        ))}
        {/* Nose */}
        {dir > 0 ? (
          <path d={`M${w - 12},0 Q${w},0 ${w},${h / 2} Q${w},${h} ${w - 12},${h} Z`} fill="rgba(56,189,248,0.45)" />
        ) : (
          <path d={`M12,0 Q0,0 0,${h / 2} Q0,${h} 12,${h} Z`} fill="rgba(56,189,248,0.45)" />
        )}
        {/* Headlight */}
        <circle cx={dir > 0 ? w - 4 : 4} cy={h / 2} r="2" fill="rgba(253,224,71,0.85)" />
      </svg>
    </motion.div>
  );
}

/* ── Fluffy cloud — fewer, rounder puffs ── */
function DetailedCloud({ top, size, duration, delay, dir, color }) {
  // 6 round puffs clustered loosely to keep cloud-like silhouette
  const puffs = useMemo(() => {
    const base = [
      { cx: 20, cy: 35, rx: 18, ry: 16 },
      { cx: 40, cy: 28, rx: 22, ry: 20 },
      { cx: 60, cy: 30, rx: 20, ry: 18 },
      { cx: 78, cy: 36, rx: 16, ry: 14 },
      { cx: 50, cy: 40, rx: 24, ry: 12 },
      { cx: 30, cy: 42, rx: 14, ry: 10 },
    ];
    return base.map((p, i) => ({ ...p, opacity: 0.6 + (i % 3) * 0.12 }));
  }, []);

  return (
    <motion.div className="absolute" style={{ top: `${top}%`, left: 0 }}
      animate={{ x: dir > 0 ? [-size, window.innerWidth + size] : [window.innerWidth + size, -size] }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}>
      <svg width={size} height={size * 0.45} viewBox="0 0 100 50">
        {puffs.map((p, i) => (
          <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={color} opacity={p.opacity} />
        ))}
      </svg>
    </motion.div>
  );
}

/* ── Shibuya scene ── */
export default function ShibuyaScene({ ads = [] }) {
  const palette = useSkyPalette();
  if (!palette) return <div className="absolute inset-0 bg-sky-200" />;

  const farBuildings = Array.from({ length: 40 }, (_, i) => ({ w: 35 + (i % 5) * 8, h: 100 + (i % 7) * 30, gap: 4 + (i % 3) }));
  const midBuildings = Array.from({ length: 30 }, (_, i) => ({ w: 50 + (i % 4) * 14, h: 180 + (i % 6) * 45, gap: 10 + (i % 4) }));
  const nearBuildings = [
    { w: 80, h: 190, gap: 22 },
    { w: 95, h: 230, gap: 16 },
    { w: 130, h: 170, gap: 20 },
    { w: 88, h: 210, gap: 18 },
    { w: 75, h: 175, gap: 24 },
  ];

  const cloudCount = Math.round(4 + palette.cloudFactor * 16);
  const clouds = Array.from({ length: cloudCount }, (_, i) => ({
    id: i,
    top: Math.random() * 35,
    size: 80 + Math.random() * 120,
    duration: 60 + Math.random() * 90,
    delay: -Math.random() * 150,
    dir: Math.random() > 0.5 ? 1 : -1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: palette.sky }} />

      {palette.phase === 'night' && (
        <div className="absolute inset-0">
          {Array.from({ length: 100 }, (_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2 + (i % 5), repeat: Infinity, delay: i * 0.1 }}
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 13) % 40}%`, width: i % 7 === 0 ? '2px' : '1px', height: i % 7 === 0 ? '2px' : '1px' }} />
          ))}
        </div>
      )}

      {/* Smooth camera pan — buttery drift */}
      <motion.div className="absolute inset-0"
        animate={{ x: [0, 30, -20, 10, 0], y: [0, -8, 4, -6, 0], scale: [1, 1.03, 1.01, 1.02, 1] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}>

        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 30%, ${palette.haze} 55%, rgba(224,244,255,0.3) 70%)` }} />

        {clouds.map(c => (
          <DetailedCloud key={c.id} top={c.top} size={c.size} duration={c.duration} delay={c.delay} dir={c.dir} color={palette.cloud} />
        ))}

        <Skytree left="68%" scale={1.5} opacity={0.6} />
        <TokyoTower left="12%" scale={1.8} opacity={0.75} />

        <BuildingLayer buildings={farBuildings} viewBoxH={350} opacity={0.6} duration={180} bottom={0}
          fill={palette.bldg} windowFill={palette.window} frameColor={palette.frame} />
        <BuildingLayer buildings={midBuildings} viewBoxH={420} opacity={0.8} duration={110} bottom={0}
          fill={palette.bldg} windowFill={palette.window} frameColor={palette.frame} />
        <BuildingLayer buildings={nearBuildings} viewBoxH={500} opacity={1} duration={65} bottom={0}
          fill={palette.bldg} windowFill={palette.window} frameColor={palette.frame} />
      </motion.div>

      {/* Highway road */}
      <div className="absolute bottom-0 left-0 w-full" style={{ height: '50px', background: 'linear-gradient(180deg, rgba(30,40,55,0.85), rgba(15,23,35,0.95))' }} />
      {/* Center divider — dashed yellow */}
      <div className="absolute bottom-5 left-0 w-full" style={{ height: '3px', overflow: 'hidden' }}>
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="absolute" style={{ left: `${i * 3.5}%`, width: '2%', height: '3px', background: 'rgba(253,224,71,0.8)', borderRadius: '1px' }} />
        ))}
      </div>
      {/* Lane divider — dashed white */}
      <div className="absolute bottom-16 left-0 w-full" style={{ height: '2px', overflow: 'hidden' }}>
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="absolute" style={{ left: `${i * 3.5}%`, width: '2%', height: '2px', background: 'rgba(255,255,255,0.5)' }} />
        ))}
      </div>
      {/* Shoulder line — solid white */}
      <div className="absolute bottom-1 left-0 w-full" style={{ height: '2px', background: 'rgba(255,255,255,0.4)' }} />

      {/* Tracks — full width above road */}
      <div className="absolute left-0 w-full" style={{ bottom: '50px', height: '24px' }}>
        {/* Ballast */}
        <div className="absolute inset-0" style={{ background: 'rgba(71,85,105,0.2)' }} />
        {/* Sleepers */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(71,85,105,0.5) 0px, rgba(71,85,105,0.5) 12px, transparent 12px, transparent 28px)',
        }} />
        {/* Rails */}
        <div className="absolute left-0 w-full" style={{ top: '5px', height: '2px', background: 'rgba(100,116,139,0.7)' }} />
        <div className="absolute left-0 w-full" style={{ top: '17px', height: '2px', background: 'rgba(100,116,139,0.7)' }} />
      </div>

      {/* Weather overlay — darkens/desaturates sky based on cloud cover */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(95,100,112,1)', opacity: palette.cloudFactor * 0.22 }} />

      {/* Fog overlay */}
      {palette.fog && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(200,205,212,0.35)' }} />
      )}

      {/* Rain */}
      {palette.rain && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 80 }, (_, i) => (
            <motion.div key={i} className="absolute"
              style={{ left: `${(i * 13) % 100}%`, width: '1px', height: '24px', background: 'linear-gradient(180deg, transparent, rgba(180,210,235,0.5))' }}
              animate={{ y: [-30, window.innerHeight + 10] }}
              transition={{ duration: 0.5 + (i % 3) * 0.15, repeat: Infinity, delay: (i % 6) * 0.08, ease: 'linear' }} />
          ))}
        </div>
      )}

      {/* Snow */}
      {palette.snow && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 60 }, (_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white"
              style={{ left: `${(i * 17) % 100}%`, width: '3px', height: '3px' }}
              animate={{ y: [-10, window.innerHeight + 10], x: [0, 15, -10, 0] }}
              transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: (i % 5) * 0.5, ease: 'linear' }} />
          ))}
        </div>
      )}

      {/* Running trains — on tracks */}
      <Train duration={8} delay={0} dir={1} />
      <Train duration={12} delay={-4} dir={-1} />

      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.08) 100%)' }} />
    </div>
  );
}