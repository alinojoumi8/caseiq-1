import { ImageResponse } from 'next/og';
import { en } from '@/content/en';
import { heroExamples } from '@/content/examples';

// A simple Phone Roll card: the pinned headline bubble, one example message and its page tag.
// next/og ships one default typeface, so the display face (Bricolage Grotesque) is not used here.
export const alt = `${en.brand.name}: ${en.hero.h1}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const ex = heroExamples[0];
const MONO = 'ui-monospace, Menlo, Consolas, monospace';
const SERIF = 'Georgia, "Times New Roman", serif';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#F2F2F5',
          color: '#111111',
          padding: '56px 64px 48px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
          {en.brand.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: 660 }}>
            <div
              style={{
                display: 'flex',
                background: '#E5E5EA',
                borderRadius: 56,
                borderBottomLeftRadius: 12,
                padding: '30px 46px 38px',
                fontSize: 62,
                lineHeight: 1.04,
                fontWeight: 700,
                letterSpacing: -2,
              }}
            >
              {en.hero.h1}
            </div>
            <div style={{ display: 'flex', marginTop: 14, marginLeft: 26, fontSize: 20, color: '#4F4F57', fontFamily: MONO }}>
              {en.world.pinned}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: 420 }}>
            <div
              style={{
                display: 'flex',
                background: '#0A84FF',
                color: '#FFFFFF',
                borderRadius: 40,
                borderBottomRightRadius: 10,
                padding: '12px 30px',
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {ex.chip}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 18,
                width: 420,
                background: '#FFFFFF',
                borderRadius: 22,
                padding: '16px 18px 18px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', fontSize: 16, fontFamily: MONO, color: '#111111' }}>{ex.source}</div>
              <div
                style={{
                  display: 'flex',
                  marginTop: 10,
                  padding: '12px 16px',
                  background: '#F1F4F8',
                  borderLeft: '3px solid #7C8AA0',
                  fontFamily: SERIF,
                  fontSize: 26,
                  lineHeight: 1.3,
                }}
              >
                {`“${ex.papersShow}”`}
              </div>
            </div>
            <div style={{ display: 'flex', marginTop: 12, fontSize: 18, color: '#4F4F57' }}>{en.example.label}</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
