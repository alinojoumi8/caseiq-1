'use client';

import { en } from '@/content/en';
import '@/app/sections-b.css';

/**
 * What a page shows when something on it throws. It sits inside the root layout, so the safety strip and Quick exit (and
 * double-Esc) stay exactly where they were above it; only the page's own content is replaced.
 */
export default function PageError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main id="main" tabIndex={-1} className="legal">
      <div className="legal__inner">
        <h1 className="legal__h1">{en.error.title}</h1>
        <p>
          <button type="button" className="btn-outline" onClick={() => retry()}>
            {en.error.retry}
          </button>
        </p>
      </div>
    </main>
  );
}
