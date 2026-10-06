const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, X, Fingerprint, Check } from 'lucide-react';

const slide = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 }, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } };

/* ── Light input ──────────────────────────────────────── */
function LightInput({ value, onChange, placeholder, type = 'text', children }) {
  return (
    <div className="relative">
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-gray-800 placeholder-gray-300 outline-none text-sm rounded-xl transition-all"
        style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(56,189,248,0.2)' }}
        onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; e.target.style.boxShadow = '0 0 12px rgba(56,189,248,0.1)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(56,189,248,0.2)'; e.target.style.boxShadow = 'none'; }} />
      {children && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">{children}</div>}
    </div>
  );
}

/* ── Light button ─────────────────────────────────────── */
function LightButton({ onClick, disabled, loading, variant = 'primary', children, type = 'button' }) {
  const isPrimary = variant === 'primary';
  return (
    <motion.button type={type}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={onClick} disabled={disabled}
      className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      style={isPrimary ? { background: '#38bdf8', color: 'white', boxShadow: '0 4px 14px rgba(56,189,248,0.25)' } : { border: '1px solid rgba(56,189,248,0.3)', background: 'transparent', color: '#0ea5e9' }}>
      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
    </motion.button>
  );
}

function ErrLine({ msg }) {
  return (
    <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
      className="text-red-400 text-xs flex items-center gap-1.5">
      <X className="w-3 h-3 flex-shrink-0" />{msg}
    </motion.p>
  );
}

/* ── Register sub-form ───────────────────────────────── */
function RegisterSubForm({ onDone, onBack }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name_sei: '', name_mei: '', birthday: '', gender: '', rakyuaid: '', password: '', password2: '', email: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };
  const steps = ['名前', '詳細', 'ID', 'パスワード', '完了'];

  const handleStep0 = (e) => { e.preventDefault(); if (!form.name_sei || !form.name_mei) { setError('姓と名前を入力してください'); return; } setStep(1); };
  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.birthday || !form.gender) { setError('生年月日と性別を入力してください'); return; }
    const rand = () => Math.floor(Math.random() * 9999);
    setSuggestions([`${form.name_mei}${rand()}`, `${form.name_sei}_${rand()}`, `${form.name_mei}${form.name_sei}${rand()}`]);
    setStep(2);
  };
  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!form.rakyuaid) { setError('RakyuaIDを入力してください'); return; }
    setLoading(true);
    const ex = await db.entities.RakyuAccount.filter({ rakyuaid: form.rakyuaid });
    setLoading(false);
    if (ex.length > 0) { setError('このIDは既に使用されています'); return; }
    setStep(3);
  };
  const handleStep3 = (e) => {
    e.preventDefault();
    const ok = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/.test(form.password);
    if (!ok) { setError('大文字・小文字・数字・記号を含む8文字以上'); return; }
    if (form.password !== form.password2) { setError('パスワードが一致しません'); return; }
    setStep(4);
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    await db.entities.RakyuAccount.create({
      name_sei: form.name_sei, name_mei: form.name_mei,
      birthday: form.birthday, gender: form.gender,
      rakyuaid: form.rakyuaid, password_hash: form.password, email: form.email,
    });
    setLoading(false);
    onDone(form.rakyuaid, form.password);
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex gap-1.5">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div className="h-1 w-full rounded-full"
              animate={{ background: i <= step ? '#38bdf8' : 'rgba(56,189,248,0.15)' }}
              transition={{ duration: 0.4 }} />
            <span className={`text-[9px] ${i <= step ? 'text-sky-500' : 'text-gray-300'}`}>{s}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.form key="r0" {...slide} onSubmit={handleStep0} className="space-y-2.5">
            <LightInput value={form.name_sei} onChange={v => set('name_sei', v)} placeholder="SEI (姓)" />
            <LightInput value={form.name_mei} onChange={v => set('name_mei', v)} placeholder="MEI (名前)" />
            {error && <ErrLine msg={error} />}
            <LightButton type="submit" variant="primary">次へ <ArrowRight className="w-4 h-4" /></LightButton>
            <button type="button" onClick={onBack} className="w-full text-xs text-gray-400 hover:text-sky-500 py-1 transition-colors">← ログインへ</button>
          </motion.form>
        )}
        {step === 1 && (
          <motion.form key="r1" {...slide} onSubmit={handleStep1} className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1.5">生年月日</p>
              <input type="date" value={form.birthday} onChange={e => set('birthday', e.target.value)}
                className="w-full px-4 py-3 text-gray-800 outline-none text-sm rounded-xl"
                style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(56,189,248,0.2)' }} required />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1.5">性別</p>
              <div className="grid grid-cols-3 gap-2">
                {['女性', '男性', '回答しない'].map(g => (
                  <button key={g} type="button" onClick={() => set('gender', g)}
                    className="py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: form.gender === g ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${form.gender === g ? 'rgba(56,189,248,0.5)' : 'rgba(56,189,248,0.15)'}`,
                      color: form.gender === g ? '#0ea5e9' : 'rgba(100,116,139,0.6)',
                    }}>{g}</button>
                ))}
              </div>
            </div>
            {error && <ErrLine msg={error} />}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(0)} className="px-4 py-3 rounded-xl text-gray-400 text-sm" style={{ border: '1px solid rgba(56,189,248,0.15)' }}>←</button>
              <LightButton type="submit" variant="primary">次へ <ArrowRight className="w-4 h-4" /></LightButton>
            </div>
          </motion.form>
        )}
        {step === 2 && (
          <motion.form key="r2" {...slide} onSubmit={handleStep2} className="space-y-2.5">
            <LightInput value={form.rakyuaid} onChange={v => set('rakyuaid', v)} placeholder="RakyuaID" />
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map(s => (
                  <button key={s} type="button" onClick={() => set('rakyuaid', s)}
                    className="px-2.5 py-1 rounded-lg text-xs text-sky-500 hover:text-sky-600 transition-colors"
                    style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}>{s}</button>
                ))}
              </div>
            )}
            {error && <ErrLine msg={error} />}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)} className="px-4 py-3 rounded-xl text-gray-400 text-sm" style={{ border: '1px solid rgba(56,189,248,0.15)' }}>←</button>
              <LightButton type="submit" loading={loading} variant="primary">次へ <ArrowRight className="w-4 h-4" /></LightButton>
            </div>
          </motion.form>
        )}
        {step === 3 && (
          <motion.form key="r3" {...slide} onSubmit={handleStep3} className="space-y-2.5">
            <LightInput value={form.password} onChange={v => set('password', v)} placeholder="パスワード" type={showPw ? 'text' : 'password'}>
              <button type="button" onPointerDown={() => setShowPw(true)} onPointerUp={() => setShowPw(false)} onPointerLeave={() => setShowPw(false)} className="p-1 text-gray-300 hover:text-sky-400 touch-none transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </LightInput>
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              {[['8文字+', form.password.length >= 8], ['大文字', /[A-Z]/.test(form.password)], ['小文字', /[a-z]/.test(form.password)], ['数字', /\d/.test(form.password)], ['記号', /[^a-zA-Z0-9]/.test(form.password)]].map(([t, ok]) => (
                <div key={t} className={`flex items-center gap-1 ${ok ? 'text-emerald-500' : 'text-gray-300'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-gray-200'}`} />{t}
                </div>
              ))}
            </div>
            <LightInput value={form.password2} onChange={v => set('password2', v)} placeholder="パスワード確認" type="password" />
            {error && <ErrLine msg={error} />}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(2)} className="px-4 py-3 rounded-xl text-gray-400 text-sm" style={{ border: '1px solid rgba(56,189,248,0.15)' }}>←</button>
              <LightButton type="submit" variant="primary">次へ <ArrowRight className="w-4 h-4" /></LightButton>
            </div>
          </motion.form>
        )}
        {step === 4 && (
          <motion.form key="r4" {...slide} onSubmit={handleCreate} className="space-y-2.5">
            <LightInput value={form.email} onChange={v => set('email', v)} placeholder="メール (任意)" type="email" />
            {error && <ErrLine msg={error} />}
            <LightButton type="submit" loading={loading} variant="primary">
              <Check className="w-4 h-4" /> アカウント作成
            </LightButton>
            <button type="button" onClick={() => setStep(3)} className="w-full text-xs text-gray-400 hover:text-sky-500 py-1 transition-colors">← 戻る</button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main login form ─────────────────────────────────── */
export default function RunLoginForm({ onLoggedIn }) {
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(0);
  const [rakyuaid, setRakyuaid] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const handleIdSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await db.entities.RakyuAccount.filter({ rakyuaid });
    setLoading(false);
    if (!res.length) { setError('このRakyuaIDは見つかりません'); return; }
    setAccount(res[0]); setStep(1);
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    if (password !== account.password_hash) {
      setError('パスワードが間違っています'); setPassword(''); return;
    }
    onLoggedIn(account);
  };

  const handlePasskey = async () => {
    setPasskeyLoading(true); setError('');
    try {
      const assertion = await navigator.credentials.get({
        publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), userVerification: 'preferred', timeout: 60000 },
      });
      const all = await db.entities.RakyuAccount.list();
      const found = all.find(a => {
        try { return JSON.parse(a.passkey_credentials || '[]').some(c => c.id === assertion.id); }
        catch { return false; }
      });
      if (!found) { setError('パスキーに紐づくアカウントが見つかりません'); return; }
      onLoggedIn(found);
    } catch { setError('パスキー認証に失敗しました'); }
    finally { setPasskeyLoading(false); }
  };

  const handleRegisterDone = async (rid) => {
    const res = await db.entities.RakyuAccount.filter({ rakyuaid: rid });
    if (res.length) onLoggedIn(res[0]);
  };

  return (
    <div className="space-y-4">
      {/* Tab */}
      <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(56,189,248,0.15)' }}>
        {[['login', 'ログイン'], ['register', '新規登録']].map(([m, l]) => (
          <button key={m} onClick={() => { setMode(m); setStep(0); setError(''); }}
            className="flex-1 py-2.5 text-xs font-bold transition-all"
            style={mode === m ? { background: '#38bdf8', color: 'white' } : { color: 'rgba(100,116,139,0.5)' }}>
            {l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'login' ? (
          <motion.div key="login-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.form key="lid" {...slide} onSubmit={handleIdSubmit} className="space-y-3">
                  <LightInput value={rakyuaid} onChange={v => { setRakyuaid(v); setError(''); }} placeholder="RakyuaID" />
                  {error && <ErrLine msg={error} />}
                  <LightButton type="submit" loading={loading} variant="primary" disabled={!rakyuaid || loading}>
                    次へ <ArrowRight className="w-4 h-4" />
                  </LightButton>
                </motion.form>
              )}
              {step === 1 && (
                <motion.form key="lpw" {...slide} onSubmit={handlePwSubmit} className="space-y-3">
                  {/* Account badge */}
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)' }}>
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white text-xs" style={{ background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)' }}>
                      {account?.avatar_url ? <img src={account.avatar_url} alt="" className="w-full h-full object-cover" /> : account?.name_sei?.[0]}
                    </div>
                    <div>
                      <p className="text-gray-700 text-xs font-semibold">{account?.name_mei}さん</p>
                      <p className="text-sky-400/60 text-[10px]">@{account?.rakyuaid}</p>
                    </div>
                  </motion.div>

                  <LightInput value={password} onChange={v => { setPassword(v); setError(''); }}
                    placeholder="パスワード" type={showPw ? 'text' : 'password'}>
                    <div className="flex items-center gap-0.5">
                      {(() => {
                        const creds = (() => { try { return JSON.parse(account?.passkey_credentials || '[]'); } catch { return []; } })();
                        if (!creds.length || !window.PublicKeyCredential) return null;
                        return (
                          <button type="button" onClick={handlePasskey} disabled={passkeyLoading}
                            className="p-1 text-gray-300 hover:text-sky-400 transition-colors" title="パスキーで認証">
                            {passkeyLoading ? <div className="w-4 h-4 border border-sky-400/30 border-t-sky-400 rounded-full animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                          </button>
                        );
                      })()}
                      <button type="button" onPointerDown={() => setShowPw(true)} onPointerUp={() => setShowPw(false)} onPointerLeave={() => setShowPw(false)}
                        className="p-1 text-gray-300 hover:text-sky-400 touch-none transition-colors">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </LightInput>

                  {error && <ErrLine msg={error} />}
                  <LightButton type="submit" loading={loading} variant="primary" disabled={!password || loading}>
                    ログイン
                  </LightButton>
                  <button type="button" onClick={() => { setStep(0); setError(''); setPassword(''); }}
                    className="w-full text-xs text-gray-400 hover:text-sky-500 transition-colors text-center">
                    ← 戻る
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Passkey global login */}
            {step === 0 && window.PublicKeyCredential && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={handlePasskey} disabled={passkeyLoading}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-500 transition-all"
                style={{ border: '1px solid rgba(56,189,248,0.15)' }}>
                {passkeyLoading ? <div className="w-4 h-4 border border-sky-400/30 border-t-sky-400 rounded-full animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                パスキーでログイン
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div key="reg-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RegisterSubForm onDone={handleRegisterDone} onBack={() => setMode('login')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}