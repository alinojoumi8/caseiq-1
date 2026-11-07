import Link from 'next/link';
import { legal, type LegalPageContent } from '@/content/legal';
import { siteConfig } from '@/content/site';
import { BUILD_MODE } from '@/lib/buildMode';
import { legalPageForMode } from '@/lib/legalPage';
import { legalParas } from '@/lib/placeholders';
import { EmailText } from '@/components/world/EmailText';
import '@/app/sections-b.css';

/**
 * Shared layout for /privacy, /terms and /accessibility. Quiet chrome on the ground colour, one readable column,
 * and a prominent draft banner above the heading. Server component.
 */
export function LegalPage({ page: basePage }: { page: LegalPageContent }) {
  // The here.now preview saves answers with here.now, so three privacy sections read differently there.
  const page = legalPageForMode(basePage, BUILD_MODE);
  return (
    <main id="main" tabIndex={-1} className="legal">
      <div className="legal__inner">
        <p className="draft-banner" role="note">
          <strong>{legal.banner.title}</strong>
          <span>{legal.banner.body}</span>
        </p>
        <h1 className="legal__h1">{page.h1}</h1>
        <p className="legal__updated">{legal.updated}</p>
        <p className="legal__intro">{page.intro}</p>
        {page.sections.map((s, i) => {
          const id = `${page.slug}-s${i}`;
          return (
            <section key={id} className="legal__sec" aria-labelledby={id}>
              <h2 id={id}>{s.h}</h2>
              {legalParas(s.paras ?? [], legal).map((p) => (
                <p key={p}>
                  {s.tbc ? <span className="tbc">{legal.tbc}</span> : null}
                  <EmailText text={s.tbc ? p.replace(/^To be confirmed\.\s*/, '') : p} email={siteConfig.contactEmail} />
                </p>
              ))}
              {s.items ? (
                <ul>
                  {s.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
        <p className="legal__back">
          <Link className="link" href="/">
            {legal.back}
          </Link>
        </p>
      </div>
    </main>
  );
}
