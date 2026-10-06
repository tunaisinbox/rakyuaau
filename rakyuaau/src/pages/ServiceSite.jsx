const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, LogIn, ShieldCheck, CornerDownLeft, KeyRound, Copy, Check } from 'lucide-react';

import { RAKYUA_SERVICES, SERVICE_CATEGORIES } from '../data/rakyuaServices';

/* カテゴリごとのテーマ */
const THEME = {
  convert: { grad: 'linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 55%, #F0F9FF 100%)', accent: '#0ea5e9', soft: 'rgba(14,165,233,0.12)' },
  transfer: { grad: 'linear-gradient(180deg, #CCFBF1 0%, #99F6E4 55%, #F0FDFA 100%)', accent: '#0d9488', soft: 'rgba(13,148,136,0.12)' },
  storage: { grad: 'linear-gradient(180deg, #DBEAFE 0%, #BFDBFE 55%, #EFF6FF 100%)', accent: '#2563eb', soft: 'rgba(37,99,235,0.12)' },
  image: { grad: 'linear-gradient(180deg, #FCE7F3 0%, #F9A8D4 55%, #FFF1F2 100%)', accent: '#db2777', soft: 'rgba(219,39,119,0.12)' },
  video: { grad: 'linear-gradient(180deg, #E0E7FF 0%, #C7D2FE 55%, #EEF2FF 100%)', accent: '#4f46e5', soft: 'rgba(79,70,229,0.12)' },
  productivity: { grad: 'linear-gradient(180deg, #FEF3C7 0%, #FDE68A 55%, #FFFBEB 100%)', accent: '#d97706', soft: 'rgba(217,119,6,0.12)' },
  dev: { grad: 'linear-gradient(180deg, #D1FAE5 0%, #A7F3D0 55%, #ECFDF5 100%)', accent: '#059669', soft: 'rgba(5,150,105,0.12)' },
  chat: { grad: 'linear-gradient(180deg, #DCFCE7 0%, #BBF7D0 55%, #F0FDF4 100%)', accent: '#16a34a', soft: 'rgba(22,163,74,0.12)' },
  ai: { grad: 'linear-gradient(180deg, #EDE9FE 0%, #DDD6FE 55%, #F5F3FF 100%)', accent: '#7c3aed', soft: 'rgba(124,58,237,0.12)' },
  sns: { grad: 'linear-gradient(180deg, #FFEDD5 0%, #FED7AA 55%, #FFF7ED 100%)', accent: '#ea580c', soft: 'rgba(234,88,12,0.12)' },
  translate: { grad: 'linear-gradient(180deg, #CFFAFE 0%, #A5F3FC 55%, #ECFEFF 100%)', accent: '#0891b2', soft: 'rgba(8,145,178,0.12)' },
  security: { grad: 'linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 55%, #F8FAFC 100%)', accent: '#475569', soft: 'rgba(71,85,105,0.12)' },
};

const FEATURES = {
  convert: [
    { icon: '🗂️', title: '多形式対応', text: '文書・画像・音声・動画など200種類以上の形式に対応' },
    { icon: '⚡', title: '高速変換', text: 'クラウドエンジンが数秒で変換を完了' },
    { icon: '🔒', title: '自動削除', text: '変換後のファイルはすぐに自動で削除' },
  ],
  transfer: [
    { icon: '📦', title: '大容量OK', text: '大きなファイルもそのまま送信できる' },
    { icon: '🔗', title: 'リンク共有', text: 'URLを送るだけで受け取りが完了' },
    { icon: '⏳', title: '期限つき', text: '共有リンクは7日後に自動で失効' },
  ],
  storage: [
    { icon: '☁️', title: 'どこでもアクセス', text: 'デバイスを選ばずファイルにアクセス' },
    { icon: '🔄', title: '自動同期', text: '編集はリアルタイムで同期される' },
    { icon: '🛡️', title: '二重バックアップ', text: 'データは2か所に保管して安心' },
  ],
  image: [
    { icon: '✂️', title: 'ワンタップ加工', text: '切り抜き・補正がワンタップで完了' },
    { icon: '🎨', title: '豊富な素材', text: 'テンプレートと素材を多数収録' },
    { icon: '📤', title: 'すぐ書き出し', text: 'SNSサイズでそのまま書き出せる' },
  ],
  video: [
    { icon: '🎬', title: '簡単カット編集', text: 'ドラッグで直感的にカット編集' },
    { icon: '📝', title: '自動字幕', text: 'AIが字幕を自動で生成' },
    { icon: '📱', title: '縦横対応', text: 'SNS向けの縦型動画にも対応' },
  ],
  productivity: [
    { icon: '✅', title: 'タスク管理', text: 'やることを漏らさず管理できる' },
    { icon: '📅', title: '予定調整', text: 'カレンダーと連動した計画立て' },
    { icon: '👥', title: 'チーム共有', text: 'メンバーと進捗をリアルタイム共有' },
  ],
  dev: [
    { icon: '🌿', title: '軽量リポジトリ', text: '快適に動くGitホスティング' },
    { icon: '🚀', title: 'ワンタップデプロイ', text: 'pushするだけで本番に反映' },
    { icon: '👀', title: 'レビュー支援', text: '変更点をわかりやすく表示' },
  ],
  chat: [
    { icon: '💬', title: '軽快なチャット', text: 'ストレスなく読み書きできる設計' },
    { icon: '📣', title: 'グループ通話', text: 'いつでもすぐに声をかけられる' },
    { icon: '🔒', title: '安全な設計', text: 'メッセージは暗号化して保存' },
  ],
  ai: [
    { icon: '🤖', title: '賢いアシスタント', text: '調べもの・文章・相談なんでも' },
    { icon: '🧠', title: '長文も理解', text: '長い資料も読み解いて要約' },
    { icon: '🖼️', title: 'マルチモーダル', text: '画像も一緒に扱える' },
  ],
  sns: [
    { icon: '❤️', title: 'リアクション', text: '投稿に気軽にリアクションできる' },
    { icon: '🐕', title: 'フォロー', text: '好きな投稿者をフォローして追跡' },
    { icon: '🌙', title: '通知コントロール', text: '通知は好きな時間に設定可能' },
  ],
  translate: [
    { icon: '🌍', title: '多言語対応', text: '25以上の言語に対応' },
    { icon: '✨', title: '自然な訳文', text: 'こなれた自然な訳に仕上げる' },
    { icon: '📻', title: '耳で学ぶ', text: '音声コンテンツでも学習できる' },
  ],
  security: [
    { icon: '🔑', title: '一括管理', text: 'パスワードを1本の鍵にまとめる' },
    { icon: '🔐', title: '二段階認証', text: '不正アクセスをしっかりブロック' },
    { icon: '👀', title: '監視アラート', text: '不審なアクセスを検知して通知' },
  ],
};

const STEPS = [
  { icon: LogIn, title: 'RakyuaIDでログイン', text: 'Rakyuaのログイン画面に移動します' },
  { icon: ShieldCheck, title: 'アクセスを許可', text: '要求された情報を確認して許可します' },
  { icon: CornerDownLeft, title: '自動で戻る', text: 'このサイトへ自動でリダイレクトされます' },
];

export default function ServiceSite() {
  const { serviceName } = useParams();
  const [sp] = useSearchParams();
  const decoded = decodeURIComponent(serviceName || '');

  const service = useMemo(
    () => RAKYUA_SERVICES.find(s => s.name.toLowerCase() === decoded.toLowerCase()),
    [decoded]
  );

  const status = sp.get('status');
  const rakyuaid = sp.get('rakyuaid');
  const connected = status === 'allowed' && !!rakyuaid && !!service;

  // 発行済みAPIキーを取得（Google風のキー発行UI）
  const [apiKey, setApiKey] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!connected || !service) return;
    let cancelled = false;
    const accountId = sp.get('account_id');
    const q = accountId ? { rakyua_account_id: accountId, key_name: service.name } : { key_name: service.name };
    db.entities.ApiKey.filter(q)
      .then(keys => { if (!cancelled) setApiKey(keys[keys.length - 1]?.api_key || null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [connected, service?.name]);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'linear-gradient(180deg, #87CEEB, #E0F4FF)' }}>
        <h1 className="text-5xl font-bold text-white">404</h1>
        <p className="text-gray-600 text-sm">
          <span className="font-bold text-sky-600">{decoded}</span> はRakyuaに登録されていないサービスです
        </p>
        <Link to="/services" className="px-6 py-3 rounded-full bg-sky-400 text-white font-semibold hover:bg-sky-500 transition-colors">
          サービス一覧へ
        </Link>
      </div>
    );
  }

  const cat = SERVICE_CATEGORIES.find(c => c.id === service.category);
  const theme = THEME[service.category] || THEME.convert;
  const features = FEATURES[service.category] || FEATURES.convert;

  const runUrl = `/run?app=${encodeURIComponent(service.name)}&callback=${encodeURIComponent(`${window.location.origin}/${encodeURIComponent(service.name)}/site`)}&scopes=profile_read,email_read`;

  return (
    <div className="min-h-screen" style={{ background: theme.grad }}>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', borderColor: 'rgba(0,0,0,0.05)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border flex items-center justify-center text-lg flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            {service.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm truncate">{service.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{service.company}</p>
          </div>
          <Link to={`/${encodeURIComponent(service.name)}`} className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 hidden sm:block">
            サービス情報
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Hero */}
        <div className="text-center pt-14 pb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="w-20 h-20 mx-auto rounded-3xl bg-white shadow-lg flex items-center justify-center text-4xl mb-5" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
              {service.emoji}
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium mb-3" style={{ background: theme.soft, color: theme.accent }}>
              {cat?.icon} {cat?.label}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">{service.name}</h1>
            <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">{service.desc}</p>

            {/* Connected banner + issued API key */}
            {connected && (
              <div className="mt-6 mx-auto max-w-md space-y-3">
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-sm text-emerald-600 truncate">
                    RakyuaID連携済み — <span className="font-bold">@{rakyuaid}</span>
                  </p>
                </div>
                <div className="rounded-xl p-4 bg-white/85 text-left" style={{ border: '1px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(8px)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="w-4 h-4" style={{ color: theme.accent }} />
                    <p className="text-xs font-bold text-gray-700">APIキーを発行しました</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs rounded-lg px-3 py-2 truncate text-gray-600" style={{ background: 'rgba(0,0,0,0.04)' }}>
                      {apiKey ? (showKey ? apiKey : apiKey.slice(0, 10) + '••••••••') : '発行中...'}
                    </code>
                    {apiKey && (
                      <>
                        <button type="button" onClick={() => setShowKey(!showKey)}
                          className="text-[11px] px-2 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.04)' }}>
                          {showKey ? '隠す' : '表示'}
                        </button>
                        <button type="button"
                          onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(apiKey); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.04)' }}>
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">このキーは他の人に教えないでください</p>
                </div>
              </div>
            )}

            <a href={runUrl}
              className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold shadow-lg transition-transform hover:scale-105"
              style={{ background: theme.accent, boxShadow: `0 8px 24px ${theme.soft}` }}>
              RakyuaIDで始める <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-[11px] text-gray-400 mt-3">RakyuaIDをお持ちなら、登録なしですぐ利用できます</p>
          </motion.div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.1 }}
              className="rounded-2xl p-5 bg-white/80" style={{ border: '1px solid rgba(0,0,0,0.05)', backdropFilter: 'blur(8px)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: theme.soft }}>
                {f.icon}
              </div>
              <p className="font-bold text-gray-800 text-sm mb-1">{f.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>

        {/* How OAuth works */}
        <div className="rounded-2xl p-6 sm:p-8 bg-white/80 mb-12" style={{ border: '1px solid rgba(0,0,0,0.05)', backdropFilter: 'blur(8px)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: theme.accent }}>RAKYUA連携の流れ</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex sm:flex-col gap-3 items-start">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ background: theme.accent }}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{i + 1}. {s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-400">© {service.company}</p>
          <p className="text-[10px] text-gray-400/70 mt-1">本サイトはRakyuaのエコシステムで動作するデモサービスです</p>
        </div>
      </div>
    </div>
  );
}