import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

export default function RobotVerification({ dropKey, locked, lockSecondsLeft, onVerified }) {
  const [phase, setPhase] = useState('idle');
  const [challengeType] = useState(() => Math.random() > 0.5 ? 'slider' : 'hold');

  useEffect(() => { setPhase('idle'); }, [dropKey]);

  const handleCheck = () => {
    if (locked || phase !== 'idle') return;
    setPhase('challenge');
  };

  const handleSuccess = () => {
    setPhase('done');
    onVerified();
  };

  const mins = Math.floor((lockSecondsLeft || 0) / 60);
  const secs = (lockSecondsLeft || 0) % 60;

  return (
    <motion.div
      key={dropKey}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="relative"
    >
      <div className={`relative border-2 rounded-xl bg-white overflow-hidden transition-colors duration-300 ${locked ? 'border-slate-400' : 'border-pink-200'}`}>
        {/* Checkbox row */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <button
            type="button"
            onClick={handleCheck}
            disabled={locked || phase === 'challenge'}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all focus:outline-none
              ${locked ? 'border-slate-400 bg-slate-100 cursor-not-allowed' :
                phase === 'done' ? 'border-pink-500 bg-pink-500 cursor-default' :
                'border-pink-300 hover:border-pink-500 cursor-pointer bg-white'}`}
          >
            <AnimatePresence mode="wait">
              {phase === 'done' && (
                <motion.span key="chk"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <span className={`text-sm font-medium select-none ${locked ? 'text-slate-400' : 'text-foreground'}`}>
            {locked
              ? `封印中 — ${mins}分${secs}秒後に解除`
              : phase === 'done'
              ? 'ロボットではありません'
              : 'あなたはロボットではありません'}
          </span>
        </div>

        {/* Challenge area */}
        <AnimatePresence>
          {phase === 'challenge' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="px-4 pb-4 pt-1 border-t border-pink-100">
                {challengeType === 'slider'
                  ? <SliderChallenge onSuccess={handleSuccess} />
                  : <HoldChallenge onSuccess={handleSuccess} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chain lock overlay */}
        <AnimatePresence>
          {locked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]"
            >
              <ChainLock />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ChainLock() {
  return (
    <div className="flex flex-col items-center gap-0 select-none">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div key={`t${i}`}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 400 }}
            className="relative mx-0.5"
          >
            {i % 2 === 0
              ? <div className="w-4 h-6 border-[2.5px] border-slate-500 rounded-full bg-transparent" />
              : <div className="w-6 h-4 border-[2.5px] border-slate-500 rounded-full bg-transparent" />}
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.25 }}
        className="my-1 flex flex-col items-center"
      >
        <div className="relative w-8 h-5 mb-[-2px]">
          <div className="absolute inset-x-1 top-0 h-full border-[3px] border-slate-600 rounded-t-full border-b-0 bg-transparent" />
        </div>
        <div className="w-10 h-8 bg-slate-600 rounded-lg flex items-center justify-center shadow-md">
          <div className="w-2 h-3 bg-slate-800 rounded-full relative">
            <div className="absolute top-1.5 left-0.5 w-1 h-1.5 bg-slate-600 rounded-full" />
          </div>
        </div>
      </motion.div>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div key={`b${i}`}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 400 }}
            className="relative mx-0.5"
          >
            {i % 2 === 0
              ? <div className="w-4 h-6 border-[2.5px] border-slate-500 rounded-full bg-transparent" />
              : <div className="w-6 h-4 border-[2.5px] border-slate-500 rounded-full bg-transparent" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Slider → checkmark ───────────────────────────────────────────
function SliderChallenge({ onSuccess }) {
  const [pos, setPos] = useState(0);
  const [complete, setComplete] = useState(false);
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const [failed, setFailed] = useState(false);

  const getMax = () => (trackRef.current?.offsetWidth || 280) - 44;

  const handlePointerDown = (e) => {
    if (complete) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    startX.current = e.clientX - pos;
  };
  const handlePointerMove = (e) => {
    if (!dragging.current) return;
    setPos(Math.max(0, Math.min(e.clientX - startX.current, getMax())));
  };
  const handlePointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (pos >= getMax() * 0.88) {
      setComplete(true);
      setTimeout(() => onSuccess(), 900);
    } else {
      setFailed(true);
      setTimeout(() => { setPos(0); setFailed(false); }, 600);
    }
  };

  const pct = (pos / Math.max(getMax(), 1)) * 100;

  return (
    <div className="space-y-2 mt-1">
      <p className="text-xs text-muted-foreground">矢印を右端までスライドしてください</p>
      <div ref={trackRef} className="relative h-10 bg-pink-50 rounded-full overflow-hidden select-none border border-pink-200">
        {!complete && (
          <>
            <div className="absolute inset-y-0 left-0 bg-pink-300/30 rounded-full" style={{ width: `${pct}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-xs text-pink-200 pointer-events-none">→ → →</span>
            <motion.div
              className={`absolute top-1 left-0 w-8 h-8 rounded-full flex items-center justify-center shadow cursor-grab active:cursor-grabbing touch-none ${failed ? 'bg-red-400' : 'bg-pink-500'}`}
              style={{ x: pos }}
              animate={failed ? { x: [pos, pos - 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </motion.div>
          </>
        )}

        {/* Success: bar morphs to checkmark */}
        {complete && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-green-100 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <svg viewBox="0 0 40 20" className="w-16 h-8">
              <motion.path
                d="M 4 10 L 14 17 L 36 3"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Hold → checkmark ─────────────────────────────────────────────
function HoldChallenge({ onSuccess }) {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const holdingRef = useRef(false);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  const tick = useCallback((ts) => {
    if (!holdingRef.current) return;
    const delta = lastRef.current ? (ts - lastRef.current) / 1000 : 0.016;
    lastRef.current = ts;
    setProgress(prev => {
      const next = prev + delta * 65;
      if (next >= 100) {
        holdingRef.current = false;
        setComplete(true);
        setTimeout(() => onSuccess(), 900);
        return 100;
      }
      rafRef.current = requestAnimationFrame(tick);
      return next;
    });
  }, [onSuccess]);

  const decay = useCallback((ts) => {
    if (holdingRef.current) return;
    const delta = lastRef.current ? (ts - lastRef.current) / 1000 : 0.016;
    lastRef.current = ts;
    setProgress(prev => {
      const next = prev - delta * 45;
      if (next <= 0) return 0;
      rafRef.current = requestAnimationFrame(decay);
      return next;
    });
  }, []);

  const start = (e) => {
    e.preventDefault();
    if (complete) return;
    holdingRef.current = true;
    lastRef.current = null;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  const stop = (e) => {
    e?.preventDefault?.();
    if (!holdingRef.current || complete) return;
    holdingRef.current = false;
    lastRef.current = null;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(decay);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div className="space-y-2 mt-1">
      <p className="text-xs text-muted-foreground">ボタンを長押ししてバーを満たしてください</p>

      {/* Bar → checkmark container */}
      <div className="relative h-4 rounded-full overflow-visible">
        {!complete ? (
          /* Normal progress bar */
          <div className="h-4 bg-pink-100 rounded-full overflow-hidden border border-pink-200">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #fbcfe8, #ec4899)',
              }}
              transition={{ duration: 0.05 }}
            />
          </div>
        ) : (
          /* Bar morphs to checkmark via SVG */
          <div className="flex items-center justify-center h-4">
            <svg viewBox="0 0 120 24" className="w-full h-10 overflow-visible">
              {/* Green fill bar that shrinks */}
              <motion.rect
                x="0" y="8" height="8" rx="4"
                fill="#22c55e"
                initial={{ width: 120 }}
                animate={{ width: 0 }}
                transition={{ duration: 0.35, ease: 'easeIn' }}
              />
              {/* Checkmark that draws */}
              <motion.path
                d="M 20 12 L 50 20 L 100 4"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
              />
            </svg>
          </div>
        )}
      </div>

      <AnimatePresence>
        {!complete && (
          <motion.button
            exit={{ opacity: 0, scaleY: 0, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
            transition={{ duration: 0.25 }}
            type="button"
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            onPointerCancel={stop}
            className="w-full py-2.5 rounded-full bg-pink-500 text-white text-sm font-semibold select-none touch-none active:bg-pink-600 transition-colors overflow-hidden"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            長押しして認証
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}