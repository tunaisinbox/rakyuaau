const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Copy, Check, X, Globe, Zap, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const BASE_URL = window.location.origin;

const ALL_SCOPES = [
  { key: 'profile_read', label: 'プロフィール情報の閲覧' },
  { key: 'email_read', label: 'メールアドレスの閲覧' },
  { key: 'phone_read', label: '電話番号の閲覧' },
  { key: 'account_manage', label: 'アカウント情報の変更' },
];

export default function ApiSection({ account }) {
  const [apis, setApis] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [apiName, setApiName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [forwardUrl, setForwardUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [selectedScopes, setSelectedScopes] = useState(['profile_read']);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedApi, setExpandedApi] = useState(null);

  if (!loaded) {
    db.entities.RakyuApi.filter({ rakyua_account_id: account.id }, '-created_date')
      .then(res => { setApis(res); setLoaded(true); })
      .catch(() => { setApis([]); setLoaded(true); });
  }

  const toggleScope = (key) => {
    setSelectedScopes(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!apiName.trim() || !serviceName.trim() || !forwardUrl.trim()) return;
    setCreating(true);
    const apiId = Array.from(crypto.getRandomValues(new Uint8Array(10)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    const created = await db.entities.RakyuApi.create({
      rakyua_account_id: account.id,
      api_name: apiName.trim(),
      service_name: serviceName.trim(),
      forward_url: forwardUrl.trim(),
      company_name: companyName.trim(),
      contact_email: contactEmail.trim(),
      allowed_scopes: selectedScopes.join(','),
      api_id: apiId,
      is_active: true,
    });
    setApis(a => [created, ...a]);
    setApiName(''); setServiceName(''); setForwardUrl(''); setCompanyName(''); setContactEmail(''); setSelectedScopes(['profile_read']);
    setCreating(false); setShowForm(false);
  };

  const handleRevoke = async (id) => {
    await db.entities.RakyuApi.update(id, { is_active: false });
    setApis(a => a.map(x => x.id === id ? { ...x, is_active: false } : x));
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  const getApiUrl = (api) => `${BASE_URL}/api/v1/${api.service_name}/${api.api_id}`;
  const getRunUrl = (api) => {
    const scopes = api.allowed_scopes || 'profile_read';
    return `https://auth-rakyua.db.app/run?app=${api.service_name}&callback=URL&scopes=${scopes}`;
  };

  if (!loaded) return (
    <div className="py-10 flex justify-center">
      <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {!showForm ? (
          <motion.button key="btn"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-blue-200 text-blue-500 text-sm font-medium flex items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-all">
            <Plus className="w-4 h-4" /> 新しいAPIを作成
          </motion.button>
        ) : (
          <motion.form key="form"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            onSubmit={handleCreate}
            className="bg-white rounded-2xl border-2 border-blue-200 p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground mb-1">新しいAPIを作成</p>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">API名</label>
              <input value={apiName} onChange={e => setApiName(e.target.value)}
                placeholder="例: MyAPI"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-100 focus:border-blue-400 outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">サービス名</label>
              <input value={serviceName} onChange={e => setServiceName(e.target.value)}
                placeholder="例: myservice（英数字・ハイフンのみ）"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-100 focus:border-blue-400 outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">会社名</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                placeholder="例: Rakyua Inc."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-100 focus:border-blue-400 outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">登録メールアドレス</label>
              <input value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                placeholder="contact@example.com" type="email"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-100 focus:border-blue-400 outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">転送URL</label>
              <input value={forwardUrl} onChange={e => setForwardUrl(e.target.value)}
                placeholder="https://example.com/endpoint"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-100 focus:border-blue-400 outline-none text-sm" />
            </div>
            {/* Scope selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">アクセス権限</label>
              <div className="space-y-1.5">
                {ALL_SCOPES.map(s => (
                  <label key={s.key} className="flex items-center gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => toggleScope(s.key)}
                      className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all border-2 ${selectedScopes.includes(s.key) ? 'bg-blue-600 border-blue-600' : 'border-blue-200 group-hover:border-blue-400'}`}>
                      {selectedScopes.includes(s.key) && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-sm text-foreground">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-full border-2 border-blue-100 text-muted-foreground text-sm font-medium hover:bg-blue-50 transition-all">
                キャンセル
              </button>
              <button type="submit" disabled={creating || !apiName.trim() || !serviceName.trim() || !companyName.trim() || !contactEmail.trim() || !forwardUrl.trim()}
                className="flex-1 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                作成
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {apis.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-100 py-10 text-center text-sm text-muted-foreground">
          APIがまだ作成されていません
        </div>
      ) : (
        <div className="space-y-3">
          {apis.map(api => {
            const isExpanded = expandedApi === api.id;
            return (
              <motion.div key={api.id} layout
                className={`bg-white rounded-2xl border-2 ${api.is_active ? 'border-blue-100' : 'border-gray-100 opacity-50'}`}>
                {/* Header */}
                <button
                  onClick={() => setExpandedApi(isExpanded ? null : api.id)}
                  className="w-full flex items-center gap-3 p-4 text-left">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{api.api_name}</p>
                    <p className="text-xs text-muted-foreground">サービス: {api.service_name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {api.is_active && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">有効</span>}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-blue-50">
                      <div className="p-4 space-y-3">
                        {/* Forward URL */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-xs">
                          <Zap className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground truncate flex-1">{api.forward_url}</span>
                        </div>

                        {/* Scopes */}
                        {api.allowed_scopes && (
                          <div className="flex flex-wrap gap-1.5">
                            {api.allowed_scopes.split(',').map(s => {
                              const info = ALL_SCOPES.find(x => x.key === s.trim());
                              return info ? (
                                <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{info.label}</span>
                              ) : null;
                            })}
                          </div>
                        )}

                        {/* URLs */}
                        <div className="space-y-2">
                          {[
                            { label: 'API URL', value: getApiUrl(api), key: api.id + '-api' },
                            { label: '実行 URL', value: getRunUrl(api), key: api.id + '-run' },
                          ].map(({ label, value, key }) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{label}</span>
                              <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 min-w-0">
                                <code className="text-xs font-mono text-blue-700 truncate flex-1">{value}</code>
                                <button onClick={() => handleCopy(value, key)}
                                  className="flex-shrink-0 p-0.5 hover:text-blue-600 text-muted-foreground transition-colors">
                                  {copied === key ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <a href={value} target="_blank" rel="noopener noreferrer"
                                  className="flex-shrink-0 p-0.5 hover:text-blue-600 text-muted-foreground transition-colors">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Revoke */}
                        {api.is_active && (
                          <button onClick={() => handleRevoke(api.id)}
                            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 transition-colors pt-1">
                            <X className="w-3 h-3" /> APIを無効化
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}