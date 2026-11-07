'use client';

import { useState } from 'react';
import { Bubble } from '@/components/world/Bubble';
import { ChevronIcon } from '@/components/world/icons';
import type { FaqItem } from './faqJsonLd';

/**
 * The thread's questions. A closed question is an outlined quick-reply pill; when it opens it becomes the filled sent bubble
 * with its received answer below. Each question is a button inside a heading; its answer is a labelled region. Several can be open at once. Closed answers are inert, so they leave the tab order
 * and the accessibility tree.
 */
export function FaqAccordion({ items, headingLevel = 3 }: { items: readonly FaqItem[]; headingLevel?: 3 | 4 }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const H = headingLevel === 3 ? 'h3' : 'h4';

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="faq">
      {items.map((it) => {
        const isOpen = open.has(it.id);
        const btnId = `faq-q-${it.id}`;
        const panelId = `faq-a-${it.id}`;
        return (
          <div className="faq__item" data-open={isOpen} key={it.id}>
            <H className="faq__q">
              <button
                type="button"
                id={btnId}
                className="faq__btn"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(it.id)}
              >
                {isOpen ? (
                  <Bubble as="span" variant="sent" tail className="faq__bubble">
                    <span>{it.q}</span>
                    <span className="faq__chev">
                      <ChevronIcon dir="down" size={20} />
                    </span>
                  </Bubble>
                ) : (
                  <span className="faq__pill">
                    <span>{it.q}</span>
                    <span className="faq__chev">
                      <ChevronIcon dir="down" size={18} />
                    </span>
                  </span>
                )}
              </button>
            </H>
            <div id={panelId} role="region" aria-labelledby={btnId} className="faq__panel" data-open={isOpen} inert={!isOpen}>
              <div className="faq__panel-in">
                <div className="msg msg--rx">
                  <Bubble tail className="faq__a">
                    <p>{it.a}</p>
                  </Bubble>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
