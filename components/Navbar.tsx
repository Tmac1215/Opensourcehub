import Link from 'next/link';
import { Terminal, Github, LayoutGrid } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-white shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg tracking-tight">
            Open<span className="text-emerald-400">Source</span>Hub
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Browse All
          </Link>
          <Link
            href="/alternative"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Alternatives
          </Link>
          <a
            href="https://www.digitalocean.com/?refcode=YOUR_REF"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Deploy
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://www.digitalocean.com/?refcode=YOUR_REF"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Deploy $5/mo
          </a>
        </div>
      </div>
    </header>
  );
}
