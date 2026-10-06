import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Loading screen: welcome banner over the sky ──────── */
export default function LoadingScreen({ minDuration = 3000, ready = true, onDone }) {
  const [exiting, setExiting] = useState(false);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      if (ready && Date.now() - start >= minDuration) {
        clearInterval(timer);
        setExiting(true);
        setTimeout(() => onDone?.(), 1300);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [ready, minDuration, onDone]);

  const handleClick = useCallback((e) => {
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { x: e.clientX, y: e.clientY, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
  }, []);

  return (
    <motion.div className="fixed inset-0 z-50 overflow-hidden cursor-pointer"
      style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 40%, #E0F4FF 70%, #ffffff 100%)' }}
      onClick={handleClick}
      animate={{ opacity: exiting ? 0 : 1, scale: exiting ? 3 : 1 }}
      transition={{ duration: exiting ? 1.2 : 0.5, ease: [0.16, 1, 0.3, 1] }}>

      {/* Banner: 上空からビルの地面へ降りてくる */}
      <div className="absolute inset-x-0 bottom-[14%] flex flex-col items-center pointer-events-none z-20">
        <motion.div className="w-full py-5 px-8 text-center"
          style={{ background: 'rgba(100, 116, 139, 0.92)' }}
          initial={{ opacity: 0, y: -160 }}
          animate={{ opacity: exiting ? 0 : 1, y: exiting ? -160 : 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-white text-lg font-bold tracking-wide mb-4">らきゅあへようこそ</h1>
          <div className="flex gap-3 justify-center items-center">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-2.5 h-2.5 rounded-full bg-white"
                animate={{ scale: [1, 2, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div key={r.id} className="absolute rounded-full pointer-events-none z-30"
            style={{ left: r.x, top: r.y, border: '2px solid rgba(255,255,255,0.8)', x: '-50%', y: '-50%' }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 100, height: 100, opacity: 0 }}
            transition={{ duration: 0.6 }} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}