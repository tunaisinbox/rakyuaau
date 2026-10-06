const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Eye, EyeOff, Check, X } from 'lucide-react';

export default function PinSection({ account, onUpdated }) {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (currentPw !== account.password_hash) { setError('現在のパスワードが違います'); return; }
    if (!newPin || newPin.length < 4) { setError('PINは4文字以上にしてください'); return; }
    if (newPin !== confirmPin) { setError('PINが一致しません'); return; }
    setSaving(true);
    await db.entities.RakyuAccount.update(account.id, { developer_pin: newPin });
    setSaving(false);
    setNewPin(''); setConfirmPin(''); setCurrentPw('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onUpdated?.(newPin);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border-2 border-amber-200 overflow-hidden"
    >
      <div className="px-5 py-3 bg-amber-50 flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">デベロッパーPIN管理</span>
        {account?.developer_pin && (
          <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">設定済み</span>
        )}
      </div>
      <form onSubmit={handleSave} className="px-5 py-4 space-y-3">
        <p className="text-xs text-muted-foreground">このPINがないとデベロッパーアカウントを作成できません。</p>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">新しいPIN</label>
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              value={newPin}
              onChange={e => { setNewPin(e.target.value); setError(''); }}
              placeholder="新しいPINを入力"
              className="w-full px-4 py-2.5 pr-10 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none text-sm"
            />
            <button type="button" onPointerDown={() => setShowPin(true)} onPointerUp={() => setShowPin(false)} onPointerLeave={() => setShowPin(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-amber-500 touch-none">
              {showPin ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">PIN確認</label>
          <input
            type="password"
            value={confirmPin}
            onChange={e => { setConfirmPin(e.target.value); setError(''); }}
            placeholder="もう一度入力"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">本人確認（現在のパスワード）</label>
          <input
            type="password"
            value={currentPw}
            onChange={e => { setCurrentPw(e.target.value); setError(''); }}
            placeholder="現在のパスワード"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none text-sm"
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-500 flex items-center gap-1">
              <X className="w-3 h-3" />{error}
            </motion.p>
          )}
          {saved && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" />PINを設定しました
            </motion.p>
          )}
        </AnimatePresence>

        <button type="submit" disabled={saving || !newPin || !confirmPin || !currentPw}
          className="w-full py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {saving
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Check className="w-4 h-4" />}
          PINを保存
        </button>
      </form>
    </motion.div>
  );
}