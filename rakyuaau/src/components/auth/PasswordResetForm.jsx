const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, Check } from 'lucide-react';

import Spinner from './Spinner';
import FloatingInput from './FloatingInput';
import LoadingBar from './LoadingBar';

const slide = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 }, transition: { duration: 0.3 } };

export default function PasswordResetForm({ onBack }) {
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const accounts = await db.entities.RakyuAccount.list();
    const found = accounts.find(a => a.email === contact || a.phone === contact);
    if (!found) { setError('このメールアドレスまたは電話番号は登録されていません'); setLoading(false); return; }
    setAccount(found);
    const c = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(c);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    alert(`認証コード: ${c}（テスト用）`);
    setStep(1);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (code !== sentCode) { setError('認証コードが間違っています'); return; }
    setStep(2);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/.test(password)) {
      setError('大文字・小文字・数字・記号を各1文字以上含む8文字以上'); return;
    }
    if (password !== password2) { setError('パスワードが一致しません'); return; }
    setLoading(true);
    await db.entities.RakyuAccount.update(account.id, { password_hash: password });
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-10 h-10 text-green-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-2">パスワードをリセットしました</h2>
        <button onClick={onBack} className="mt-4 px-8 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-all">
          ログインへ
        </button>
      </motion.div>
    );
  }

  return (
    <>
      <LoadingBar visible={loading} />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">パスワードリセット</h1>
          <p className="text-muted-foreground text-sm mt-1">メールアドレスまたは電話番号を入力してください</p>
        </div>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.form key="r0" {...slide} onSubmit={handleSendCode} className="space-y-4">
              <div>
                <FloatingInput label="メールアドレスまたは電話番号" value={contact} onChange={v => { setContact(v); setError(''); }} required />
              </div>
              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm">{error}</motion.p>}
              <button type="submit" disabled={loading || !contact}
                className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                {loading && <Spinner />} 認証コードを送信
              </button>
              <button type="button" onClick={onBack} className="text-sm text-pink-500 hover:underline flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> ログインに戻る
              </button>
            </motion.form>
          )}
          {step === 1 && (
            <motion.form key="r1" {...slide} onSubmit={handleVerify} className="space-y-4">
              <div>
                <FloatingInput label="認証コード" value={code} onChange={v => { setCode(v); setError(''); }} required />
              </div>
              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm">{error}</motion.p>}
              <button type="submit" className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center justify-center gap-2 transition-all">
                確認 <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}
          {step === 2 && (
            <motion.form key="r2" {...slide} onSubmit={handleReset} className="space-y-4">
              <div>
                <FloatingInput label="新しいパスワード" value={password} onChange={v => { setPassword(v); setError(''); }} type={showPw ? 'text' : 'password'} required>
                  <button type="button" onPointerDown={() => setShowPw(true)} onPointerUp={() => setShowPw(false)} onPointerLeave={() => setShowPw(false)}
                    className="p-1.5 text-muted-foreground hover:text-pink-500 touch-none"><Eye className="w-5 h-5" /></button>
                </FloatingInput>
              </div>
              <div>
                <FloatingInput label="パスワード確認" value={password2} onChange={v => { setPassword2(v); setError(''); }} type="password" required />
              </div>
              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm">{error}</motion.p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                {loading && <Spinner />} パスワードをリセット
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}