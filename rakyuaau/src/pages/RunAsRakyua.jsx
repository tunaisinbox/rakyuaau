const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, Lock, Plus, ChevronDown } from 'lucide-react';

import LoadingScreen from '../components/run/LoadingScreen';
import ShibuyaScene from '../components/run/ShibuyaScene';
import { RAKYUA_SERVICES } from '../data/rakyuaServices';
import RunLoginForm from '../components/run/RunLoginForm';

const SCOPE_LABELS = {
  profile_read: { label: 'プロフィール情報の閲覧', icon: '👤' },
  email_read: { label: 'メールアドレスの閲覧', icon: '📧' },
  phone_read: { label: '電話番号の閲覧', icon: '📱' },
  account_manage: { label: 'アカウント情報の変更', icon: '⚙️' },
};

function AppIcon({ url, appName }) {
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (!url) return;
    try { setSrc(`${new URL(url).origin}/favicon.ico`); } catch { setErr(true); }
  }, [url]);
  if (!src || err) return <span className="text-sky-500 font-bold text-xl">{appName?.[0]?.toUpperCase()}</span>;
  return <img src={src} alt={appName} className="w-full h-full object-contain p-2" onError={() => setErr(true)} />;
}

function NotFoundScreen({ appName }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, #87CEEB, #E0F4FF)' }}>
      <h1 className="text-6xl font-bold text-sky-200">404</h1>
      <p className="text-gray-500 mt-4"><span className="text-sky-500 font-bold">{appName}</span> は登録されていないサービスです</p>
      <button onClick={() => window.history.back()} className="mt-6 px-8 py-3 rounded-full bg-sky-400 text-white font-semibold hover:bg-sky-500 transition-colors">戻る</button>
    </div>
  );
}

export default function RunAsRakyua() {
  const [showLoader, setShowLoader] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [apiInfo, setApiInfo] = useState(null);
  const [apiNotFound, setApiNotFound] = useState(false);
  const [ads, setAds] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showServiceInfo, setShowServiceInfo] = useState(false);
  const [showAccountList, setShowAccountList] = useState(false);
  const [approving, setApproving] = useState(false);
  const [ripples, setRipples] = useState([]);

  const params = new URLSearchParams(window.location.search);
  const appName = params.get('app');
  const callbackUrl = params.get('callback') || null;
  const rawScopes = params.get('scopes') || '';
  const requestedScopes = rawScopes ? rawScopes.split(',').map(s => s.trim()).filter(Boolean) : ['profile_read'];

  useEffect(() => {
    const mainId = sessionStorage.getItem('rakyua_account_id');
    const savedIds = JSON.parse(sessionStorage.getItem('rakyua_saved_accounts') || '[]');
    const ids = [...new Set([mainId, ...savedIds].filter(Boolean))];
    const loadAll = async () => {
      const all = await db.entities.RakyuAccount.list();
      if (ids.length > 0) {
        const seen = new Set();
        const found = ids.map(id => all.find(a => a.id === id)).filter(a => a && !seen.has(a.id) && seen.add(a.id));
        setSavedAccounts(found);
        if (mainId) setCurrentAccount(found.find(a => a.id === mainId) || found[0]);
      }
      if (appName) {
        const apis = await db.entities.RakyuApi.filter({ service_name: appName, is_active: true });
        if (apis.length > 0) setApiInfo(apis[0]);
        else {
          const builtin = RAKYUA_SERVICES.find(s => s.name.toLowerCase() === appName.toLowerCase());
          if (builtin) setApiInfo({ service_name: builtin.name, api_name: builtin.name, company_name: builtin.company, forward_url: (callbackUrl && callbackUrl !== 'URL') ? callbackUrl : `${window.location.origin}/${builtin.name}/site` });
          else setApiNotFound(true);
        }
      }
      const allApis = await db.entities.RakyuApi.filter({ is_active: true });
      setAds(allApis);
      setDataReady(true);
    };
    loadAll();
  }, []);

  const handleAllow = async () => {
    setApproving(true);
    if (apiInfo && currentAccount) {
      const apiKey = `rk_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      try {
        await db.entities.ApiKey.create({
          rakyua_account_id: currentAccount.id,
          key_name: apiInfo.service_name,
          api_key: apiKey,
        });
      } catch (e) { /* key may already exist */ }
      if (apiInfo.forward_url) {
        const u = new URL(apiInfo.forward_url);
        u.searchParams.set('status', 'allowed');
        u.searchParams.set('rakyuaid', currentAccount.rakyuaid);
        u.searchParams.set('account_id', currentAccount.id);
        window.location.href = u.toString();
        return;
      }
    }
    if (callbackUrl && callbackUrl !== 'URL') {
      const u = new URL(callbackUrl);
      u.searchParams.set('status', 'allowed');
      u.searchParams.set('rakyuaid', currentAccount.rakyuaid);
      u.searchParams.set('account_id', currentAccount.id);
      window.location.href = u.toString();
      return;
    }
    setApproving(false);
  };

  const handleCancel = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  };

  const handleLoggedIn = (acc) => {
    sessionStorage.setItem('rakyua_account_id', acc.id);
    const saved = JSON.parse(sessionStorage.getItem('rakyua_saved_accounts') || '[]');
    if (!saved.includes(acc.id)) sessionStorage.setItem('rakyua_saved_accounts', JSON.stringify([...saved, acc.id]));
    setSavedAccounts(prev => prev.find(a => a.id === acc.id) ? prev : [...prev, acc]);
    setCurrentAccount(acc);
    setShowLoginForm(false);
  };

  const handleClick = useCallback((e) => {
    if (e.target.closest('button, input, a, form, [role="dialog"]')) return;
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { x: e.clientX, y: e.clientY, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
  }, []);

  if (!appName) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-400 text-sm font-mono">/run?app=NAME&callback=URL&scopes=...</p>
    </div>
  );

  if (showLoader) return <LoadingScreen ready={dataReady} onDone={() => setShowLoader(false)} />;
  if (apiNotFound) return <NotFoundScreen appName={appName} />;

  const otherAccounts = savedAccounts.filter(a => a.id !== currentAccount?.id);

  return (
    <div className="min-h-screen relative overflow-hidden" onClick={handleClick}>
      <ShibuyaScene ads={ads} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}>R</div>
          <span className="text-sky-500/60 text-xs font-mono tracking-widest">RAKYUA_ID</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-sky-400/40" />
          <span className="text-sky-400/40 text-xs font-mono">SECURE</span>
        </div>
      </div>

      {/* Main card */}
      <div className="relative z-10 flex items-center justify-center px-4 pb-8" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-3xl shadow-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(56,189,248,0.15)' }}>

          {/* App icon + service name + RakyuaID */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-sky-50 border border-sky-100 flex-shrink-0">
              <AppIcon url={apiInfo?.forward_url} appName={appName} />
            </div>
            <div className="flex-1 min-w-0">
              <button onClick={() => setShowServiceInfo(true)} className="text-sky-500 font-bold text-lg hover:underline flex items-center gap-1.5">
                {appName}
                <Info className="w-4 h-4 text-sky-300" />
              </button>
              {currentAccount && (
                <button onClick={() => setShowAccountList(!showAccountList)} className="text-gray-500 text-sm flex items-center gap-1 hover:text-sky-500">
                  @{currentAccount.rakyuaid}
                  {otherAccounts.length > 0 && <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>

          {/* Account switcher */}
          <AnimatePresence>
            {showAccountList && otherAccounts.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4 space-y-1">
                {otherAccounts.map(acc => (
                  <button key={acc.id} onClick={() => { setCurrentAccount(acc); sessionStorage.setItem('rakyua_account_id', acc.id); setShowAccountList(false); }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-sky-50 transition-colors text-left">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)' }}>
                      {acc.avatar_url ? <img src={acc.avatar_url} alt="" className="w-full h-full object-cover" /> : acc.name_sei?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-sm font-medium">{acc.name_sei}{acc.name_mei}</p>
                      <p className="text-gray-400 text-xs">@{acc.rakyuaid}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {currentAccount && !showLoginForm ? (
              <motion.div key="consent" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <p className="text-gray-600 text-sm mb-4">
                  <span className="font-semibold text-sky-600">{appName}</span> があなたのアカウント情報にアクセスしようとしています。
                </p>
                {/* Scopes */}
                <div className="space-y-2.5 mb-6">
                  {requestedScopes.map(s => {
                    const info = SCOPE_LABELS[s];
                    return (
                      <div key={s} className="flex items-center gap-2.5 text-gray-600 text-sm">
                        <span className="text-base">{info?.icon || '🔑'}</span>
                        <span className="flex-1">{info?.label || s}</span>
                        <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                          <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Buttons */}
                <div className="flex gap-3">
                  <button onClick={handleCancel} className="flex-1 py-3 rounded-full border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                    キャンセル
                  </button>
                  <button onClick={handleAllow} disabled={approving} className="flex-1 py-3 rounded-full bg-sky-400 text-white font-semibold hover:bg-sky-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {approving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    {approving ? '処理中...' : 'サービス利用の許可'}
                  </button>
                </div>
                {/* Add another account */}
                <button onClick={() => setShowLoginForm(true)} className="w-full flex items-center justify-center gap-1.5 text-sky-400 text-sm mt-5 hover:text-sky-500 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> 別のRakyuaIDを追加
                </button>
              </motion.div>
            ) : (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                {!currentAccount && (
                  <p className="text-gray-500 text-sm mb-4 text-center">このサービスを利用するにはログインが必要です</p>
                )}
                <RunLoginForm onLoggedIn={handleLoggedIn} />
                {currentAccount && (
                  <button onClick={() => setShowLoginForm(false)} className="w-full text-center text-gray-400 text-sm mt-4 hover:text-sky-500">
                    ← 戻る
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-sky-400/30" />
          <span className="text-sky-400/30 text-xs font-mono">END_TO_END_ENCRYPTED</span>
        </div>
      </div>

      {/* Service info popup */}
      <AnimatePresence>
        {showServiceInfo && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowServiceInfo(false)}>
            <motion.div className="rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4"
              style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)' }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-sky-50 border border-sky-100">
                  <AppIcon url={apiInfo?.forward_url} appName={appName} />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{appName}</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">会社名</span>
                  <span className="text-gray-800 font-medium">{apiInfo?.company_name || '未登録'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">メールアドレス</span>
                  <span className="text-gray-800 font-medium">{apiInfo?.contact_email || '未登録'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">API名</span>
                  <span className="text-gray-800 font-medium">{apiInfo?.api_name || '-'}</span>
                </div>
              </div>
              <button onClick={() => setShowServiceInfo(false)} className="w-full mt-5 py-2.5 rounded-full bg-sky-400 text-white font-semibold hover:bg-sky-500 transition-colors">
                閉じる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div key={r.id} className="absolute rounded-full pointer-events-none z-20"
            style={{ left: r.x, top: r.y, border: '2px solid rgba(56,189,248,0.6)', x: '-50%', y: '-50%' }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 80, height: 80, opacity: 0 }}
            transition={{ duration: 0.6 }} />
        ))}
      </AnimatePresence>
    </div>
  );
}