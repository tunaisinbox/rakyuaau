const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowRight, X, Fingerprint, Plus, Check } from 'lucide-react';

import Spinner from './Spinner';
import FloatingInput from './FloatingInput';
import RobotVerification from './RobotVerification';
import LoadingBar from './LoadingBar';
import PasskeyButton, { authenticatePasskey, registerPasskey } from './PasskeyButton';

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.3 }
};

// Detect device name automatically
function getDeviceName() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android';
  if (/Mac/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows PC';
  return 'このデバイス';
}

export default function LoginForm({ onSwitch, onResetPassword }) {
  const [step, setStep] = useState(0); // 0=id, 1=password, 2=2fa
  const [rakyuaid, setRakyuaid] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // 2FA
  const [twoFaCode, setTwoFaCode] = useState('');
  const [sentTwoFaCode, setSentTwoFaCode] = useState('');
  const [twoFaError, setTwoFaError] = useState('');
  const [twoFaSending, setTwoFaSending] = useState(false);
  // passkey prompt after login
  const [passkeyPrompt, setPasskeyPrompt] = useState(false);
  const [passkeyRegistering, setPasskeyRegistering] = useState(false);
  const [passkeyDone, setPasskeyDone] = useState(false);
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  const navigate = useNavigate();

  // Robot state
  const [totalFails, setTotalFails] = useState(0);       // total password fails
  const [robotShown, setRobotShown] = useState(false);   // robot visible?
  const [robotVerified, setRobotVerified] = useState(false);
  const [robotDropKey, setRobotDropKey] = useState(0);   // re-mount = new drop animation
  const [robotFails, setRobotFails] = useState(0);       // fails after robot shown
  const [robotLocked, setRobotLocked] = useState(false);
  const [lockEnd, setLockEnd] = useState(null);
  const [lockLeft, setLockLeft] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);           // shake wrong pw field

  // Countdown
  useEffect(() => {
    if (!lockEnd) return;
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil((lockEnd - Date.now()) / 1000));
      setLockLeft(left);
      if (left <= 0) {
        setRobotLocked(false);
        setLockEnd(null);
        setRobotFails(0);
        setRobotDropKey(k => k + 1);
      }
    }, 500);
    return () => clearInterval(t);
  }, [lockEnd]);

  const handleIdSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const accounts = await db.entities.RakyuAccount.filter({ rakyuaid });
    setLoading(false);
    if (accounts.length === 0) { setError('このRakyuaIDは登録されていません'); return; }
    setAccount(accounts[0]);
    setStep(1);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (robotShown && !robotVerified) return;
    if (robotLocked) return;
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));

    if (password !== account.password_hash) {
      setLoading(false);
      const newTotal = totalFails + 1;
      setTotalFails(newTotal);
      setShakeKey(k => k + 1);
      setError('パスワードが間違っています');
      setPassword('');

      if (newTotal >= 3) {
        // robot is shown; if already shown and verified, increment robotFails
        if (!robotShown) {
          setRobotShown(true);
          setRobotDropKey(k => k + 1);
          setRobotVerified(false);
        } else {
          // robot was shown; reset it
          const newRF = robotFails + 1;
          setRobotFails(newRF);
          setRobotVerified(false);
          if (newRF >= 3) {
            // lock
            setRobotLocked(true);
            setLockEnd(Date.now() + 300000);
            setLockLeft(300);
          } else {
            // drop new robot
            setRobotDropKey(k => k + 1);
          }
        }
      }
      return;
    }

    setLoading(false);
    // If account has email → send 2FA code
    if (account.email) {
      setTwoFaSending(true);
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setSentTwoFaCode(code);
      try {
        await db.integrations.Core.SendEmail({
          to: account.email.trim(),
          from_name: 'Rakyua',
          subject: '【Rakyua】ログイン認証コード',
          body: `Rakyuaログインの認証コードは「${code}」です。\n\nこのコードは5分間有効です。身に覚えのない場合は無視してください。`,
        });
        setStep(2);
      } catch {
        setError('認証メールの送信に失敗しました。時間をおいてもう一度お試しください。');
      }
      setTwoFaSending(false);
    } else {
      recordLoginAndFinish(account);
    }
  };

  const goToMyPage = () => navigate('/mypage');

  const finalizeLogin = (acc) => {
    sessionStorage.setItem('rakyua_account_id', acc.id);
    const saved = JSON.parse(sessionStorage.getItem('rakyua_saved_accounts') || '[]');
    if (!saved.includes(acc.id)) sessionStorage.setItem('rakyua_saved_accounts', JSON.stringify([...saved, acc.id]));
    // Check if passkeys registered
    const creds = (() => { try { return JSON.parse(acc.passkey_credentials || '[]'); } catch { return []; } })();
    if (creds.length === 0 && window.PublicKeyCredential) {
      setLoggedInAccount(acc);
      setPasskeyPrompt(true);
    } else {
      navigate('/mypage');
    }
  };

  const loginWithAccount = finalizeLogin;

  const recordLoginAndFinish = (acc) => {
    const ua = navigator.userAgent;
    const device = /Mobile|Android|iPhone|iPad/.test(ua)
      ? `モバイル (${/iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : 'Android'})`
      : `デスクトップ (${/Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'ブラウザ'})`;
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(geo => db.entities.LoginHistory.create({
        rakyua_account_id: acc.id,
        login_date: new Date().toISOString(),
        device,
        location: geo.city ? `${geo.city}, ${geo.country_name}` : '不明',
        ip: geo.ip || '不明',
      }))
      .catch(() => db.entities.LoginHistory.create({
        rakyua_account_id: acc.id,
        login_date: new Date().toISOString(),
        device,
        location: '取得できませんでした',
        ip: '不明',
      }));
    finalizeLogin(acc);
  };

  const handle2FaSubmit = (e) => {
    e.preventDefault();
    if (twoFaCode !== sentTwoFaCode) { setTwoFaError('コードが間違っています'); return; }
    recordLoginAndFinish(account);
  };

  const handlePasskeyLogin = async (assertion) => {
    // Find account matching the passkey credential
    const all = await db.entities.RakyuAccount.list();
    const found = all.find(a => {
      try {
        const creds = JSON.parse(a.passkey_credentials || '[]');
        return creds.some(c => c.id === assertion.id);
      } catch { return false; }
    });
    if (!found) { setError('このパスキーに紐づくアカウントが見つかりません'); return; }
    loginWithAccount(found);
  };

  return (
    <>
      <LoadingBar visible={loading} />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ログイン</h1>
          <p className="text-muted-foreground text-sm mt-1">RakyuaIDでログインしてください</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.form key="id" {...slide} onSubmit={handleIdSubmit} className="space-y-5">
              <div>
                <FloatingInput label="RakyuaID" value={rakyuaid} onChange={v => { setRakyuaid(v); setError(''); }} required />
                {error && <ErrMsg msg={error} />}
              </div>
              <button type="submit" disabled={loading || !rakyuaid}
                className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                {loading ? <Spinner /> : null} 次へ <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-sm text-center text-muted-foreground">
                アカウントをお持ちでない方は <button type="button" onClick={onSwitch} className="text-pink-500 hover:underline font-medium">新規登録</button>
              </p>
            </motion.form>
          )}

          {step === 1 && (
            <motion.form key="pw" {...slide} onSubmit={handlePasswordSubmit} className="space-y-5">
              {/* Account badge */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 border border-pink-200">
                <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-bold text-sm flex-shrink-0 overflow-hidden">
                  {account?.avatar_url ? <img src={account.avatar_url} alt="" className="w-full h-full object-cover" /> : account?.name_sei?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm">おかえりなさい、{account?.name_mei}さん</p>
                  <p className="text-xs text-muted-foreground truncate">{account?.rakyuaid}</p>
                </div>
              </motion.div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">パスワード</label>
                <motion.div key={shakeKey}
                  animate={shakeKey > 0 ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <FloatingInput
                    label="パスワード"
                    value={password}
                    onChange={v => { setPassword(v); setError(''); }}
                    type={showPw ? 'text' : 'password'}
                    required
                  >
                    <div className="flex items-center gap-0.5">
                      {/* Passkey button — shown if account has passkeys */}
                      {(() => {
                        const creds = (() => { try { return JSON.parse(account?.passkey_credentials || '[]'); } catch { return []; } })();
                        if (creds.length === 0 || !window.PublicKeyCredential) return null;
                        return (
                          <PasskeyButton
                            iconOnly
                            onSuccess={async (assertion) => {
                              const match = creds.find(c => c.id === assertion.id);
                              if (!match) { setError('パスキーが一致しません'); return; }
                              recordLoginAndFinish(account);
                            }}
                            onError={() => setError('パスキー認証に失敗しました')}
                          />
                        );
                      })()}
                      <button type="button"
                        onPointerDown={() => setShowPw(true)}
                        onPointerUp={() => setShowPw(false)}
                        onPointerLeave={() => setShowPw(false)}
                        className="p-1.5 text-muted-foreground hover:text-pink-500 transition-colors touch-none">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </FloatingInput>
                </motion.div>
                {error && <ErrMsg msg={error} />}
              </div>

              {/* Robot verification — appears after 3 fails */}
              <AnimatePresence>
                {robotShown && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <RobotVerification
                      dropKey={robotDropKey}
                      locked={robotLocked}
                      lockSecondsLeft={lockLeft}
                      onVerified={() => setRobotVerified(true)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading || twoFaSending || !password || (robotShown && !robotVerified) || robotLocked}
                className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {loading ? <Spinner /> : null} ログイン
              </button>

              {/* 2FAメール送信ステータス */}
              {twoFaSending && (
                <p className="text-xs text-center text-pink-500 animate-pulse">認証コードを送信中… まもなくメールが届きます</p>
              )}

              {/* Bottom links */}
              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => { setStep(0); setError(''); setTotalFails(0); setRobotShown(false); setRobotVerified(false); setRobotLocked(false); setLockEnd(null); }}
                  className="text-pink-500 hover:underline">戻る</button>
                <button type="button" onClick={onResetPassword} className="text-pink-500 hover:underline">
                  パスワードをお忘れですか？
                </button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form key="2fa" {...slide} onSubmit={handle2FaSubmit} className="space-y-5">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-50 flex items-center justify-center">
                  <span className="text-2xl">✉️</span>
                </div>
                <p className="font-semibold text-foreground">2段階認証</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{account?.email?.replace(/(.{2}).+(@.+)/, '$1***$2')}</span> に送信した6桁のコードを入力してください
                </p>
              </motion.div>
              <FloatingInput
                label="認証コード"
                value={twoFaCode}
                onChange={v => { setTwoFaCode(v); setTwoFaError(''); }}
                required
              />
              {twoFaError && <ErrMsg msg={twoFaError} />}
              <button type="submit" disabled={twoFaCode.length < 6}
                className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                確認
              </button>
              <div className="text-center">
                <button type="button" onClick={async () => {
                  setTwoFaSending(true);
                  setTwoFaError('');
                  const code = String(Math.floor(100000 + Math.random() * 900000));
                  setSentTwoFaCode(code);
                  try {
                    await db.integrations.Core.SendEmail({
                      to: account.email.trim(),
                      from_name: 'Rakyua',
                      subject: '【Rakyua】ログイン認証コード',
                      body: `Rakyuaログインの認証コードは「${code}」です。\n\nこのコードは5分間有効です。`,
                    });
                  } catch {
                    setTwoFaError('認証メールの送信に失敗しました。迷惑メールフォルダもご確認ください。');
                  }
                  setTwoFaSending(false);
                }} disabled={twoFaSending} className="text-xs text-pink-500 hover:underline disabled:opacity-50">
                  {twoFaSending ? 'コードを再送中...' : 'コードを再送する'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Passkey registration prompt after login */}
        <AnimatePresence>
          {passkeyPrompt && (
            <motion.div
              key="passkey-prompt"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4 relative"
              >
                {/* Tiny close × */}
                {!passkeyDone && (
                  <button
                    onClick={() => { setPasskeyPrompt(false); goToMyPage(); }}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                    style={{ fontSize: '8px', lineHeight: 1, padding: '3px' }}
                    title="スキップ"
                  >
                    ✕
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                    <Fingerprint className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">パスキーを追加してみましょう。</p>
                    <p className="text-xs text-muted-foreground mt-0.5">指紋・顔認証で次回からすぐログインできます</p>
                  </div>
                </div>

                {!passkeyDone ? (
                  <button
                    onClick={async () => {
                      setPasskeyRegistering(true);
                      try {
                        const cred = await registerPasskey(loggedInAccount.rakyuaid, loggedInAccount.id);
                        const existing = (() => { try { return JSON.parse(loggedInAccount.passkey_credentials || '[]'); } catch { return []; } })();
                        const deviceName = getDeviceName();
                        const updated = [...existing, { ...cred, name: deviceName, registeredAt: new Date().toISOString() }];
                        await db.entities.RakyuAccount.update(loggedInAccount.id, { passkey_credentials: JSON.stringify(updated) });
                        setPasskeyDone(true);
                        setTimeout(() => { setPasskeyPrompt(false); goToMyPage(); }, 1200);
                      } catch {
                        setPasskeyPrompt(false);
                        goToMyPage();
                      } finally {
                        setPasskeyRegistering(false);
                      }
                    }}
                    disabled={passkeyRegistering}
                    className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {passkeyRegistering
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Plus className="w-4 h-4" />}
                    パスキーを追加する
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-2 py-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-foreground">パスキーを登録しました！</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function ErrMsg({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 mt-2"
    >
      <X className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
      <p className="text-destructive text-sm">{msg}</p>
    </motion.div>
  );
}