const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, LogOut, User, Phone, Mail, Calendar, Users, Hash, Eye, EyeOff, ChevronRight, Trash2, Shield, Monitor, MapPin, Clock, Camera, KeyRound, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import PinSection from '../components/mypage/PinSection';
import PasskeySection from '../components/mypage/PasskeySection';

export default function MyPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // field name being edited
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwConfirmError, setPwConfirmError] = useState('');
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loginVersion, setLoginVersion] = useState('v2');

  const SENSITIVE_FIELDS = ['email', 'phone'];

  useEffect(() => {
    const id = sessionStorage.getItem('rakyua_account_id');
    if (id) {
      db.entities.LoginHistory.filter({ rakyua_account_id: id }, '-login_date', 10).then(setLoginHistory).catch(() => {});
    }
    if (!id) { window.location.href = '/'; return; }
    db.entities.RakyuAccount.list().then(all => {
      const found = all.find(a => a.id === id);
      if (found) {
        setAccount(found);
        if (found.rakyuaid === 'tunaisinbox') {
          setLoginVersion(found.login_version || 'v2');
        }
      }
      else { window.location.href = '/'; }
      setLoading(false);
    });
  }, []);

  const startEdit = (field, value) => {
    setEditing(field);
    setEditValue(value || '');
    setPwConfirm('');
    setPwConfirmError('');
    setShowPwConfirm(false);
  };

  const cancelEdit = () => { setEditing(null); setEditValue(''); setPwConfirm(''); setPwConfirmError(''); };

  const saveEdit = async () => {
    if (SENSITIVE_FIELDS.includes(editing)) {
      if (pwConfirm !== account.password_hash) {
        setPwConfirmError('パスワードが違います');
        return;
      }
    }
    setSaving(true);
    await db.entities.RakyuAccount.update(account.id, { [editing]: editValue });
    setAccount(a => ({ ...a, [editing]: editValue }));
    setSaving(false);
    setEditing(null);
    setSaveMsg('保存しました');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('rakyua_account_id');
    window.location.href = '/';
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    await db.entities.RakyuAccount.update(account.id, { avatar_url: file_url });
    setAccount(a => ({ ...a, avatar_url: file_url }));
    setUploadingAvatar(false);
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== account.rakyuaid) return;
    setDeleting(true);
    await db.entities.RakyuAccount.delete(account.id);
    sessionStorage.removeItem('rakyua_account_id');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  const fields = [
    { key: 'name_sei', label: '姓', icon: User, value: account?.name_sei },
    { key: 'name_mei', label: '名前', icon: User, value: account?.name_mei },
    { key: 'birthday', label: '生年月日', icon: Calendar, value: account?.birthday, type: 'date' },
    { key: 'gender', label: '性別', icon: Users, value: account?.gender, type: 'select', options: ['女性', '男性', '回答しない'] },
    { key: 'rakyuaid', label: 'RakyuaID', icon: Hash, value: account?.rakyuaid },
    { key: 'email', label: 'メールアドレス', icon: Mail, value: account?.email },
    { key: 'phone', label: '電話番号', icon: Phone, value: account?.phone },
    { key: 'password_hash', label: 'パスワード', icon: Eye, value: account?.password_hash, secret: true },
    ...(account?.rakyuaid === 'tunaisinbox'
      ? [{ key: 'developer_pin', label: 'デベロッパーPIN', icon: KeyRound, value: account?.developer_pin, secret: true }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50/30">
      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md border-b border-pink-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500 flex items-center justify-center shadow-md shadow-pink-200">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="font-semibold text-foreground">マイページ</span>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-pink-500 hover:bg-pink-50 border border-pink-200 transition-all">
          <LogOut className="w-4 h-4" /> ログアウト
        </button>
      </motion.div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <motion.div whileHover={{ scale: 1.05 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-pink-200 overflow-hidden">
              {account?.avatar_url
                ? <img src={account.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                : account?.name_sei?.[0]}
            </motion.div>
            <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center cursor-pointer shadow-md transition-all">
              {uploadingAvatar
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Camera className="w-3.5 h-3.5 text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{account?.name_sei} {account?.name_mei}</h2>
            <p className="text-muted-foreground text-sm mt-0.5">@{account?.rakyuaid}</p>
            <div className="mt-2 px-3 py-1 bg-pink-50 rounded-full inline-block">
              <span className="text-xs text-pink-600 font-medium">{account?.gender}</span>
            </div>
          </div>
        </motion.div>

        {/* Save message */}
        <AnimatePresence>
          {saveMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              <Check className="w-4 h-4" /> {saveMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fields */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-pink-100 divide-y divide-pink-50 overflow-hidden">
          <div className="px-5 py-3 bg-pink-50/60">
            <span className="text-xs font-semibold text-pink-500 uppercase tracking-wider">登録情報</span>
          </div>
          {fields.map((f, i) => (
            <motion.div key={f.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}>
              {editing === f.key ? (
                <div className="px-5 py-4 space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <f.icon className="w-4 h-4 text-pink-400" /> {f.label}
                  </label>
                  {f.type === 'select' ? (
                    <div className="grid grid-cols-3 gap-2">
                      {f.options.map(opt => (
                        <button key={opt} type="button" onClick={() => setEditValue(opt)}
                          className={`py-2 rounded-xl border-2 text-sm transition-all ${editValue === opt ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-pink-100 text-muted-foreground hover:border-pink-200'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type={f.secret && !showPw ? 'password' : f.type || 'text'}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-pink-300 bg-white focus:border-pink-500 outline-none transition-all text-foreground text-sm"
                        autoFocus
                      />
                      {f.secret && (
                        <button type="button" onPointerDown={() => setShowPw(true)} onPointerUp={() => setShowPw(false)} onPointerLeave={() => setShowPw(false)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-pink-500 touch-none">
                          {showPw ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  )}
                  {/* Password confirm for sensitive fields */}
                  {SENSITIVE_FIELDS.includes(f.key) && (
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> 本人確認のため現在のパスワードを入力
                      </label>
                      <div className="relative">
                        <input
                          type={showPwConfirm ? 'text' : 'password'}
                          value={pwConfirm}
                          onChange={e => { setPwConfirm(e.target.value); setPwConfirmError(''); }}
                          placeholder="現在のパスワード"
                          className={`w-full px-4 py-2.5 pr-10 rounded-xl border-2 bg-white focus:border-pink-500 outline-none transition-all text-foreground text-sm ${
                            pwConfirmError ? 'border-red-400' : 'border-pink-300'
                          }`}
                        />
                        <button type="button" onPointerDown={() => setShowPwConfirm(true)} onPointerUp={() => setShowPwConfirm(false)} onPointerLeave={() => setShowPwConfirm(false)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-pink-500 touch-none">
                          {showPwConfirm ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                      {pwConfirmError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <X className="w-3 h-3" /> {pwConfirmError}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving}
                      className="flex-1 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-all disabled:opacity-50">
                      {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                      保存
                    </button>
                    <button onClick={cancelEdit}
                      className="px-5 py-2 rounded-full border-2 border-pink-200 text-pink-500 text-sm font-medium hover:bg-pink-50 transition-all flex items-center gap-1">
                      <X className="w-4 h-4" /> キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => startEdit(f.key, f.value)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-pink-50/60 transition-all text-left group">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-100 transition-all">
                    <f.icon className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="text-sm text-foreground font-medium truncate mt-0.5">
                      {f.secret ? '••••••••' : (f.value || '未設定')}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-pink-300 group-hover:text-pink-500 transition-all group-hover:translate-x-0.5" />
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>
        {/* Login History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
          <div className="px-5 py-3 bg-pink-50/60 flex items-center gap-2">
            <Shield className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-semibold text-pink-500 uppercase tracking-wider">最近のログイン履歴</span>
          </div>
          {loginHistory.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-muted-foreground">履歴がありません</div>
          ) : (
            <div className="divide-y divide-pink-50">
              {loginHistory.map((h, i) => (
                <div key={h.id || i} className="px-5 py-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Monitor className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{h.device || '不明な端末'}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {h.login_date ? new Date(h.login_date).toLocaleString('ja-JP') : '不明'}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {h.location || '不明'}
                      </span>
                    </div>
                  </div>
                  {i === 0 && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">最新</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Passkey section */}
        <PasskeySection
          account={account}
          onUpdated={(val) => setAccount(a => ({ ...a, passkey_credentials: val }))}
        />

        {/* PIN section — tunaisinbox only */}
        {account?.rakyuaid === 'tunaisinbox' && (
          <PinSection
            account={account}
            onUpdated={(val) => setAccount(a => ({ ...a, developer_pin: val }))}
          />
        )}

        {/* Login version selector — tunaisinbox only */}
        {account?.rakyuaid === 'tunaisinbox' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-semibold text-pink-500 uppercase tracking-wider">ログインページバージョン</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={async () => { setLoginVersion('v1'); await db.entities.RakyuAccount.update(account.id, { login_version: 'v1' }); }}
                className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${loginVersion === 'v1' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-pink-100 text-muted-foreground hover:border-pink-200'}`}>
                Ver.1（旧）
              </button>
              <button onClick={async () => { setLoginVersion('v2'); await db.entities.RakyuAccount.update(account.id, { login_version: 'v2' }); }}
                className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${loginVersion === 'v2' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-pink-100 text-muted-foreground hover:border-pink-200'}`}>
                Ver.2（新）
              </button>
            </div>
            <p className="text-xs text-muted-foreground">選択したバージョンがログインページに反映されます。</p>
          </motion.div>
        )}

        {/* Delete account */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="pb-4">
          <button onClick={() => setShowDeleteDialog(true)}
            className="w-full py-3 rounded-full border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> アカウントを削除する
          </button>
        </motion.div>
      </div>

      {/* Delete confirm dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">アカウントを削除</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">この操作は取り消せません</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">確認のため <span className="font-bold text-foreground">{account?.rakyuaid}</span> と入力してください。</p>
              <input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder={account?.rakyuaid}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-red-200 focus:border-red-400 outline-none text-sm"
              />
              <div className="flex gap-2">
                <button onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText(''); }}
                  className="flex-1 py-2.5 rounded-full border-2 border-pink-200 text-pink-500 text-sm font-semibold hover:bg-pink-50 transition-all">
                  キャンセル
                </button>
                <button onClick={handleDelete}
                  disabled={deleteConfirmText !== account?.rakyuaid || deleting}
                  className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5">
                  {deleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  削除する
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}