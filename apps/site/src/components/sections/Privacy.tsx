import { en } from '@/content/en';
import { Bubble } from '@/components/world/Bubble';
import { NoteIcon } from './b/icons';
import '@/app/sections-b.css';

/**
 * S10. The thread continues: the heading is the visitor's question as a sent bubble, each item answers in a received
 * bubble, and the privilege note is a calm received bubble of its own.
 */
export function Privacy() {
  const p = en.privacy;
  return (
    <section id="privacy" className="section priv" aria-labelledby="privacy-h">
      <div className="priv__thread">
        <h2 id="privacy-h" className="priv__ask">
          <Bubble as="span" variant="sent" tail>
            {p.ask}
          </Bubble>
        </h2>
        {p.items.map((it) => (
          <div className="msg msg--rx" key={it.title}>
            <Bubble tail className="priv__bubble">
              <h3 className="priv__t">{it.title}</h3>
              <p>{it.body}</p>
            </Bubble>
          </div>
        ))}
        <div className="msg msg--rx priv__note-row">
          <Bubble tail className="priv__bubble priv__note">
            <NoteIcon className="priv__note-icon" />
            <p>{p.note}</p>
          </Bubble>
        </div>
      </div>
    </section>
  );
}
