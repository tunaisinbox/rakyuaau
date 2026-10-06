const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowRight, ArrowLeft, Check } from 'lucide-react';

import Spinner from './Spinner';
import FloatingInput from './FloatingInput';
import RobotVerification from './RobotVerification';
import LoadingBar from './LoadingBar';

const slide = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 }, transition: { duration: 0.3 } };

const TERMS = `この利用規約（以下「本規約」）は、Rakyuaサービスの利用に関する条件を定めるものです。\n\n1. サービスの利用\nユーザーは本サービスを適切に利用するものとします。\n\n2. アカウント\nユーザーは正確な情報を提供し、アカウントの安全性を維持する責任があります。\n\n3. 禁止事項\n不正アクセス、スパム行為、その他違法行為は禁止されています。`;
const PRIVACY = `プライバシーポリシー\n\n1. 個人情報の収集\n当サービスは、氏名、メールアドレス、電話番号等の個人情報を収集します。\n\n2. 利用目的\n収集した情報はサービス提供・改善のために利用します。\n\n3. 第三者提供\n法令に基づく場合を除き、個人情報を第三者に提供することはありません。`;

export default function RegisterForm({ onSwitch }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name_sei: '', name_mei: '', birthday: '', gender: '', rakyuaid: '', password: '', password2: '', email: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [robotVerified, setRobotVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(null);
  const [done, setDone] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleStep0 = (e) => {
    e.preventDefault();
    if (!form.name_sei || !form.name_mei) { setError('姓と名前は必須です'); return; }
    setStep(1);
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.birthday || !form.gender) { setError('生年月日と性別は必須です'); return; }
    const rand = () => Math.floor(Math.random() * 9999);
    setSuggestions([
      `${form.name_mei}${form.name_sei}${rand()}`,
      `${form.name_sei}_${form.name_mei}${rand()}`,
      `${form.name_mei}${rand()}`
    ]);
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

  const validatePw = (pw) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(pw);

  const handleStep3 = (e) => {
    e.preventDefault();
    if (!validatePw(form.password)) { setError('大文字・小文字・数字・記号を各1文字以上含む8文字以上'); return; }
    if (form.password !== form.password2) { setError('パスワードが一致しません'); return; }
    setStep(4);
  };

  const handleSendCode = async () => {
    if (!form.email.includes('@') || !form.email.includes('.')) { setError('有効なメールアドレスを入力してください'); return; }
    if (!/^\d{10,11}$/.test(form.phone.replace(/-/g, ''))) { setError('電話番号は10〜11桁の数字で入力してください'); return; }
    setLoading(true);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(code);
    await db.integrations.Core.SendEmail({
      to: form.email,
      subject: '【Rakyua】メールアドレス確認コード',
      body: `認証コード: ${code}\n\nこのコードは登録確認のために使用します。身に覚えのない場合は無視してください。`,
    });
    setLoading(false);
    setCodeSent(true);
  };

  const handleVerifyCode = () => {
    if (verificationCode !== sentCode) { setError('認証コードが間違っています'); return; }
    setStep(5);
  };

  const handleCreate = async () => {
    if (!agreeTerms || !agreePrivacy) { setError('利用規約とプライバシーポリシーに同意してください'); return; }
    setLoading(true);
    await db.entities.RakyuAccount.create({
      name_sei: form.name_sei, name_mei: form.name_mei, birthday: form.birthday,
      gender: form.gender, rakyuaid: form.rakyuaid, password_hash: form.password,
      email: form.email, phone: form.phone
    });
    db.integrations.Core.SendEmail({
      to: 'rakyua.official@gmail.com',
      subject: `【Rakyua】新規登録: ${form.name_sei} ${form.name_mei}`,
      body: `新しいアカウントが作成されました。\n\n姓名: ${form.name_sei} ${form.name_mei}\nRakyuaID: ${form.rakyuaid}\n生年月日: ${form.birthday}\n性別: ${form.gender}\nメール: ${form.email}\n電話: ${form.phone}\n登録日時: ${new Date().toLocaleString('ja-JP')}`,
    });
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-pink-100 flex items-center justify-center">
          <Check className="w-10 h-10 text-pink-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-2">アカウント作成完了！</h2>
        <p className="text-muted-foreground mb-6">{form.name_sei} {form.name_mei}さん、ようこそ</p>
        <button onClick={onSwitch} className="px-8 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-all">
          ログインへ
        </button>
      </motion.div>
    );
  }

  const steps = ['名前', '基本情報', 'ID', 'パスワード', '認証', '同意'];

  return (
    <>
      <LoadingBar visible={loading} />
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">アカウント作成</h1>
          <div className="flex gap-1.5 mt-3">
            {steps.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${i <= step ? 'bg-pink-500' : 'bg-pink-100'}`} />
                <span className={`text-[10px] ${i <= step ? 'text-pink-500' : 'text-muted-foreground'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.form key="s0" {...slide} onSubmit={handleStep0} className="space-y-4">
              <Input label="姓" value={form.name_sei} onChange={v => set('name_sei', v)} placeholder="例: 田中" required />
              <Input label="名前" value={form.name_mei} onChange={v => set('name_mei', v)} placeholder="例: 太郎" required />
              {error && <Err msg={error} />}
              <Btns loading={loading} onBack={null} />
              <SwitchLink onSwitch={onSwitch} />
            </motion.form>
          )}
          {step === 1 && (
            <motion.form key="s1" {...slide} onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">生年月日</label>
                <input type="date" value={form.birthday} onChange={e => set('birthday', e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-foreground" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">性別</label>
                <div className="grid grid-cols-3 gap-2">
                  {['女性', '男性', '回答しない'].map(g => (
                    <button key={g} type="button" onClick={() => set('gender', g)}
                      className={`py-2.5 rounded-2xl border-2 text-sm font-medium transition-all ${form.gender === g ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-pink-200 text-muted-foreground hover:border-pink-300'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              {error && <Err msg={error} />}
              <Btns loading={loading} onBack={() => setStep(0)} />
            </motion.form>
          )}
          {step === 2 && (
            <motion.form key="s2" {...slide} onSubmit={handleStep2} className="space-y-4">
              <Input label="RakyuaID" value={form.rakyuaid} onChange={v => set('rakyuaid', v)} placeholder="IDを入力" required />
              {suggestions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">おすすめID:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(s => (
                      <button key={s} type="button" onClick={() => set('rakyuaid', s)}
                        className="px-3 py-1.5 rounded-full text-xs bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100 transition-all">{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {error && <Err msg={error} />}
              <Btns loading={loading} onBack={() => setStep(1)} />
            </motion.form>
          )}
          {step === 3 && (
            <motion.form key="s3" {...slide} onSubmit={handleStep3} className="space-y-4">
              <PwInput label="パスワード" value={form.password} onChange={v => set('password', v)} show={showPw} onToggle={setShowPw} />
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[['8文字以上', form.password.length >= 8], ['大文字', /[A-Z]/.test(form.password)], ['小文字', /[a-z]/.test(form.password)], ['数字', /\d/.test(form.password)], ['記号', /[^a-zA-Z0-9]/.test(form.password)]].map(([t, ok]) => (
                  <div key={t} className={`flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${ok ? 'bg-green-500' : 'bg-pink-100'}`}>
                      {ok && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {t}
                  </div>
                ))}
              </div>
              <PwInput label="パスワード確認" value={form.password2} onChange={v => set('password2', v)} show={showPw2} onToggle={setShowPw2} />
              {error && <Err msg={error} />}
              <Btns loading={loading} onBack={() => setStep(2)} />
            </motion.form>
          )}
          {step === 4 && (
            <motion.div key="s4" {...slide} className="space-y-4">
              <RobotVerification onVerified={() => setRobotVerified(true)} />
              {robotVerified && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <Input label="メールアドレス" value={form.email} onChange={v => set('email', v)} placeholder="example@mail.com" />
                  <Input label="電話番号" value={form.phone} onChange={v => set('phone', v)} placeholder="09012345678" />
                  {!codeSent ? (
                    <button onClick={handleSendCode} disabled={loading}
                      className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                      {loading && <Spinner />} 認証コードを送信
                    </button>
                  ) : (
                    <>
                      <Input label="認証コード" value={verificationCode} onChange={setVerificationCode} placeholder="6桁のコード" />
                      <button onClick={handleVerifyCode} disabled={loading}
                        className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                        {loading && <Spinner />} 確認
                      </button>
                    </>
                  )}
                  {error && <Err msg={error} />}
                </motion.div>
              )}
              <button onClick={() => setStep(3)} className="text-sm text-pink-500 hover:underline flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> 戻る
              </button>
            </motion.div>
          )}
          {step === 5 && (
            <motion.div key="s5" {...slide} className="space-y-4">
              {[['利用規約', agreeTerms, setAgreeTerms, TERMS], ['プライバシーポリシー', agreePrivacy, setAgreePrivacy, PRIVACY]].map(([title, agreed, setAgreed, content]) => (
                <div key={title} className="rounded-2xl border-2 border-pink-200 overflow-hidden">
                  <button onClick={() => setShowTerms(showTerms === title ? null : title)}
                    className="w-full flex items-center justify-between p-3 text-sm font-medium text-foreground hover:bg-pink-50 transition-all">
                    {title} <ArrowRight className={`w-4 h-4 transition-transform ${showTerms === title ? 'rotate-90' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showTerms === title && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-3 text-xs text-muted-foreground whitespace-pre-line max-h-32 overflow-y-auto border-t border-pink-100">{content}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="px-3 py-2 border-t border-pink-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => setAgreed(!agreed)}
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${agreed ? 'bg-pink-500 border-pink-500' : 'border-pink-300'}`}>
                        {agreed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm text-foreground">同意する</span>
                    </label>
                  </div>
                </div>
              ))}
              {error && <Err msg={error} />}
              <button onClick={handleCreate} disabled={loading || !agreeTerms || !agreePrivacy}
                className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                {loading && <Spinner />} アカウントを作成
              </button>
              <button onClick={() => setStep(4)} className="text-sm text-pink-500 hover:underline flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> 戻る
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function Input({ label, value, onChange, required, type = 'text' }) {
  return <FloatingInput label={label} value={value} onChange={onChange} required={required} type={type} />;
}

function PwInput({ label, value, onChange, show, onToggle }) {
  return (
    <FloatingInput label={label} value={value} onChange={onChange} type={show ? 'text' : 'password'}>
      <button type="button" onPointerDown={() => onToggle(true)} onPointerUp={() => onToggle(false)} onPointerLeave={() => onToggle(false)}
        className="p-1.5 text-muted-foreground hover:text-pink-500 transition-colors touch-none">
        <Eye className="w-5 h-5" />
      </button>
    </FloatingInput>
  );
}

function Btns({ loading, onBack }) {
  return (
    <div className="flex gap-3">
      {onBack && (
        <button type="button" onClick={onBack} className="px-6 py-3 rounded-full border-2 border-pink-200 text-pink-500 font-semibold hover:bg-pink-50 transition-all flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>
      )}
      <button type="submit" disabled={loading}
        className="flex-1 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
        {loading && <Spinner />} 次へ <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function Err({ msg }) {
  return <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-destructive text-sm">{msg}</motion.p>;
}

function SwitchLink({ onSwitch }) {
  return (
    <p className="text-sm text-center text-muted-foreground">
      既にアカウントをお持ちの方は <button type="button" onClick={onSwitch} className="text-pink-500 hover:underline font-medium">ログイン</button>
    </p>
  );
}