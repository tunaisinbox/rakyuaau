const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundSlider from '../components/auth/BackgroundSlider';
import ShibuyaScene from '../components/run/ShibuyaScene';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import PasswordResetForm from '../components/auth/PasswordResetForm';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [isV2, setIsV2] = useState(true);

  useEffect(() => {
    db.entities.RakyuAccount.filter({ rakyuaid: 'tunaisinbox' })
      .then(res => { if (res.length) setIsV2((res[0].login_version || 'v2') === 'v2'); })
      .catch(() => {});
  }, []);

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 ${isV2 ? 'theme-sky' : ''}`}>
      {isV2 ? <ShibuyaScene /> : <BackgroundSlider />}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`w-full max-w-2xl backdrop-blur-xl rounded-xl shadow-2xl shadow-pink-200/50 relative overflow-hidden flex ${isV2 ? 'bg-white/20' : 'bg-white/95'}`}
      >
        {/* Form panel */}
        <div className="flex-1 p-8 min-w-0 relative z-10">
          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.div key="login"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                <LoginForm onSwitch={() => setMode('register')} onResetPassword={() => setMode('reset')} />
              </motion.div>
            )}
            {mode === 'register' && (
              <motion.div key="register"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <RegisterForm onSwitch={() => setMode('login')} />
              </motion.div>
            )}
            {mode === 'reset' && (
              <motion.div key="reset"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <PasswordResetForm onBack={() => setMode('login')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <Link to="/services" className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 text-sky-400/80 hover:text-sky-300 text-xs font-mono tracking-widest transition-colors">
        SERVICE_LIST →
      </Link>
    </div>
  );
}