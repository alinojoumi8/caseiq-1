import { en } from '@/content/en';
import { Hero } from '@/components/sections/Hero';
import { Problem } from '@/components/sections/Problem';
import { PileToTimeline } from '@/components/sections/PileToTimeline';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Founding } from '@/components/sections/Founding';
import { WhatYouGet } from '@/components/sections/WhatYouGet';
import { AskYourPapers } from '@/components/sections/AskYourPapers';
import { Limits } from '@/components/sections/Limits';
import { Privacy } from '@/components/sections/Privacy';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { ConversationSheet } from '@/components/sections/ConversationSheet';
import { FilmPlayerSlot } from '@/components/sections/FilmPlayerSlot';
import { SectionMotionSlot } from '@/components/sections/SectionMotionSlot';
import { ConversationProvider } from '@/components/ConversationContext';
import { FilmProvider } from '@/components/FilmContext';

// S0 (safety bar), S1 (nav) and S13 (footer) live in the root layout so they appear on every page.
// FAQPage JSON-LD arrives with the FAQ in Phase 2.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const jsonLd = [
  { '@context': 'https://schema.org', '@type': 'Organization', name: en.brand.name, ...(siteUrl ? { url: siteUrl } : {}) },
  { '@context': 'https://schema.org', '@type': 'WebSite', name: en.brand.name, inLanguage: 'en-CA', ...(siteUrl ? { url: siteUrl } : {}) },
];

export default function Home() {
  return (
    <ConversationProvider>
      <FilmProvider>
        <main id="main" tabIndex={-1}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
          />
          <Hero />
          <Problem />
          <PileToTimeline />
          <HowItWorks />
          <Founding />
          <WhatYouGet />
          <AskYourPapers />
          <Limits />
          <Privacy />
          <Faq />
          <FinalCta />
        </main>
        <SectionMotionSlot />
        <ConversationSheet />
        <FilmPlayerSlot />
      </FilmProvider>
    </ConversationProvider>
  );
}
