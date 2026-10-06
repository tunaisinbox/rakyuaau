import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Rocket } from 'lucide-react';
import { RAKYUA_SERVICES, SERVICE_CATEGORIES } from '../data/rakyuaServices';

const MotionLink = motion(Link);

export default function Services() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const m = {};
    RAKYUA_SERVICES.forEach(s => { m[s.category] = (m[s.category] || 0) + 1; });
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RAKYUA_SERVICES.filter(s =>
      (category === 'all' || s.category === category) &&
      (!q || s.name.toLowerCase().includes(q) || s.company.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
    );
  }, [category, query]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #A8D8F0 40%, #E0F4FF 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-sky-100/60" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}>R</Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-800 text-sm sm:text-base truncate">Rakyua サービスカタログ</h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-widest">{RAKYUA_SERVICES.length} SERVICES</p>
          </div>
          <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/80 border border-sky-100 text-xs text-gray-500 hover:border-sky-300 hover:text-sky-500 transition-all flex-shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> 戻る
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* Hero */}
        <div className="text-center pt-10 pb-6">
          <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-white" style={{ textShadow: '0 2px 12px rgba(14,165,233,0.35)' }}>
            すべてのサービスを、ここから。
          </motion.h2>
          <p className="text-sky-700/70 text-sm mt-2">ファイル変換・ファイル転送からAIまで、すべてRakyuaのオリジナルサービスです</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="サービスを検索（例: PDF、転送、AI）"
            className="w-full pl-11 pr-4 py-3 rounded-full bg-white/80 border border-sky-100 focus:border-sky-400 outline-none text-sm text-gray-700 placeholder:text-gray-400"
            style={{ backdropFilter: 'blur(8px)' }}
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:flex-wrap sm:justify-center mb-4">
          <Chip active={category === 'all'} onClick={() => setCategory('all')} label={`すべて ${RAKYUA_SERVICES.length}`} />
          {SERVICE_CATEGORIES.map(c => (
            <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)} label={`${c.icon} ${c.label} ${counts[c.id] || 0}`} />
          ))}
        </div>

        {/* Result count */}
        <p className="text-center text-xs text-sky-700/60 mb-4">{filtered.length}件のサービス</p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">サービスが見つかりませんでした</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((s, i) => (
              <MotionLink
                key={s.name}
                to={`/${encodeURIComponent(s.name)}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 12) * 0.03, duration: 0.3 }}
                className="group bg-white/75 border border-sky-100 rounded-2xl p-4 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition-all flex flex-col"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {s.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{s.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{s.company}</p>
                    <p className="text-xs text-gray-500 mt-1.5">{s.desc}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-full bg-sky-400 text-white text-xs font-semibold group-hover:bg-sky-500 transition-colors">
                  <Rocket className="w-3 h-3" /> 詳しく見る
                </div>
              </MotionLink>
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 mt-12 leading-relaxed">
          記載されているサービス名・会社名はすべて架空のオリジナルです。<br />
          各サービスは /サービス名 のURLでいつでも利用できます。
        </p>
      </div>
    </div>
  );
}

function Chip({ active, onClick, label }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
        active ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-200' : 'bg-white/70 text-gray-500 border-sky-100 hover:border-sky-300'
      }`}>
      {label}
    </button>
  );
}