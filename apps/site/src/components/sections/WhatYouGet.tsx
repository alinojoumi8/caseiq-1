import '@/app/sections-a.css';
import { en } from '@/content/en';
import { AttachmentBubble } from '@/components/world/AttachmentBubble';
import { SummaryPreview } from './a/SummaryPreview';

/**
 * S7: three attachment bubbles with their descriptions, the delivery line, and "Also included" as a quieter grouped list.
 * The summary attachment opens a paged preview (SummaryPreview, the only client part).
 */
export function WhatYouGet() {
  const g = en.get;
  return (
    <section id="get" className="section" aria-labelledby="get-h">
      <h2 id="get-h" className="h-section">
        {g.h2}
      </h2>

      <div className="get-grid">
        <div>
          <ul className="get-list">
            {g.things.map((thing) => (
              <li key={thing.id} className="get-thing">
                {thing.id === 'summary' ? (
                  <SummaryPreview name={thing.file} />
                ) : (
                  <AttachmentBubble className="get-attach" name={thing.file} />
                )}
                <div>
                  <h3>{thing.title}</h3>
                  <p>{thing.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="get-formats">{g.formats}</p>
        </div>

        <div className="get-also">
          <h3>{g.alsoTitle}</h3>
          <ul>
            {g.also.map((item) => (
              <li key={item.title}>
                <b>{item.title}</b>
                {item.body}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
