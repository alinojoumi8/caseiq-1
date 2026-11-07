'use client';

import { en } from '@/content/en';
import { QuickExitButton, QuickExitKey } from '@/components/layout/QuickExit';

/**
 * Replaces the whole document when the root layout itself throws, which also takes the safety strip with it. So it brings its own
 * Quick exit, first on the page, and double-Esc. It is plain on purpose: the site's stylesheet may be the thing that failed.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en-CA">
      <body style={{ margin: 0, padding: 20, background: '#F2F2F5', color: '#111', font: '17px/1.5 system-ui, sans-serif' }}>
        <style>{'a[data-quick-exit]{display:inline-flex;align-items:center;text-decoration:none;min-height:44px;padding:0 20px;border:2px solid #111;border-radius:999px;background:#fff;color:#111;font:700 15px system-ui,sans-serif;cursor:pointer}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}'}</style>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <QuickExitButton className="" />
        </div>
        <QuickExitKey />
        <h1 style={{ fontSize: 28, lineHeight: 1.1 }}>{en.error.title}</h1>
        <p>
          <button type="button" onClick={() => retry()} style={{ minHeight: 44, padding: '0 24px', font: 'inherit' }}>
            {en.error.retry}
          </button>
        </p>
      </body>
    </html>
  );
}
