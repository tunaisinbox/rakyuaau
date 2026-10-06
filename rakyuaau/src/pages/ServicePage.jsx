import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, ExternalLink } from 'lucide-react';
import ShibuyaScene from '../components/run/ShibuyaScene';
import AdBanner from '../components/services/AdBanner';
import { RAKYUA_SERVICES, SERVICE_CATEGORIES } from '../data/rakyuaServices';

const apiId = (name) => 'rv_' + name.toLowerCase().replace(/[^a-z0-9]/g, '');

export default function ServicePage() {
  const { serviceName } = useParams();
  const decoded = decodeURIComponent(serviceName || '');

  const service = useMemo(
    () => RAKYUA_SERVICES.find(s => s.name.toLowerCase() === decoded.toLowerCase()),
    [decoded]
  );

  // 広告: 他のサービスをランダムに2つ
  const ads = useMemo(() => {
    if (!service) return [];
    const others = RAKYUA_SERVICES.filter(s => s.name !== service.name);
    return [...others].sort(() => Math.random() - 0.5).slice(0, 2);
  }, [service]);

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
  const infoRows = [
    { label: 'API名', value: `${service.name} API` },
    { label: 'API ID', value: apiId(service.name) },
    { label: '運営会社', value: service.company },
    { label: 'URL', value: `/${service.name}` },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ShibuyaScene />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}>R</div>
          <span className="text-sky-500/60 text-xs font-mono tracking-widest">RAKYUA_ID</span>
        </div>
        <Link to="/services" className="flex items-center gap-1.5 text-sky-400/60 hover:text-sky-300 text-xs font-mono transition-colors">
          <ArrowLeft className="w-3 h-3" /> SERVICE_LIST
        </Link>
      </div>

      {/* Card — ホームと同じガラスデザイン */}
      <div className="relative z-10 flex items-center justify-center px-4 pb-10" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-xl shadow-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)' }}>

          {/* Icon + name */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(56,189,248,0.2)' }}>
              {service.emoji}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-800 truncate">{service.name}</h1>
              <p className="text-sm text-gray-500 truncate">{service.company}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-sky-600"
                style={{ background: 'rgba(56,189,248,0.15)' }}>
                {cat?.icon} {cat?.label}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-6">{service.desc}</p>

          {/* Service info */}
          <div className="rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(56,189,248,0.15)' }}>
            <div className="px-4 py-2" style={{ background: 'rgba(56,189,248,0.12)' }}>
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">サービス情報</span>
            </div>
            {infoRows.map((r, i) => (
              <div key={r.label} className="flex justify-between items-center px-4 py-2.5"
                style={{ borderBottom: i < infoRows.length - 1 ? '1px solid rgba(56,189,248,0.1)' : 'none' }}>
                <span className="text-xs text-gray-400">{r.label}</span>
                <span className="text-xs text-gray-700 font-medium truncate ml-3">{r.value}</span>
              </div>
            ))}
          </div>

          {/* Ads */}
          <div className="mb-6">
            <p className="text-[10px] font-bold text-sky-500/70 uppercase tracking-widest mb-2">広告</p>
            <div className="space-y-2">
              {ads.map(a => <AdBanner key={a.name} service={a} />)}
            </div>
          </div>

          <div className="flex gap-3">
            <Link to={`/${encodeURIComponent(service.name)}/site`}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full bg-sky-400 text-white font-semibold hover:bg-sky-500 transition-colors">
              サイトに移動 <ExternalLink className="w-4 h-4" />
            </Link>
            <Link to="/services" className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full border border-sky-300 text-sky-600 font-semibold hover:bg-sky-50 transition-colors">
              サービス一覧 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}