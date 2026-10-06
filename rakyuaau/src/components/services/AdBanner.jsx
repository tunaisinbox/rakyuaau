import { Link } from 'react-router-dom';

/* 広告バナー — カタログ内の他サービスを宣伝する */
export default function AdBanner({ service }) {
  return (
    <Link to={`/${encodeURIComponent(service.name)}`}
      className="relative block rounded-xl p-3 transition-transform hover:scale-[1.02]"
      style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(14,165,233,0.28))', border: '1px solid rgba(56,189,248,0.25)' }}>
      <span className="absolute top-1.5 right-2 text-[9px] font-mono text-sky-400/60">AD</span>
      <div className="flex items-center gap-3">
        <span className="text-xl flex-shrink-0">{service.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-sky-600 truncate">{service.name}</p>
          <p className="text-[11px] text-gray-500 truncate">{service.desc}</p>
        </div>
      </div>
    </Link>
  );
}