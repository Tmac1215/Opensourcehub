import type { ReactNode } from 'react';

export const CONTACT_URL = 'https://github.com/Tmac1215/Opensourcehub/issues';

interface Props {
  title: string;
  updated?: string;
  intro?: string;
  children: ReactNode;
}

export default function LegalPage({ title, updated, intro, children }: Props) {
  return (
    <div className="min-h-screen bg-slate-950">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h1 className="text-4xl font-extrabold text-white mb-3 leading-tight">{title}</h1>
        {updated && <p className="text-slate-400 text-sm mb-8">Last updated: {updated}</p>}
        {intro && <p className="text-slate-300 text-lg leading-relaxed mb-10">{intro}</p>}
        <div className="space-y-5 text-slate-300 leading-relaxed [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-3 [&_a]:text-emerald-400 [&_a:hover]:text-emerald-300 [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-white">
          {children}
        </div>
      </article>
    </div>
  );
}
