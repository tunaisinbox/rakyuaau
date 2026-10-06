import { motion } from 'framer-motion';
import { useMemo } from 'react';

/* ── Ultra-detailed building (~500 layered SVG elements) ── */
export function DetailedBuilding({ x, w, h, baseH, fill, windowFill, frameColor, seed }) {
  const cols = Math.max(3, Math.floor(w / 14));
  const rows = Math.max(3, Math.floor(h / 18));
  const cellW = w / cols;
  const cellH = h / rows;

  const windowEls = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = (r * 7 + c * 3 + seed) % 4 !== 0;
      const bright = (r + c + seed) % 5 === 0;
      windowEls.push(
        <rect key={`w-${r}-${c}`} x={x + c * cellW + cellW * 0.15} y={baseH - h + r * cellH + cellH * 0.1}
          width={cellW * 0.7} height={cellH * 0.7}
          fill={lit ? (bright ? windowFill : 'rgba(255,255,255,0.05)') : 'transparent'} />
      );
    }
  }

  const vLines = [];
  for (let c = 0; c <= cols; c++) {
    vLines.push(<line key={`v-${c}`} x1={x + c * cellW} y1={baseH - h} x2={x + c * cellW} y2={baseH} stroke={frameColor} strokeWidth="0.4" />);
  }

  const hLines = [];
  for (let r = 0; r <= rows; r++) {
    hLines.push(<line key={`h-${r}`} x1={x} y1={baseH - h + r * cellH} x2={x + w} y2={baseH - h + r * cellH} stroke={frameColor} strokeWidth="0.4" />);
  }

  const reflections = [];
  for (let r = 0; r < rows; r += 2) {
    reflections.push(
      <rect key={`ref-${r}`} x={x} y={baseH - h + r * cellH} width={w} height={cellH}
        fill={r % 4 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} />
    );
  }

  const rounded = seed % 3 === 0;
  const cornerR = Math.min(w * 0.08, 6);

  return (
    <g>
      {rounded ? (
        <path d={`M${x},${baseH - h + cornerR} Q${x},${baseH - h} ${x + cornerR},${baseH - h} L${x + w - cornerR},${baseH - h} Q${x + w},${baseH - h} ${x + w},${baseH - h + cornerR} L${x + w},${baseH} L${x},${baseH} Z`}
          fill={fill} stroke={frameColor} strokeWidth="0.5" />
      ) : (
        <rect x={x} y={baseH - h} width={w} height={h} fill={fill} stroke={frameColor} strokeWidth="0.5" />
      )}
      {reflections}
      {windowEls}
      {vLines}
      {hLines}
      {seed % 2 === 0 && <rect x={x + w * 0.15} y={baseH - h - 6} width={w * 0.25} height={6} fill={fill} stroke={frameColor} strokeWidth="0.3" />}
      {seed % 3 === 1 && <rect x={x + w * 0.55} y={baseH - h - 5} width={w * 0.2} height={5} fill={fill} stroke={frameColor} strokeWidth="0.3" />}
      {seed % 4 === 0 && <circle cx={x + w * 0.5} cy={baseH - h - 4} r={Math.min(w * 0.08, 4)} fill="rgba(100,116,139,0.3)" stroke={frameColor} strokeWidth="0.3" />}
      {seed % 5 === 0 && (
        <>
          <line x1={x + w * 0.3} y1={baseH - h} x2={x + w * 0.3} y2={baseH - h - 18} stroke={frameColor} strokeWidth="0.8" />
          <line x1={x + w * 0.7} y1={baseH - h} x2={x + w * 0.7} y2={baseH - h - 14} stroke={frameColor} strokeWidth="0.8" />
        </>
      )}
      {seed % 6 === 0 && (
        <>
          <line x1={x + w / 2} y1={baseH - h} x2={x + w / 2} y2={baseH - h - 22} stroke={frameColor} strokeWidth="1" />
          <circle cx={x + w / 2} cy={baseH - h - 22} r="1.5" fill="rgba(248,113,113,0.6)" />
        </>
      )}
    </g>
  );
}

/* ── Station building ── */
export function Station({ x, w, baseH, fill, windowFill, frameColor }) {
  const h = 170;
  const top = baseH - h;
  const roofH = 28;
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} fill={fill} stroke={frameColor} strokeWidth="0.5" />
      <path d={`M${x - 4},${top} Q${x + w / 2},${top - roofH} ${x + w + 4},${top} Z`}
        fill={fill} stroke={frameColor} strokeWidth="0.5" opacity="0.85" />
      {Array.from({ length: 7 }, (_, i) => {
        const dx = (w / 6) * i;
        const dy = dx < w / 2 ? -(dx / (w / 2)) * roofH : -((w - dx) / (w / 2)) * roofH;
        return <line key={i} x1={x + dx} y1={top + dy} x2={x + dx} y2={baseH} stroke={frameColor} strokeWidth="0.3" opacity="0.35" />;
      })}
      <rect x={x + w * 0.08} y={top + 16} width={w * 0.84} height={h - 46} fill={windowFill} opacity="0.35" />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={x + w * 0.08 + (w * 0.84 / 7) * (i + 1)} y1={top + 16} x2={x + w * 0.08 + (w * 0.84 / 7) * (i + 1)} y2={top + h - 30} stroke={frameColor} strokeWidth="0.3" opacity="0.5" />
      ))}
      <line x1={x + w * 0.08} y1={top + h / 2 - 4} x2={x + w * 0.92} y2={top + h / 2 - 4} stroke={frameColor} strokeWidth="0.3" opacity="0.5" />
      <rect x={x + w * 0.38} y={baseH - 28} width={w * 0.24} height={28} fill={windowFill} opacity="0.5" />
      <line x1={x + w * 0.5} y1={baseH - 28} x2={x + w * 0.5} y2={baseH} stroke={frameColor} strokeWidth="0.3" />
      <rect x={x + w * 0.28} y={top + 4} width={w * 0.44} height={9} rx="1" fill="rgba(56,189,248,0.35)" stroke={frameColor} strokeWidth="0.3" />
      <rect x={x + w * 0.32} y={top + 6} width={w * 0.36} height={5} fill="rgba(255,255,255,0.15)" />
    </g>
  );
}

/* ── Building layer — seamless loop ── */
export function BuildingLayer({ buildings, viewBoxH, opacity, duration, fill, windowFill, frameColor, bottom = 0 }) {
  const totalW = useMemo(() => buildings.reduce((s, b) => s + b.w + b.gap, 0), [buildings]);
  const doubled = [...buildings, ...buildings];

  return (
    <motion.div className="absolute left-0" style={{ opacity, bottom, height: viewBoxH, width: totalW * 2 }}
      animate={{ x: [0, -totalW] }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}>
      <svg width={totalW * 2} height={viewBoxH} viewBox={`0 0 ${totalW * 2} ${viewBoxH}`} preserveAspectRatio="xMinYMax meet">
        {doubled.map((b, i) => {
          let x = 0;
          const mod = i % buildings.length;
          for (let j = 0; j < mod; j++) x += buildings[j].w + buildings[j].gap;
          const realX = i < buildings.length ? x : x + totalW;
          return b.isStation
            ? <Station key={i} x={realX} w={b.w} baseH={viewBoxH} fill={fill} windowFill={windowFill} frameColor={frameColor} />
            : <DetailedBuilding key={i} x={realX} w={b.w} h={b.h} baseH={viewBoxH} fill={fill} windowFill={windowFill} frameColor={frameColor} seed={i} />;
        })}
      </svg>
    </motion.div>
  );
}

/* ── Ultra-detailed Tokyo Tower ── */
export function TokyoTower({ left, scale, opacity }) {
  const els = [];
  els.push(<polygon key="body" points="35,0 30,50 20,100 8,160 0,220 70,220 62,160 50,100 40,50" fill="#E63946" />);
  els.push(<polygon key="shade" points="35,0 30,50 20,100 8,160 0,220 70,220 62,160 50,100 40,50" fill="rgba(255,255,255,0.1)" />);

  for (let y = 5; y < 220; y += 5) {
    let lx, rx;
    if (y < 50) { lx = 35 - (y / 50) * 5; rx = 35 + (y / 50) * 5; }
    else if (y < 100) { lx = 30 - ((y - 50) / 50) * 10; rx = 40 + ((y - 50) / 50) * 10; }
    else if (y < 160) { lx = 20 - ((y - 100) / 60) * 12; rx = 50 + ((y - 100) / 60) * 12; }
    else { lx = 8 - ((y - 160) / 60) * 8; rx = 62 + ((y - 160) / 60) * 8; }
    els.push(<line key={`hb-${y}`} x1={lx} y1={y} x2={rx} y2={y} stroke="#C1121F" strokeWidth="0.3" opacity="0.6" />);
  }

  for (let y = 5; y < 155; y += 5) {
    let lx1, rx1;
    if (y < 50) { lx1 = 35 - (y / 50) * 5; rx1 = 35 + (y / 50) * 5; }
    else if (y < 100) { lx1 = 30 - ((y - 50) / 50) * 10; rx1 = 40 + ((y - 50) / 50) * 10; }
    else { lx1 = 20 - ((y - 100) / 60) * 12; rx1 = 50 + ((y - 100) / 60) * 12; }
    const y2 = y + 5;
    let lx2, rx2;
    if (y2 < 50) { lx2 = 35 - (y2 / 50) * 5; rx2 = 35 + (y2 / 50) * 5; }
    else if (y2 < 100) { lx2 = 30 - ((y2 - 50) / 50) * 10; rx2 = 40 + ((y2 - 50) / 50) * 10; }
    else { lx2 = 20 - ((y2 - 100) / 60) * 12; rx2 = 50 + ((y2 - 100) / 60) * 12; }
    els.push(<line key={`x1-${y}`} x1={lx1} y1={y} x2={rx2} y2={y2} stroke="#C1121F" strokeWidth="0.2" opacity="0.4" />);
    els.push(<line key={`x2-${y}`} x1={rx1} y1={y} x2={lx2} y2={y2} stroke="#C1121F" strokeWidth="0.2" opacity="0.4" />);
  }

  for (let y = 160; y < 220; y += 3) {
    const t = (y - 160) / 60;
    const lx = 8 - t * 8;
    const rx = 62 + t * 8;
    els.push(<line key={`mh-${y}`} x1={lx} y1={y} x2={rx} y2={y} stroke="#C1121F" strokeWidth="0.25" opacity="0.5" />);
    const steps = 6;
    for (let s = 0; s <= steps; s++) {
      const fx = lx + (rx - lx) * (s / steps);
      els.push(<line key={`mv-${y}-${s}`} x1={fx} y1={y} x2={fx} y2={y + 3} stroke="#C1121F" strokeWidth="0.15" opacity="0.35" />);
    }
    const y2m = y + 3;
    const t2 = (y2m - 160) / 60;
    const lx2m = 8 - t2 * 8;
    const rx2m = 62 + t2 * 8;
    for (let s = 0; s < steps; s++) {
      const fx1 = lx + (rx - lx) * (s / steps);
      const fx2 = lx2m + (rx2m - lx2m) * ((s + 1) / steps);
      els.push(<line key={`md1-${y}-${s}`} x1={fx1} y1={y} x2={fx2} y2={y2m} stroke="#C1121F" strokeWidth="0.1" opacity="0.25" />);
      const fx3 = lx2m + (rx2m - lx2m) * (s / steps);
      els.push(<line key={`md2-${y}-${s}`} x1={fx2} y1={y} x2={fx3} y2={y2m} stroke="#C1121F" strokeWidth="0.1" opacity="0.25" />);
    }
  }

  els.push(<rect key="deck1" x="14" y="100" width="42" height="14" fill="#E63946" />);
  els.push(<rect key="deck1-s" x="14" y="100" width="42" height="14" fill="rgba(255,255,255,0.15)" />);
  els.push(<rect key="deck2" x="22" y="80" width="26" height="10" fill="#E63946" />);
  for (let i = 0; i < 12; i++) els.push(<rect key={`dw1-${i}`} x={15 + i * 3.3} y="103" width="2" height="8" fill="rgba(253,224,71,0.4)" />);
  for (let i = 0; i < 8; i++) els.push(<rect key={`dw2-${i}`} x={23 + i * 3} y="82" width="2" height="6" fill="rgba(253,224,71,0.4)" />);
  els.push(<line key="tip" x1="35" y1="0" x2="35" y2="-18" stroke="#E63946" strokeWidth="1" />);
  els.push(<circle key="tiplight" cx="35" cy="-18" r="2" fill="rgba(248,113,113,0.8)" />);

  return (
    <div className="absolute bottom-0 pointer-events-none" style={{ left, opacity, transform: `scale(${scale})`, transformOrigin: 'bottom center' }}>
      <svg width="70" height="240" viewBox="-2 -20 74 240">{els}</svg>
    </div>
  );
}

/* ── Skytree ── */
export function Skytree({ left, scale, opacity }) {
  return (
    <div className="absolute bottom-0 pointer-events-none" style={{ left, opacity, transform: `scale(${scale})`, transformOrigin: 'bottom center' }}>
      <svg width="50" height="320" viewBox="0 -20 50 320">
        <path d="M22 0 L20 30 L16 80 L10 160 L5 250 L2 300 L48 300 L45 250 L40 160 L34 80 L30 30 L28 0 Z" fill="rgba(71,85,105,0.4)" stroke="rgba(100,116,139,0.3)" strokeWidth="0.5" />
        <ellipse cx="25" cy="120" rx="14" ry="8" fill="rgba(71,85,105,0.5)" />
        <ellipse cx="25" cy="100" rx="10" ry="6" fill="rgba(71,85,105,0.5)" />
        {Array.from({ length: 30 }, (_, i) => {
          const y = 30 + i * 9;
          const t = y / 300;
          const halfW = 3 + t * 22;
          return <line key={i} x1={25 - halfW} y1={y} x2={25 + halfW} y2={y} stroke="rgba(100,116,139,0.2)" strokeWidth="0.3" />;
        })}
        {Array.from({ length: 15 }, (_, i) => {
          const y = 30 + i * 18;
          const t = y / 300;
          const halfW = 3 + t * 22;
          return <line key={`d-${i}`} x1={25 - halfW} y1={y} x2={25 + halfW} y2={y + 9} stroke="rgba(100,116,139,0.12)" strokeWidth="0.2" />;
        })}
        <circle cx="25" cy="0" r="2" fill="rgba(248,113,113,0.6)" />
      </svg>
    </div>
  );
}