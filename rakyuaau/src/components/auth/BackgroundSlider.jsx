import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const backgrounds = [
  { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80', title: '山と湖の風景' },
  { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80', title: '霧の森' },
  { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80', title: '緑の森林' },
  { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80', title: 'ビーチと海' },
  { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80', title: '星空の山' },
  { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80', title: '夕焼けの湖' },
];

export default function BackgroundSlider() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * backgrounds.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % backgrounds.length);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url(${backgrounds[index].url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>
      <div className="fixed inset-0 -z-10 bg-white/40 backdrop-blur-sm" />
      <motion.div
        key={`credit-${index}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-50 text-white/80 text-lg font-medium drop-shadow-lg"
      >
        {backgrounds[index].title}
      </motion.div>
    </>
  );
}