import { Rocket, ArrowRight, Server } from 'lucide-react';

interface Provider {
  name: string;
  price: string;
  credit: string;
  url: string;
  gradient: string;
  badge: string;
}

const PROVIDERS: Record<string, Provider> = {
  digitalocean: {
    name: 'DigitalOcean',
    price: '$5/mo',
    credit: '$200 free credit',
    url: 'https://www.digitalocean.com/?refcode=YOUR_REF&utm_campaign=Referral_Invite',
    gradient: 'from-blue-600 via-blue-500 to-indigo-600',
    badge: 'Most Popular',
  },
  vultr: {
    name: 'Vultr',
    price: '$5/mo',
    credit: '$100 free credit',
    url: 'https://www.vultr.com/?ref=YOUR_REF',
    gradient: 'from-indigo-600 via-violet-600 to-purple-700',
    badge: 'Best Value',
  },
  linode: {
    name: 'Akamai / Linode',
    price: '$5/mo',
    credit: '$100 free credit',
    url: 'https://www.linode.com/?r=YOUR_REF',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    badge: 'Battle-tested',
  },
};

interface Props {
  softwareName?: string;
  provider?: keyof typeof PROVIDERS;
  compact?: boolean;
}

export default function AffiliateCTA({ softwareName, provider = 'digitalocean', compact = false }: Props) {
  const p = PROVIDERS[provider];

  if (compact) {
    return (
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`flex items-center gap-3 bg-gradient-to-r ${p.gradient} rounded-xl px-5 py-4 group hover:opacity-90 transition-opacity`}
      >
        <Server className="w-5 h-5 text-white/80 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">
            Deploy on {p.name} — {p.price}
          </p>
          <p className="text-white/70 text-xs">{p.credit} for new users</p>
        </div>
        <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
      </a>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.gradient} p-8 md:p-10`}>
      {/* Background circles */}
      <div className="pointer-events-none">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10">
        <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
          {p.badge} · Sponsored
        </span>

        <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
          {softwareName
            ? <>Deploy <span className="underline decoration-white/30 underline-offset-2">{softwareName}</span> on {p.name}</>
            : <>Self-host on {p.name}</>}
        </h3>

        <p className="text-white/75 text-base mb-7 max-w-lg">
          Starting at {p.price} · {p.credit} for new users · One-click Docker deploys
          · SSD storage · 99.99% uptime SLA
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-bold px-6 py-3.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-xl shadow-black/20"
          >
            <Rocket className="w-4 h-4" />
            Get {p.credit}
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors border border-white/20"
          >
            View Plans — from {p.price}
          </a>
        </div>
      </div>
    </div>
  );
}
