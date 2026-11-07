import { en } from '@/content/en';
import { CiteChip } from '@/components/world/CiteChip';
import { AskThread } from './b/AskThread';
import '@/app/sections-b.css';

/** S8. Two cited facts above a real Q&A thread. */
export function AskYourPapers() {
  const a = en.ask;
  return (
    <section id="ask" className="section ask" aria-labelledby="ask-h">
      <h2 id="ask-h" className="h-section">{a.h2}</h2>
      <div className="ask__grid">
        <div className="ask__side">
          <ul className="facts">
            {[a.fact1, a.fact2].map((f) => (
              <li key={f.cite} className="fact">
                <div className="tnum fact__text">
                  {f.text}
                  <CiteChip id={f.cite} />
                </div>
              </li>
            ))}
          </ul>
          <p className="ask__body">{a.body}</p>
        </div>
        <AskThread />
      </div>
    </section>
  );
}
