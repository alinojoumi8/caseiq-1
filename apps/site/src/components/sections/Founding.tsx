import Image from 'next/image';
import '@/app/sections-a.css';
import { en } from '@/content/en';
import { ArrowRightIcon } from '@/components/world/icons';
import { foundingPoints } from '@/lib/placeholders';

/**
 * S6: one calm white card message. Heading, body, three points, the indigo pill call to action
 * and the early-access link. The founder-note slot renders nothing until real content exists.
 */
export function Founding() {
  const f = en.founding;
  const person = f.person;
  return (
    <section id="founding" className="section" aria-labelledby="founding-h">
      <div className="founding-card">
        <div>
          <h2 id="founding-h" className="h-section">
            {f.h2}
          </h2>
          <p className="founding__body">{f.body}</p>
          {person ? (
            <figure className="founder">
              {person.photo ? <Image src={person.photo} alt="" width={56} height={56} /> : null}
              <figcaption>
                <b>{person.name}</b>
                <p>{person.note}</p>
              </figcaption>
            </figure>
          ) : null}
        </div>
        <div>
          <ul className="founding__points">
            {foundingPoints(f.points).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <div className="founding__cta">
            <a className="send" href="#start" data-cta="founding">
              {f.cta}
              <span className="send__arrow">
                <ArrowRightIcon />
              </span>
            </a>
          </div>
          <p className="founding__alt">
            {f.alt.text}{' '}
            <a className="link" href="#waitlist" data-cta="founding">
              {f.alt.link}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
