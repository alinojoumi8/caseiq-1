import { en } from '@/content/en';
import { faqItems } from '@/lib/placeholders';
import { FaqAccordion } from './b/FaqAccordion';
import { buildFaqJsonLd, serializeJsonLd } from './b/faqJsonLd';
import '@/app/sections-b.css';

/** S11. The thread continues: each question is a sent bubble that opens its answer as a received bubble. FAQPage JSON-LD comes from the same items. */
export function Faq() {
  const items = faqItems(en.faq.items);
  return (
    <section id="faq" className="section faq-sec" aria-labelledby="faq-h">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFaqJsonLd(items)) }} />
      <h2 id="faq-h" className="h-section">{en.faq.h2}</h2>
      <div className="faq-wrap">
        <FaqAccordion items={items} />
      </div>
    </section>
  );
}
