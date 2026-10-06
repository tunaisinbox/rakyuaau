const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Plus, Trash2, Check, X, Shield } from 'lucide-react';

import { registerPasskey } from '../auth/PasskeyButton';

export default function PasskeySection({ account, onUpdated }) {
  const [registering, setRegistering] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const credentials = (() => {
    try { return JSON.parse(account?.passkey_credentials || '[]'); }
    catch { return []; }
  })();

  const handleRegister = async () => {
    if (!keyName.trim()) { setError('キー名を入力してください'); return; }
    setError('');
    setRegistering(true);
    try {
      const cred = await registerPasskey(account.rakyuaid, account.id);
      const updated = [...credentials, { ...cred, name: keyName.trim(), registeredAt: new Date().toISOString() }];
      await db.entities.RakyuAccount.update(account.id, { passkey_credentials: JSON.stringify(updated) });
      onUpdated?.(JSON.stringify(updated));
      setKeyName('');
      setSuccess('パスキーを登録しました');
      setTimeout(() => setSuccess(''), 2500);
    } catch (e) {
      setError('パスキーの登録に失敗しました: ' + (e.message || ''));
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (credId) => {
    const updated = credentials.filter(c => c.id !== credId);
    await db.entities.RakyuAccount.update(account.id, { passkey_credentials: JSON.stringify(updated) });
    onUpdated?.(JSON.stringify(updated));
  };

  if (!window.PublicKeyCredential) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden"
    >
      <div className="px-5 py-3 bg-pink-50/60 flex items-center gap-2">
        <Shield className="w-4 h-4 text-pink-500" />
        <span className="text-xs font-semibold text-pink-500 uppercase tracking-wider">パスキー</span>
        <span className="ml-auto text-xs text-muted-foreground">{credentials.length} 件登録済み</span>
      </div>

      <div className="px-5 py-4 space-y-3">
        {credentials.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">パスキーが登録されていません</p>
        ) : (
          <div className="space-y-2">
            {credentials.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                <Fingerprint className="w-5 h-5 text-pink-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.registeredAt ? new Date(c.registeredAt).toLocaleDateString('ja-JP') : ''}</p>
                </div>
                <button onClick={() => handleDelete(c.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-400 transition-all flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={keyName}
            onChange={e => { setKeyName(e.target.value); setError(''); }}
            placeholder="キー名（例: iPhone, Windows PC）"
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-pink-200 focus:border-pink-400 outline-none text-sm"
          />
          <button onClick={handleRegister} disabled={registering}
            className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0">
            {registering
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Plus className="w-4 h-4" />}
            追加
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-xs text-red-500 flex items-center gap-1">
              <X className="w-3 h-3" />{error}
            </motion.p>
          )}
          {success && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-xs text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" />{success}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}