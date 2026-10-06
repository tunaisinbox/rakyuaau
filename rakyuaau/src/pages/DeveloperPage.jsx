const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ArrowLeft, Plus, Copy, Check, X, Key, Lock, BarChart2, Activity, Zap, Globe } from 'lucide-react';
import ApiSection from '../components/developer/ApiSection';
import { useNavigate } from 'react-router-dom';

import DevRegisterForm from '../components/developer/DevRegisterForm';

export default function DeveloperPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('loading'); // loading | register | login | activate | dashboard
  const [account, setAccount] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [devIdInput, setDevIdInput] = useState('');
  const [devPwInput, setDevPwInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [devPinInput, setDevPinInput] = useState('');
  const [devPinError, setDevPinError] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [raikyunPin, setRaikyunPin] = useState('');
  const [savingPin, setSavingPin] = useState(false);
  const [pinSaved, setPinSaved] = useState(false);
  const [tab, setTab] = useState('keys'); // keys | dashboard

  useEffect(() => {
    const id = sessionStorage.getItem('rakyua_dev_account_id');
    if (id) {
      db.entities.RakyuAccount.list().then(all => {
        const found = all.find(a => a.id === id);
        if (found?.is_developer) { setAccount(found); loadKeys(found.id); setMode('dashboard'); }
        else setMode('register');
      });
    } else {
      setMode('register');
    }
  }, []);

  const loadKeys = (id) => {
    db.entities.ApiKey.filter({ rakyua_account_id: id }, '-created_date').then(setApiKeys).catch(() => {});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const accounts = await db.entities.RakyuAccount.filter({ rakyuaid: devIdInput });
    if (accounts.length === 0) { setLoginError('IDが見つかりません'); return; }
    const acc = accounts[0];
    if (acc.password_hash !== devPwInput) { setLoginError('パスワードが違います'); return; }
    sessionStorage.setItem('rakyua_dev_account_id', acc.id);
    if (acc.is_developer) { setAccount(acc); loadKeys(acc.id); setMode('dashboard'); }
    else { setAccount(acc); setMode('activate'); }
  };

  const handleDevPinSubmit = async () => {
    const all = await db.entities.RakyuAccount.list();
    const raikyun = all.find(a => a.rakyuaid === 'raikyun');
    if (!raikyun?.developer_pin || raikyun.developer_pin !== devPinInput) {
      setDevPinError('PINが正しくありません'); return;
    }
    const dvid = 'DVID-' + Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('').match(/.{4}/g).join('-');
    await db.entities.RakyuAccount.update(account.id, { is_developer: true, rakyua_dvid: dvid });
    const updated = { ...account, is_developer: true, rakyua_dvid: dvid };
    setAccount(updated); loadKeys(updated.id); setMode('dashboard');
  };

  const handleRegisterDone = async (rakyuaid) => {
    const accounts = await db.entities.RakyuAccount.filter({ rakyuaid });
    if (accounts.length > 0) {
      sessionStorage.setItem('rakyua_dev_account_id', accounts[0].id);
      setAccount(accounts[0]); loadKeys(accounts[0].id); setMode('dashboard');
    }
  };

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) return;
    setGeneratingKey(true);
    const key = 'rky_' + Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('');
    const created = await db.entities.ApiKey.create({ rakyua_account_id: account.id, key_name: newKeyName.trim(), api_key: key, is_active: true, usage_count: 0 });
    setApiKeys(k => [created, ...k]);
    setNewKeyName(''); setGeneratingKey(false);
  };

  const handleRevokeKey = async (keyId) => {
    await db.entities.ApiKey.update(keyId, { is_active: false });
    setApiKeys(k => k.map(ak => ak.id === keyId ? { ...ak, is_active: false } : ak));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id); setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSavePin = async () => {
    if (!raikyunPin.trim()) return;
    setSavingPin(true);
    await db.entities.RakyuAccount.update(account.id, { developer_pin: raikyunPin.trim() });
    setSavingPin(false); setRaikyunPin(''); setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2500);
  };

  const totalUsage = apiKeys.reduce((s, k) => s + (k.usage_count || 0), 0);
  const maxUsage = Math.max(...apiKeys.map(k => k.usage_count || 0), 1);
  const activeKeys = apiKeys.filter(k => k.is_active).length;

  if (mode === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  // Register / Login screen
  if (mode === 'register' || mode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-white font-bold text-xl">Rakyua Developer</h1>
            <p className="text-blue-200 text-sm mt-1">開発者向けアカウント</p>
          </div>
          <div className="p-6">
            <div className="flex rounded-xl border-2 border-blue-100 mb-5 overflow-hidden">
              {['register', 'login'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === m ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:bg-blue-50'}`}>
                  {m === 'register' ? '新規登録' : 'ログイン'}
                </button>
              ))}
            </div>
            {mode === 'register' ? (
              <DevRegisterForm onDone={handleRegisterDone} />
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">RakyuaID</label>
                  <input value={devIdInput} onChange={e => { setDevIdInput(e.target.value); setLoginError(''); }}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-200 focus:border-blue-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">パスワード</label>
                  <input type="password" value={devPwInput} onChange={e => { setDevPwInput(e.target.value); setLoginError(''); }}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-200 focus:border-blue-500 outline-none text-sm" />
                </div>
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <button type="submit" className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all">
                  ログイン
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Activate developer mode
  if (mode === 'activate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-blue-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold">デベロッパーモードを有効化</p>
              <p className="text-xs text-muted-foreground">デベロッパーPINを入力してください</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input value={devPinInput} onChange={e => { setDevPinInput(e.target.value); setDevPinError(''); }}
              type="password" placeholder="PIN"
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-blue-200 focus:border-blue-500 outline-none text-sm" />
            <button onClick={handleDevPinSubmit} disabled={!devPinInput}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-50">
              認証
            </button>
          </div>
          {devPinError && <p className="text-xs text-red-500">{devPinError}</p>}
        </motion.div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-blue-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/mypage')} className="p-2 rounded-xl hover:bg-blue-50 text-blue-400 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Code2 className="w-5 h-5 text-blue-600" />
        <span className="font-bold text-foreground">Rakyua Developer</span>
        <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full font-medium">有効</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => { sessionStorage.removeItem('rakyua_dev_account_id'); setAccount(null); setMode('register'); }}
            className="text-xs text-muted-foreground hover:text-blue-600 transition-all">ログアウト</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Account info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden flex-shrink-0">
            {account?.avatar_url ? <img src={account.avatar_url} alt="" className="w-full h-full object-cover" /> : account?.name_sei?.[0]}
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground">{account?.name_sei} {account?.name_mei}</p>
            <p className="text-sm text-muted-foreground">@{account?.rakyuaid}</p>
          </div>
          {account?.rakyua_dvid && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-0.5">RakyuaDVID</p>
              <div className="flex items-center gap-1.5">
                <code className="text-xs font-mono font-bold text-blue-700">{account.rakyua_dvid}</code>
                <button onClick={() => handleCopy(account.rakyua_dvid, 'dvid')} className="p-1 rounded hover:bg-blue-50 transition-all">
                  {copiedKey === 'dvid' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex rounded-xl border-2 border-blue-100 overflow-hidden bg-white">
          {[['keys', <Key className="w-4 h-4" />, 'APIキー'], ['apis', <Globe className="w-4 h-4" />, 'API管理'], ['dashboard', <BarChart2 className="w-4 h-4" />, 'ダッシュボード']].map(([t, icon, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${tab === t ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:bg-blue-50'}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'keys' && (
            <motion.div key="keys" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              {/* Generate key */}
              <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5">
                <p className="text-sm font-semibold mb-3">新しいAPIキーを発行</p>
                <div className="flex gap-2">
                  <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                    placeholder="キー名（例: MyApp）"
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-blue-200 focus:border-blue-500 outline-none text-sm" />
                  <button onClick={handleGenerateKey} disabled={!newKeyName.trim() || generatingKey}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-1.5">
                    {generatingKey ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                    発行
                  </button>
                </div>
              </div>
              {/* Key list */}
              {apiKeys.length === 0 ? (
                <div className="bg-white rounded-2xl border border-blue-100 py-10 text-center text-sm text-muted-foreground">
                  APIキーがありません
                </div>
              ) : (
                <div className="space-y-2">
                  {apiKeys.map(k => (
                    <motion.div key={k.id} layout className={`bg-white rounded-2xl border-2 p-4 ${k.is_active ? 'border-blue-100' : 'border-gray-100 opacity-50'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-sm font-semibold text-foreground">{k.key_name}</span>
                          {!k.is_active && <span className="ml-2 text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">無効</span>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {k.is_active && (
                            <>
                              <button onClick={() => handleCopy(k.api_key, k.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-500 transition-all">
                                {copiedKey === k.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => handleRevokeKey(k.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-400 transition-all">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-1 truncate">{k.api_key}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {k.usage_count || 0} 回利用</span>
                        {k.last_used && <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {new Date(k.last_used).toLocaleDateString('ja-JP')}</span>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'apis' && (
            <motion.div key="apis" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <ApiSection account={account} />
            </motion.div>
          )}

          {tab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '総リクエスト', value: totalUsage, icon: <Activity className="w-5 h-5 text-blue-500" /> },
                  { label: '有効キー', value: activeKeys, icon: <Key className="w-5 h-5 text-green-500" /> },
                  { label: '総キー数', value: apiKeys.length, icon: <Zap className="w-5 h-5 text-orange-400" /> },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl border border-blue-100 p-4 text-center shadow-sm">
                    <div className="flex justify-center mb-2">{s.icon}</div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Usage chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5">
                <p className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-500" /> キー別利用状況</p>
                {apiKeys.filter(k => k.is_active).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">有効なAPIキーがありません</p>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.filter(k => k.is_active).map(k => (
                      <div key={k.id}>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span className="font-medium text-foreground">{k.key_name}</span>
                          <span>{k.usage_count || 0} 回</span>
                        </div>
                        <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((k.usage_count || 0) / maxUsage) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* raikyun-only PIN setter */}
        {account?.rakyuaid === 'tunaisinbox' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm border-2 border-amber-200 overflow-hidden">
            <div className="px-5 py-3 bg-amber-50 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">デベロッパーPIN設定 (raikyun専用)</span>
            </div>
            <div className="px-5 py-4 space-y-2">
              <div className="flex gap-2">
                <input value={raikyunPin} onChange={e => setRaikyunPin(e.target.value)}
                  type="password" placeholder="新しいPINを入力"
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none text-sm" />
                <button onClick={handleSavePin} disabled={!raikyunPin.trim() || savingPin}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-all disabled:opacity-50">
                  {savingPin ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
              </div>
              {pinSaved && <p className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> PINを設定しました</p>}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}