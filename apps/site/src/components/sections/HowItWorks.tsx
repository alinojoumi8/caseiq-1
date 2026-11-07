import '@/app/sections-a.css';
import { en } from '@/content/en';
import { Bubble } from '@/components/world/Bubble';
import { PinIcon } from '@/components/world/icons';
import { stepBody } from '@/lib/placeholders';

/**
 * S5: four numbered messages (a real sequence, so the numerals carry information),
 * and "Start tonight" as a quiet pinned note. On wide screens the heading and note sit beside the steps.
 */
export function HowItWorks() {
  return (
    <section id="how" className="section" aria-labelledby="how-h">
      <div className="how">
        <div className="how__head">
          <h2 id="how-h" className="h-section">
            {en.how.h2}
          </h2>
        </div>

        <ol className="how__steps">
          {en.how.steps.map((step, i) => (
            <li key={step.title} className="how-step">
              <span className="how-step__n" aria-hidden="true">
                {i + 1}
              </span>
              <Bubble tail className="how-step__bubble">
                <h3>
                  <span className="sr-only">{i + 1}. </span>
                  {step.title}
                </h3>
                <p>{stepBody(step)}</p>
              </Bubble>
            </li>
          ))}
        </ol>

        <aside className="note" aria-labelledby="tonight-h">
          <span className="note__pin" aria-hidden="true">
            <PinIcon size={16} />
          </span>
          <h3 id="tonight-h">{en.tonight.title}</h3>
          <ul>
            {en.tonight.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
