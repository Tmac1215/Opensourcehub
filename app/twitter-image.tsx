import { renderOgImage } from '@/lib/og';

export const alt = 'OpenSourceHub — Free Open-Source SaaS Alternatives';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return renderOgImage();
}
