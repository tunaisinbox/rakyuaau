import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/* ── Hologram city background ─────────────────────────────── */
export function HoloCityBg() {
  const buildings = [
    { x: 0, w: 40, h: 120, d: 0.4 }, { x: 45, w: 30, h: 160, d: 0.6 },
    { x: 80, w: 50, h: 100, d: 0.3 }, { x: 135, w: 35, h: 200, d: 0.7 },
    { x: 175, w: 45, h: 140, d: 0.5 }, { x: 225, w: 30, h: 180, d: 0.8 },
    { x: 260, w: 55, h: 110, d: 0.4 }, { x: 320, w: 40, h: 220, d: 0.9 },
    { x: 365, w: 35, h: 130, d: 0.3 }, { x: 405, w: 60, h: 170, d: 0.6 },
    { x: 470, w: 30, h: 90, d: 0.2 }, { x: 505, w: 45, h: 150, d: 0.5 },
    { x: 555, w: 40, h: 190, d: 0.7 }, { x: 600, w: 50, h: 120, d: 0.4 },
    { x: 655, w: 35, h: 160, d: 0.6 }, { x: 695, w: 30, h: 100, d: 0.3 },
    { x: 730, w: 55, h: 210, d: 0.8 }, { x: 790, w: 40, h: 140, d: 0.5 },
  ];

  const windows = Array.from({ length: 80 }, (_, i) => ({
    x: 20 + (i * 47) % 780, y: 30 + (i * 31) % 180, size: 2 + (i % 3),
    delay: (i * 0.3) % 4, dur: 1.5 + (i % 3) * 0.7,
    color: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#f472b6' : '#818cf8',
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sky gradient */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #02040e 0%, #050d24 40%, #070a1a 70%, #0a0510 100%)',
      }} />

      {/* Stars */}
      {Array.from({ length: 60 }, (_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            width: 1 + (i % 2),
            height: 1 + (i % 2),
            left: `${(i * 37 + 3) % 100}%`,
            top: `${(i * 23 + 5) % 60}%`,
            background: i % 4 === 0 ? '#f472b6' : '#38bdf8',
          }}
          animate={{ opacity: [0.1, 0.9, 0.1] }}
          transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.15 }}
        />
      ))}

      {/* City SVG */}
      <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 800 240" preserveAspectRatio="xMidYMax slice" style={{ opacity: 0.6 }}>
        <defs>
          <linearGradient id="bldPink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="bldBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.15" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Buildings */}
        {buildings.map((b, i) => (
          <rect key={i} x={b.x} y={240 - b.h} width={b.w} height={b.h}
            fill={i % 2 === 0 ? 'url(#bldBlue)' : 'url(#bldPink)'}
            stroke={i % 2 === 0 ? 'rgba(56,189,248,0.4)' : 'rgba(244,114,182,0.4)'}
            strokeWidth="0.5" filter="url(#glow)"
          />
        ))}
        {/* Window grids */}
        {buildings.map((b, i) =>
          Array.from({ length: Math.floor(b.h / 18) }, (_, row) =>
            Array.from({ length: Math.floor(b.w / 10) }, (_, col) => (
              <rect key={`w-${i}-${row}-${col}`}
                x={b.x + 3 + col * 10} y={240 - b.h + 5 + row * 18}
                width={5} height={8}
                fill={Math.random() > 0.4 ? (i % 2 === 0 ? 'rgba(56,189,248,0.6)' : 'rgba(244,114,182,0.6)') : 'transparent'}
              />
            ))
          )
        )}
        {/* Ground glow */}
        <rect x="0" y="235" width="800" height="5" fill="rgba(56,189,248,0.3)" filter="url(#glow)" />
        <line x1="0" y1="238" x2="800" y2="238" stroke="#f472b6" strokeWidth="0.5" opacity="0.5" />
      </svg>

      {/* Floating window lights */}
      {windows.map((w, i) => (
        <motion.div key={i} className="absolute rounded-sm"
          style={{ left: w.x, bottom: `${5 + (i * 3) % 40}%`, width: w.size, height: w.size, background: w.color }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: w.dur, repeat: Infinity, delay: w.delay }}
        />
      ))}

      {/* Horizontal scan line */}
      <motion.div className="absolute left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,#38bdf8 30%,#f472b6 70%,transparent)', opacity: 0.3 }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Vertical scan */}
      <motion.div className="absolute top-0 bottom-0 w-px"
        style={{ background: 'linear-gradient(180deg,transparent,#f472b6 50%,transparent)', opacity: 0.15 }}
        animate={{ left: ['0%', '100%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />

      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
        <defs>
          <pattern id="runGrid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M50 0L0 0 0 50" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#runGrid)" />
      </svg>

      {/* Data streams */}
      {[8, 20, 35, 55, 72, 88].map((x, i) => (
        <motion.div key={i} className="absolute w-px"
          style={{ left: `${x}%`, background: `linear-gradient(180deg,transparent,${i % 2 === 0 ? '#38bdf8' : '#f472b6'},transparent)` }}
          animate={{ height: ['0%', '100%'], opacity: [0, 0.25, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
        />
      ))}

      {/* Corner brackets */}
      {[
        { pos: { top: 16, left: 16 }, r: 0, c: '#38bdf8' },
        { pos: { top: 16, right: 16 }, r: 90, c: '#f472b6' },
        { pos: { bottom: 16, left: 16 }, r: 270, c: '#f472b6' },
        { pos: { bottom: 16, right: 16 }, r: 180, c: '#38bdf8' },
      ].map((b, i) => (
        <motion.div key={i} className="absolute w-8 h-8"
          style={{ ...b.pos, transform: `rotate(${b.r}deg)` }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M2 12L2 2 12 2" stroke={b.c} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      ))}

      {/* Particles */}
      {Array.from({ length: 30 }, (_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            width: 1 + (i % 3) * 0.5, height: 1 + (i % 3) * 0.5,
            left: `${(i * 43 + 7) % 100}%`, top: `${(i * 67 + 11) % 85}%`,
            background: i % 2 === 0 ? '#38bdf8' : '#f472b6',
          }}
          animate={{ y: [0, -20, 0], x: [0, i % 2 === 0 ? 10 : -10, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: 3 + (i % 5), repeat: Infinity, delay: i * 0.25 }}
        />
      ))}

      {/* Pulse rings in corners */}
      {[
        { x: '15%', y: '25%', c: '#38bdf8' }, { x: '85%', y: '60%', c: '#f472b6' },
        { x: '75%', y: '15%', c: '#818cf8' },
      ].map((r, i) => (
        <motion.div key={i} className="absolute rounded-full border"
          style={{ width: 80, height: 80, left: r.x, top: r.y, transform: 'translate(-50%,-50%)', borderColor: r.c }}
          animate={{ scale: [0.5, 2], opacity: [0.5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }}
        />
      ))}

      {/* Ambient glows */}
      <motion.div className="absolute w-72 h-72 rounded-full"
        style={{ top: '-5%', left: '-5%', background: 'radial-gradient(circle,rgba(56,189,248,0.08),transparent)', filter: 'blur(50px)' }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }} />
      <motion.div className="absolute w-72 h-72 rounded-full"
        style={{ bottom: '10%', right: '-5%', background: 'radial-gradient(circle,rgba(244,114,182,0.1),transparent)', filter: 'blur(50px)' }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, delay: 2 }} />
    </div>
  );
}

/* ── Tokyo city silhouette (shared by loader + 404) ─────── */
function TokyoCity({ exiting = false }) {
  const buildings = [
    [0,35,110],[38,28,145],[70,42,90],[118,32,185],[155,48,125],[208,36,165],
    [250,26,95],[280,52,205],[340,32,135],[378,42,175],
    [448,30,155],[482,46,190],[535,26,120],[565,36,145],[605,42,90],[652,32,178],[688,46,135],
    [738,26,110],[768,36,160],
  ];

  return (
    <motion.div className="absolute bottom-0 left-0 right-0 pointer-events-none"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: exiting ? '-35%' : 0, opacity: exiting ? 0 : 1 }}
      transition={{ duration: exiting ? 0.9 : 1.3, ease: [0.16, 1, 0.3, 1] }}>
      <svg className="w-full" viewBox="0 0 800 260" preserveAspectRatio="xMidYMax slice" style={{ opacity: 0.7 }}>
        <defs>
          <linearGradient id="tcBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="tcPink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="tcTower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
          </linearGradient>
          <filter id="tcGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Tokyo Tower */}
        <g filter="url(#tcGlow)">
          <path d="M370 260 L400 88 L430 260 Z" fill="url(#tcTower)" opacity="0.45" />
          <line x1="385" y1="260" x2="400" y2="170" stroke="rgba(244,114,182,0.35)" strokeWidth="0.8" />
          <line x1="415" y1="260" x2="400" y2="170" stroke="rgba(244,114,182,0.35)" strokeWidth="0.8" />
          <line x1="378" y1="215" x2="422" y2="215" stroke="rgba(244,114,182,0.2)" strokeWidth="0.5" />
          <rect x="384" y="78" width="32" height="13" rx="2" fill="url(#tcTower)" opacity="0.7" />
          <rect x="391" y="48" width="18" height="30" fill="url(#tcTower)" opacity="0.5" />
          <rect x="387" y="40" width="26" height="8" rx="2" fill="url(#tcTower)" opacity="0.7" />
          <line x1="400" y1="40" x2="400" y2="6" stroke="url(#tcTower)" strokeWidth="1.5" />
          <motion.circle cx="400" cy="6" r="3" fill="#f472b6"
            animate={{ opacity: [0.4, 1, 0.4], r: [2, 3.5, 2] }}
            transition={{ duration: 1.5, repeat: Infinity }} />
        </g>

        {/* Buildings */}
        {buildings.map(([x, w, h], i) => (
          <g key={i}>
            <rect x={x} y={260 - h} width={w} height={h}
              fill={i % 2 === 0 ? 'url(#tcBlue)' : 'url(#tcPink)'}
              stroke={i % 2 === 0 ? 'rgba(56,189,248,0.35)' : 'rgba(244,114,182,0.35)'}
              strokeWidth="0.5" filter="url(#tcGlow)" />
            {Array.from({ length: Math.floor(h / 18) }, (_, row) =>
              Array.from({ length: Math.floor(w / 9) }, (_, col) => (
                <rect key={`${row}-${col}`}
                  x={x + 2 + col * 9} y={260 - h + 3 + row * 18}
                  width={4} height={7}
                  fill={(row + col + i) % 3 !== 0
                    ? (i % 2 === 0 ? 'rgba(56,189,248,0.45)' : 'rgba(244,114,182,0.45)')
                    : 'transparent'} />
              ))
            )}
          </g>
        ))}

        {/* Ground glow */}
        <motion.rect x="0" y="256" width="800" height="4" fill="rgba(56,189,248,0.25)" filter="url(#tcGlow)"
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 3, repeat: Infinity }} />
        <line x1="0" y1="259" x2="800" y2="259" stroke="#f472b6" strokeWidth="0.5" opacity="0.4" />
      </svg>
    </motion.div>
  );
}

/* ── Shared animated background layers ───────────────────── */
function StarField({ count = 50 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            width: 1 + (i % 2), height: 1 + (i % 2),
            left: `${(i * 37 + 3) % 100}%`, top: `${(i * 23 + 5) % 60}%`,
            background: i % 3 === 0 ? '#f472b6' : '#38bdf8',
          }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </>
  );
}

function ScanLines() {
  return (
    <>
      <motion.div className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg,transparent,#38bdf8 30%,#f472b6 70%,transparent)', opacity: 0.25 }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="absolute top-0 bottom-0 w-px pointer-events-none"
        style={{ background: 'linear-gradient(180deg,transparent,#f472b6 50%,transparent)', opacity: 0.12 }}
        animate={{ left: ['0%', '100%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} />
    </>
  );
}

function DataStreams() {
  return (
    <>
      {[8, 20, 35, 55, 72, 88].map((x, i) => (
        <motion.div key={i} className="absolute w-px pointer-events-none"
          style={{ left: `${x}%`, background: `linear-gradient(180deg,transparent,${i % 2 === 0 ? '#38bdf8' : '#f472b6'},transparent)` }}
          animate={{ height: ['0%', '100%'], opacity: [0, 0.2, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
}

function FloatingParticles({ count = 30 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: 1 + (i % 3) * 0.5, height: 1 + (i % 3) * 0.5,
            left: `${(i * 43 + 7) % 100}%`, top: `${(i * 67 + 11) % 85}%`,
            background: i % 2 === 0 ? '#38bdf8' : '#f472b6',
          }}
          animate={{ y: [0, -20, 0], x: [0, i % 2 === 0 ? 10 : -10, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: 3 + (i % 5), repeat: Infinity, delay: i * 0.25 }}
        />
      ))}
    </>
  );
}

function CornerBrackets() {
  return (
    <>
      {[
        { pos: { top: 16, left: 16 }, r: 0, c: '#38bdf8' },
        { pos: { top: 16, right: 16 }, r: 90, c: '#f472b6' },
        { pos: { bottom: 16, left: 16 }, r: 270, c: '#f472b6' },
        { pos: { bottom: 16, right: 16 }, r: 180, c: '#38bdf8' },
      ].map((b, i) => (
        <motion.div key={i} className="absolute w-8 h-8"
          style={{ ...b.pos, transform: `rotate(${b.r}deg)` }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M2 12L2 2 12 2" stroke={b.c} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

function AmbientGlows() {
  return (
    <>
      <motion.div className="absolute w-72 h-72 rounded-full pointer-events-none"
        style={{ top: '-5%', left: '-5%', background: 'radial-gradient(circle,rgba(56,189,248,0.08),transparent)', filter: 'blur(50px)' }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }} />
      <motion.div className="absolute w-72 h-72 rounded-full pointer-events-none"
        style={{ bottom: '10%', right: '-5%', background: 'radial-gradient(circle,rgba(244,114,182,0.1),transparent)', filter: 'blur(50px)' }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, delay: 2 }} />
    </>
  );
}

function GridOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }}>
      <defs>
        <pattern id="ldGrid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0L0 0 0 50" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ldGrid)" />
    </svg>
  );
}

/* ── Fox SVG (orbits the ring) ──────────────────────────── */
function FoxSvg({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <defs>
        <linearGradient id="fxB" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
        <filter id="fxG">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="36" cy="49" rx="17" ry="13" fill="url(#fxB)" opacity="0.92" filter="url(#fxG)" />
      <circle cx="36" cy="30" r="14" fill="url(#fxB)" opacity="0.92" filter="url(#fxG)" />
      <polygon points="24,20 18,5 30,16" fill="#38bdf8" opacity="0.9" filter="url(#fxG)" />
      <polygon points="48,20 54,5 42,16" fill="#f472b6" opacity="0.9" filter="url(#fxG)" />
      <polygon points="24,18 19,8 28,15" fill="#f472b6" opacity="0.45" />
      <polygon points="48,18 53,8 44,15" fill="#38bdf8" opacity="0.45" />
      <ellipse cx="30" cy="28" rx="3" ry="3.5" fill="white" opacity="0.92" />
      <ellipse cx="42" cy="28" rx="3" ry="3.5" fill="white" opacity="0.92" />
      <circle cx="31" cy="29" r="1.5" fill="#050010" />
      <circle cx="43" cy="29" r="1.5" fill="#050010" />
      <circle cx="31.7" cy="28" r="0.6" fill="white" />
      <circle cx="43.7" cy="28" r="0.6" fill="white" />
      <ellipse cx="36" cy="33.5" rx="2" ry="1.2" fill="#f472b6" opacity="0.85" />
      <path d="M33 35.5 Q36 38 39 35.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
      <path d="M53 52 Q68 43 62 57 Q56 63 50 56" fill="url(#fxB)" opacity="0.7" filter="url(#fxG)" />
      <path d="M56 53 Q66 49 62 57" fill="white" opacity="0.28" />
    </svg>
  );
}

/* ── Hologram Fox loader (Firefox-style: fox orbits big ring) ── */
/* minDuration: minimum display time in ms (configurable) */
/* ready: true when data loading is complete */
/* onDone: called after exit animation finishes */
export function HoloFoxLoader({ minDuration = 5000, ready = true, onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (ready && elapsed >= minDuration) {
        clearInterval(timer);
        setExiting(true);
        setTimeout(() => onDone?.(), 900);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [ready, minDuration, onDone]);

  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #02040e 0%, #050d24 50%, #040816 100%)' }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.6, delay: exiting ? 0.3 : 0 }}>

      {/* 1. Stars twinkling */}
      <StarField count={50} />

      {/* 2. Tokyo City — rises from bottom, moves up on exit */}
      <TokyoCity exiting={exiting} />

      {/* 3. Ambient glow blobs */}
      <AmbientGlows />

      {/* 4. Grid overlay */}
      <GridOverlay />

      {/* 5. Horizontal + vertical scan lines */}
      <ScanLines />

      {/* 6. Data streams */}
      <DataStreams />

      {/* 7. Floating particles */}
      <FloatingParticles count={25} />

      {/* 8. Corner brackets */}
      <CornerBrackets />

      {/* 9. Pulse rings */}
      {[
        { x: '15%', y: '25%', c: '#38bdf8' },
        { x: '85%', y: '60%', c: '#f472b6' },
        { x: '75%', y: '15%', c: '#818cf8' },
      ].map((r, i) => (
        <motion.div key={i} className="absolute rounded-full border pointer-events-none"
          style={{ width: 80, height: 80, left: r.x, top: r.y, transform: 'translate(-50%,-50%)', borderColor: r.c }}
          animate={{ scale: [0.5, 2], opacity: [0.5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }}
        />
      ))}

      {/* Center: Big orbit ring + Fox */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>

          {/* Glow behind */}
          <div className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)' }} />

          {/* 10. Main orbit ring + decorative rings */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 240">
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#38bdf8" stopOpacity="0.6" />
                <stop offset="0.5" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="1" stopColor="#f472b6" stopOpacity="0.6" />
              </linearGradient>
              <filter id="ringGlow">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Outer decorative ring */}
            <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(56,189,248,0.08)" strokeWidth="1" />
            {/* Main ring */}
            <motion.circle cx="120" cy="120" r="90" fill="none" stroke="url(#ringGrad)" strokeWidth="3"
              filter="url(#ringGlow)" strokeDasharray="565"
              animate={{ strokeDashoffset: [565, 0, -565] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
            {/* Inner ring */}
            <motion.circle cx="120" cy="120" r="74" fill="none" stroke="rgba(244,114,182,0.15)"
              strokeWidth="1" strokeDasharray="8 6"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: 'center' }} />
          </svg>

          {/* 11. Fox orbiting the ring */}
          <motion.div className="absolute"
            style={{ width: 240, height: 240, top: 0, left: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}>
            <div style={{ position: 'absolute', top: 120 - 90 - 22, left: 120 - 22, width: 44, height: 44 }}>
              <FoxSvg size={44} />
            </div>
          </motion.div>

          {/* 12. Fox tail glow trail */}
          <motion.div className="absolute rounded-full pointer-events-none"
            style={{ width: 20, height: 20, top: 120 - 90 - 10, left: 120 - 10,
              background: 'radial-gradient(circle,rgba(244,114,182,0.6),transparent)', filter: 'blur(6px)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
          />

          {/* 13. Center R logo — pulsing glow */}
          <motion.div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-white text-2xl select-none"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6,#ec4899)' }}
            animate={{ boxShadow: [
              '0 0 30px rgba(14,165,233,0.5), 0 0 60px rgba(236,72,153,0.2)',
              '0 0 50px rgba(14,165,233,0.7), 0 0 100px rgba(236,72,153,0.4)',
              '0 0 30px rgba(14,165,233,0.5), 0 0 60px rgba(236,72,153,0.2)',
            ] }}
            transition={{ duration: 2, repeat: Infinity }}>R</motion.div>

          {/* 14. Spinning dash ring around R */}
          <motion.svg className="absolute" style={{ width: 80, height: 80, top: '50%', left: '50%', x: '-50%', y: '-50%' }}
            viewBox="0 0 80 80" animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(56,189,248,0.35)" strokeWidth="1.5" strokeDasharray="12 6" />
          </motion.svg>

          {/* 15. Outer rotating ring */}
          <motion.svg className="absolute" style={{ width: 220, height: 220, top: 10, left: 10 }}
            viewBox="0 0 220 220" animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}>
            <circle cx="110" cy="110" r="105" fill="none" stroke="rgba(244,114,182,0.12)" strokeWidth="0.8" strokeDasharray="4 8" />
          </motion.svg>
        </div>
      </div>

      {/* 16. Loading text — fade pulse */}
      <div className="flex flex-col items-center gap-2 pb-12 relative z-10">
        <motion.p className="text-xs font-mono tracking-[0.4em] text-sky-400/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}>
          LOADING...
        </motion.p>
        {/* 17. Progress dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div key={i} className="w-1 h-1 rounded-full"
              style={{ background: i % 2 === 0 ? '#38bdf8' : '#f472b6' }}
              animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.4, 0.8] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── 404 Not Found (with Tokyo city + lots of animations) ── */
export function NotFoundError({ appName }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0510 0%, #0d0820 50%, #080518 100%)' }}>

      {/* 1. Stars */}
      <StarField count={45} />

      {/* 2. Tokyo City background */}
      <div className="absolute bottom-0 left-0 right-0" style={{ opacity: 0.5 }}>
        <TokyoCity />
      </div>

      {/* 3. Ambient glows */}
      <AmbientGlows />

      {/* 4. Grid overlay */}
      <GridOverlay />

      {/* 5. Scan lines */}
      <ScanLines />

      {/* 6. Data streams */}
      <DataStreams />

      {/* 7. Floating particles */}
      <FloatingParticles count={35} />

      {/* 8. Corner brackets */}
      <CornerBrackets />

      {/* 9. Pulse rings */}
      {[
        { x: '20%', y: '30%', c: '#ef4444' },
        { x: '80%', y: '70%', c: '#f472b6' },
        { x: '70%', y: '20%', c: '#ef4444' },
      ].map((r, i) => (
        <motion.div key={i} className="absolute rounded-full border pointer-events-none"
          style={{ width: 100, height: 100, left: r.x, top: r.y, transform: 'translate(-50%,-50%)', borderColor: r.c }}
          animate={{ scale: [0.5, 2.5], opacity: [0.4, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: 'easeOut' }}
        />
      ))}

      {/* 10. Glitch distortion overlay */}
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.03) 50%, transparent 100%)' }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2 }} />

      {/* 11. Flicker overlay */}
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(239,68,68,0.02)' }}
        animate={{ opacity: [0, 0.5, 0, 0.3, 0] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 1.5 }} />

      {/* 12. Horizontal glitch bars */}
      {[15, 45, 75].map((top, i) => (
        <motion.div key={i} className="absolute left-0 right-0 pointer-events-none"
          style={{ top: `${top}%`, height: 1, background: 'rgba(239,68,68,0.3)' }}
          animate={{ x: ['-100%', '100%'], opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.5, repeatDelay: 1.5 }} />
      ))}

      {/* 13. Static noise dots */}
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{ width: 2, height: 2, left: `${(i * 53) % 100}%`, top: `${(i * 29) % 100}%`, background: '#ef4444' }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.1, repeat: Infinity, delay: i * 0.07, repeatDelay: 1 }} />
      ))}

      {/* 404 Content */}
      <motion.div className="relative z-10 text-center px-4"
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>

        {/* 14. 404 glitch text */}
        <motion.h1 className="text-7xl sm:text-8xl font-extrabold tracking-tight select-none"
          style={{ backgroundImage: 'linear-gradient(135deg, #ef4444 0%, #f472b6 50%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          animate={{ x: [0, -2, 2, -1, 0], textShadow: [
            '0 0 20px rgba(239,68,68,0.5)',
            '2px 0 0px rgba(56,189,248,0.5), -2px 0 0px rgba(239,68,68,0.5)',
            '0 0 20px rgba(239,68,68,0.5)',
          ] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1.5 }}>
          404
        </motion.h1>

        <motion.p className="text-red-400/70 text-xs font-mono tracking-[0.3em] mt-3"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}>
          SERVICE_NOT_FOUND
        </motion.p>

        <motion.p className="text-white/80 text-sm mt-4 max-w-xs"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <span className="text-sky-400 font-bold">{appName}</span> は登録されていないサービスです
        </motion.p>

        {/* 15. Back button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(56,189,248,0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
          className="mt-6 px-8 py-3 rounded-xl text-white font-bold text-sm relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6, #ec4899)',
            boxShadow: '0 0 20px rgba(56,189,248,0.2)' }}>
          <motion.div className="absolute inset-0 opacity-25"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
            animate={{ x: ['-150%', '250%'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }} />
          <span className="relative">戻る</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ── Glitch text ─────────────────────────────────────────── */
export function GlitchText({ children, className = '' }) {
  return (
    <motion.span className={`relative inline-block ${className}`}
      animate={{}}
      whileHover={{
        textShadow: ['0 0 0px transparent', '2px 0 0px #38bdf8, -2px 0 0px #f472b6', '0 0 0px transparent'],
      }}
      transition={{ duration: 0.15 }}>
      {children}
    </motion.span>
  );
}

/* ── Pulse ring ──────────────────────────────────────────── */
export function PulseRing({ color, size, delay = 0 }) {
  return (
    <motion.div className="absolute rounded-full border pointer-events-none"
      style={{ width: size, height: size, borderColor: color, top: '50%', left: '50%', x: '-50%', y: '-50%' }}
      animate={{ scale: [0.8, 2], opacity: [0.6, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, delay, ease: 'easeOut' }}
    />
  );
}

/* ── Cyber input ─────────────────────────────────────────── */
export function CyberInput({ value, onChange, placeholder, type = 'text', children }) {
  return (
    <div className="relative group">
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-4 pr-12 py-3.5 text-white/90 placeholder-white/15 outline-none text-sm font-mono tracking-wide rounded-xl transition-all peer"
        style={{
          background: 'rgba(14,165,233,0.04)',
          border: '1px solid rgba(56,189,248,0.15)',
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; e.target.style.boxShadow = '0 0 18px rgba(56,189,248,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(56,189,248,0.15)'; e.target.style.boxShadow = 'none'; }}
      />
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-sky-400/50 rounded-tl-lg pointer-events-none transition-all group-focus-within:border-sky-400" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-pink-400/50 rounded-tr-lg pointer-events-none transition-all group-focus-within:border-pink-400" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-pink-400/50 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-sky-400/50 rounded-br-lg pointer-events-none" />
      {children && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5">{children}</div>
      )}
    </div>
  );
}

/* ── Cyber button ────────────────────────────────────────── */
export function CyberButton({ onClick, disabled, loading, variant = 'primary', children, type = 'button' }) {
  const isPrimary = variant === 'primary';
  return (
    <motion.button type={type}
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={onClick} disabled={disabled}
      className="relative w-full py-4 rounded-xl font-bold text-sm overflow-hidden transition-all disabled:opacity-40 text-white"
      style={isPrimary ? {
        background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #ec4899 100%)',
        boxShadow: '0 0 28px rgba(14,165,233,0.3), 0 0 56px rgba(236,72,153,0.15)',
      } : {
        border: '1px solid rgba(244,114,182,0.25)',
        background: 'rgba(244,114,182,0.06)',
        color: 'rgba(255,255,255,0.7)',
      }}>
      {isPrimary && !loading && (
        <motion.div className="absolute inset-0 opacity-25"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
          animate={{ x: ['-150%', '250%'] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
        />
      )}
      {isPrimary && <div className="absolute top-0 left-6 right-6 h-px opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }} />}
      <span className="relative flex items-center justify-center gap-2">
        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
      </span>
    </motion.button>
  );
}