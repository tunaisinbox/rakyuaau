import { motion } from 'framer-motion';

export default function LoadingBar({ visible }) {
  if (!visible) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-pink-100">
      <motion.div
        className="h-full bg-pink-500 rounded-r"
        initial={{ width: '0%' }}
        animate={{ width: ['0%', '70%', '90%', '100%'] }}
        transition={{ duration: 1.5, times: [0, 0.4, 0.8, 1] }}
      />
    </div>
  );
}