import { ImageResponse } from 'next/og';
import { getAllSoftware, getSaasAlternatives } from '@/lib/software';

export function renderOgImage() {
  const tools = getAllSoftware().length;
  const saas = getSaasAlternatives().length;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 55%, #064e3b 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #34d399, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 800,
              color: '#020617',
            }}
          >
            {'>_'}
          </div>
          <div style={{ display: 'flex', marginLeft: 20, fontSize: 40, fontWeight: 700 }}>OpenSourceHub</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 78, fontWeight: 800, lineHeight: 1.05 }}>
            Open-Source Alternatives
          </div>
          <div style={{ display: 'flex', fontSize: 78, fontWeight: 800, lineHeight: 1.05, color: '#34d399' }}>
            to Every SaaS Tool
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 32, color: '#94a3b8' }}>
          {`${tools} self-hosted tools · ${saas} SaaS products covered · saasalternatives.online`}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
