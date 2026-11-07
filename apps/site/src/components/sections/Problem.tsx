import '@/app/sections-a.css';
import { en } from '@/content/en';
import { Bubble } from '@/components/world/Bubble';
import { DateSeparator } from '@/components/world/DateSeparator';

/**
 * S3: a short thread. The date separator is the heading, the two situations are received bubbles,
 * and the bridge is a sent bubble. Plain server markup; no motion here (the one authored moment is in S4).
 */
export function Problem() {
  const p = en.problem;
  return (
    <section id="problem" className="section" aria-labelledby="problem-h">
      <DateSeparator id="problem-h">{p.h2}</DateSeparator>
      <div className="problem-thread">
        {[p.alone, p.lawyer].map((msg) => (
          <Bubble key={msg.title} tail className="problem-msg">
            <h3>{msg.title}</h3>
            <p>{msg.body}</p>
          </Bubble>
        ))}
        <Bubble as="p" variant="sent" tail className="problem-bridge">
          {p.bridge}
        </Bubble>
      </div>
    </section>
  );
}
