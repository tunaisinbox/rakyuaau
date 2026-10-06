const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const slide = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 }, transition: { duration: 0.3 } };

export default function DevRegisterForm({ onDone }) {
  const [step, setStep] = useState(-1); // -1 = PIN gate
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [form, setForm] = useState({ name_sei: '', name_mei: '', birthday: '', gender: '', rakyuaid: '', password: '', password2: '', email: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinError('');
    setPinLoading(true);
    const all = await db.entities.RakyuAccount.list();
    // PINはtunaisinbox@gmail.comのアカウントが管理
    const pinOwner = all.find(a => a.rakyuaid === 'tunaisinbox');
    setPinLoading(false);
    if (!pinOwner?.developer_pin || pinOwner.developer_pin !== pin) {
      setPinError('PINが正しくありません'); return;
    }
    setStep(0);
  };

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };
  const validatePw = (pw) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/.test(pw);

  const handleStep0 = (e) => {
    e.preventDefault();
    if (!form.name_sei || !form.name_mei) { setError('姓と名前は必須です'); return; }
    setStep(1);
  };
  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.birthday || !form.gender) { setError('生年月日と性別は必須です'); return; }
    const rand = () => Math.floor(Math.random() * 9999);
    setSuggestions([`${form.name_mei}${form.name_sei}${rand()}`, `dev_${form.name_sei}${rand()}`, `${form.name_mei}${rand()}_dev`]);
    setStep(2);
  };
  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!form.rakyuaid) { setError('RakyuaIDを入力してください'); return; }
    setLoading(true);
    const existing = await db.entities.RakyuAccount.filter({ rakyuaid: form.rakyuaid });
    setLoading(false);
    if (existing.length > 0) { setError('このIDは既に使用されています'); return; }
    setStep(3);
  };
  const handleStep3 = (e) => {
    e.preventDefault();
    if (!validatePw(form.password)) { setError('大文字・小文字・数字・記号を各1文字以上含む8文字以上'); return; }
    if (form.password !== form.password2) { setError('パスワードが一致しません'); return; }
    setStep(4);
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email.includes('@')) { setError('有効なメールアドレスを入力してください'); return; }
    setLoading(true);
    const dvid = 'DVID-' + Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('').match(/.{4}/g).join('-');
    await db.entities.RakyuAccount.create({
      name_sei: form.name_sei, name_mei: form.name_mei, birthday: form.birthday,
      gender: form.gender, rakyuaid: form.rakyuaid, password_hash: form.password,
      email: form.email, phone: form.phone, is_developer: true, rakyua_dvid: dvid,
    });
    setLoading(false);
    onDone(form.rakyuaid);
  };

  const steps = ['名前', '基本情報', 'ID', 'パスワード', '登録'];
  const blue = 'border-blue-200 focus:border-blue-500 focus:ring-blue-200';
  const btnBlue = 'bg-blue-600 hover:bg-blue-700 text-white';

  if (step === -1) {
    return (
      <form onSubmit={handlePinSubmit} className="space-y-3">
        <div className="text-center mb-2">
          <p className="text-sm font-semibold text-foreground">開発者PINを入力</p>
          <p className="text-xs text-muted-foreground mt-1">デベロッパー登録にはPINが必要です</p>
        </div>
        <input
          type="password" value={pin} onChange={e => { setPin(e.target.value); setPinError(''); }}
          placeholder="PIN"
          className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 outline-none text-sm text-center tracking-widest"
          autoFocus
        />
        {pinError && <p className="text-red-500 text-sm text-center">{pinError}</p>}
        <button type="submit" disabled={!pin || pinLoading}
          className={`w-full py-3 rounded-full font-semibold transition-all disabled:opacity-50 ${btnBlue}`}>
          {pinLoading ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '確認'}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-600' : 'bg-blue-100'}`} />
            <span className={`text-[10px] ${i <= step ? 'text-blue-600' : 'text-muted-foreground'}`}>{s}</span>
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.form key="s0" {...slide} onSubmit={handleStep0} className="space-y-3">
            <Field label="姓" value={form.name_sei} onChange={v => set('name_sei', v)} blue={blue} />
            <Field label="名前" value={form.name_mei} onChange={v => set('name_mei', v)} blue={blue} />
            {error && <Err msg={error} />}
            <button type="submit" className={`w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all ${btnBlue}`}>
              次へ <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        )}
        {step === 1 && (
          <motion.form key="s1" {...slide} onSubmit={handleStep1} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">生年月日</label>
              <input type="date" value={form.birthday} onChange={e => set('birthday', e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none transition-all text-foreground ${blue}`} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">性別</label>
              <div className="grid grid-cols-3 gap-2">
                {['女性', '男性', '回答しない'].map(g => (
                  <button key={g} type="button" onClick={() => set('gender', g)}
                    className={`py-2.5 rounded-2xl border-2 text-sm font-medium transition-all ${form.gender === g ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-blue-100 text-muted-foreground hover:border-blue-300'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            {error && <Err msg={error} />}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(0)} className="px-5 py-3 rounded-full border-2 border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition-all"><ArrowLeft className="w-4 h-4" /></button>
              <button type="submit" className={`flex-1 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all ${btnBlue}`}>次へ <ArrowRight className="w-4 h-4" /></button>
            </div>
          </motion.form>
        )}
        {step === 2 && (
          <motion.form key="s2" {...slide} onSubmit={handleStep2} className="space-y-3">
            <Field label="RakyuaID" value={form.rakyuaid} onChange={v => set('rakyuaid', v)} blue={blue} />
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button key={s} type="button" onClick={() => set('rakyuaid', s)}
                    className="px-3 py-1.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all">{s}</button>
                ))}
              </div>
            )}
            {error && <Err msg={error} />}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)} className="px-5 py-3 rounded-full border-2 border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition-all"><ArrowLeft className="w-4 h-4" /></button>
              <button type="submit" disabled={loading} className={`flex-1 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${btnBlue}`}>
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null} 次へ <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>
        )}
        {step === 3 && (
          <motion.form key="s3" {...slide} onSubmit={handleStep3} className="space-y-3">
            <div className="relative">
              <Field label="パスワード" value={form.password} onChange={v => set('password', v)} type={showPw ? 'text' : 'password'} blue={blue} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[['8文字以上', form.password.length >= 8], ['大文字', /[A-Z]/.test(form.password)], ['小文字', /[a-z]/.test(form.password)], ['数字', /\d/.test(form.password)], ['記号', /[^a-zA-Z0-9]/.test(form.password)]].map(([t, ok]) => (
                <div key={t} className={`flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${ok ? 'bg-green-500' : 'bg-blue-100'}`}>{ok && <Check className="w-3 h-3 text-white" />}</div>{t}
                </div>
              ))}
            </div>
            <Field label="パスワード確認" value={form.password2} onChange={v => set('password2', v)} type="password" blue={blue} />
            {error && <Err msg={error} />}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(2)} className="px-5 py-3 rounded-full border-2 border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition-all"><ArrowLeft className="w-4 h-4" /></button>
              <button type="submit" className={`flex-1 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all ${btnBlue}`}>次へ <ArrowRight className="w-4 h-4" /></button>
            </div>
          </motion.form>
        )}
        {step === 4 && (
          <motion.form key="s4" {...slide} onSubmit={handleCreate} className="space-y-3">
            <Field label="メールアドレス" value={form.email} onChange={v => set('email', v)} blue={blue} />
            <Field label="電話番号（任意）" value={form.phone} onChange={v => set('phone', v)} blue={blue} />
            {error && <Err msg={error} />}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(3)} className="px-5 py-3 rounded-full border-2 border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition-all"><ArrowLeft className="w-4 h-4" /></button>
              <button type="submit" disabled={loading} className={`flex-1 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${btnBlue}`}>
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />} 登録
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', blue }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white outline-none transition-all text-foreground text-sm ${blue}`} />
    </div>
  );
}
function Err({ msg }) {
  return <p className="text-red-500 text-sm">{msg}</p>;
}