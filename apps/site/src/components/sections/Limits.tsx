import { en } from '@/content/en';
import { ExternalIcon } from '@/components/world/icons';
import { Bubble } from '@/components/world/Bubble';
import '@/app/sections-b.css';

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** S9. "What we don't do" as one received bubble list; the free legal help links as link-preview cards. */
export function Limits() {
  const l = en.limits;
  const [doLead, ...doRest] = l.do.split(':');
  return (
    <section id="limits" className="section limits" aria-labelledby="limits-h">
      <h2 id="limits-h" className="h-section">{l.h2}</h2>
      <div className="limits__grid">
        <div className="limits__thread">
          <Bubble tail className="limits__bubble">
            <ul className="limits__dont">
              {l.dont.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Bubble>
          <Bubble tail className="limits__bubble limits__do">
            <p>
              <strong>{doLead}:</strong>
              {doRest.join(':')}
            </p>
          </Bubble>
        </div>
        <div className="limits__help">
          <p id="help-t" className="limits__help-title">{l.help.title}</p>
          <ul className="limits__cards" aria-labelledby="help-t">
            {l.help.items.map((r) => (
              <li key={r.name}>
                {r.url ? (
                  <a className="preview" href={r.url} target="_blank" rel="noopener noreferrer">
                    <span className="preview__title">{r.name}</span>
                    <span className="preview__blurb">{r.blurb}</span>
                    <span className="preview__domain">
                      {domainOf(r.url)}
                      <ExternalIcon size={13} />
                      <span className="sr-only"> ({en.ui.external})</span>
                    </span>
                  </a>
                ) : (
                  <div className="preview preview--static">
                    <span className="preview__title">{r.name}</span>
                    <span className="preview__blurb">{r.blurb}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
