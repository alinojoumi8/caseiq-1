// Draft text for /privacy, /terms and /accessibility.
// NOT IN DECK: the copy deck has no text for these pages. Every string here is a working draft written from the deck's limits,
// the build brief and the forms as built. Counsel must review all of it before launch.
// Items marked "To be confirmed" are decisions the founder has not made yet.
// Keep this file free of imports so scripts/copy-lint.mjs can load it directly.

export interface LegalSection {
  h: string;
  paras?: readonly string[];
  items?: readonly string[];
  /** Marks an open decision. It is shown with a visible "To be confirmed" label. */
  tbc?: boolean;
}

export interface LegalPageContent {
  slug: 'privacy' | 'terms' | 'accessibility';
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: readonly LegalSection[];
}

export const legal = {
  banner: {
    title: 'Draft, pending legal review',
    body: 'This page is a working draft. It is not final until a lawyer has reviewed it.',
  },
  tbc: 'To be confirmed',
  // {entityLine}, {contactLine} and {addressLine} in a paragraph are filled from src/content/site.ts. While a contact or address value is unset the "to be confirmed" line shows instead.
  // {entityLine} is left out while siteConfig.legalEntity is unset.
  entityLine: '{entity} runs this website.',
  contactLine: 'Write to {email}.',
  contactTbc: 'Our contact email address is to be confirmed.',
  addressLine: 'Our mailing address is {address}.',
  addressTbc: 'Our mailing address is to be confirmed.',
  updated: 'Draft of 31 October 2026',
  back: 'Back to the home page',

  privacy: {
    slug: 'privacy',
    metaTitle: 'Privacy notice (draft) | Case IQ',
    metaDescription: 'What the Case IQ forms collect, why, and where it goes. A draft pending legal review.',
    h1: 'Privacy notice',
    intro:
      'This notice covers the two forms on this website: the request form and the early-access list. It does not cover the papers you may send us later if we work together. We will give you a separate notice for those.',
    sections: [
      {
        h: 'What the request form collects',
        items: [
          'What your case is about, where it is, whether a date is coming up, whether you have a lawyer or paralegal, and how much paper there is.',
          'Your first name and your email address.',
          'Your phone number, if you give one.',
          'How you would like us to reach you, and whether it is safe to leave a voicemail or text.',
          'Whether you agreed to the privacy notice, whether you agreed to occasional updates, and the time you agreed.',
        ],
      },
      {
        h: 'What the early-access list collects',
        items: [
          'Your email address and your province or territory.',
          'Your preferred language, if you give one.',
          'Whether you are a lawyer or paralegal.',
          'The case type you picked on the request form, if you came from there.',
          'Whether you agreed to launch emails, and the time you agreed.',
        ],
      },
      {
        h: 'Why we collect it',
        items: [
          'To reply to your request, the way you asked.',
          'To decide how we can help you and to prepare for our first conversation.',
          'To email you when Case IQ opens in your province, or to send occasional updates, only if you ticked the box for that.',
          'To keep a record that you agreed, and which wording you saw.',
        ],
      },
      {
        h: 'Where it goes',
        paras: [
          'Your answers are sent to a Case IQ team inbox through an email delivery service. People on our team read them there.',
          'We do not share your answers with anyone else, except services that deliver or store them for us, or when a court or the law requires it.',
        ],
      },
      {
        h: 'Where it is stored',
        paras: ['To be confirmed. We have not yet chosen where this information is stored, or in which country.'],
        tbc: true,
      },
      {
        h: 'How long we keep it',
        paras: ['To be confirmed. We have not yet set how long we keep request and early-access information.'],
        tbc: true,
      },
      {
        h: 'AI services',
        paras: [
          'To be confirmed. We have not yet chosen the AI services we will use for papers, and this notice will name them before we ask for any. The two forms on this website do not send your answers to an AI service.',
        ],
        tbc: true,
      },
      {
        h: 'Cookies and tracking',
        paras: [
          'This website does not use analytics services, advertising trackers or third-party scripts. If that changes, we will update this notice first.',
        ],
      },
      {
        h: 'Your choices',
        items: [
          'You can ask to see what we hold about you, to correct it, or to have it deleted.',
          'You can unsubscribe from updates or launch emails at any time, using the link in the email or by writing to us.',
          'If you are in a legal proceeding, you may need to keep your documents. Ask a lawyer or legal clinic before deleting anything.',
        ],
      },
      {
        h: 'Quick exit',
        paras: [
          'Sharing a device, or need to leave fast? Quick exit, at the top of every page, takes you to another site.',
        ],
      },
      {
        h: 'Contact',
        paras: ['{entityLine}', '{contactLine}', '{addressLine}'],
      },
    ],
  },

  // The here.now preview (npm run build:herenow) saves answers with here.now instead of sending them by email, so three
  // sections of the privacy notice read differently there. Each entry replaces the privacy section with the same heading `h`.
  // src/lib/legalPage.ts picks the variant by build mode. Every other section stays as it is.
  privacyHerenow: {
    sections: [
      {
        h: 'Where it goes',
        paras: [
          'Your answers are saved with here.now, the service that hosts this website. People on our team read them there.',
          'We do not share your answers with anyone else, except services that store them for us, or when a court or the law requires it.',
        ],
      },
      {
        h: 'Where it is stored',
        paras: [
          'To be confirmed. Your answers are stored by here.now, the service that hosts this website. We have not yet confirmed in which country.',
        ],
        tbc: true,
      },
      {
        h: 'Cookies and tracking',
        paras: [
          "This website does not use cookies, advertising trackers or third-party scripts. The service that hosts it, here.now, gives us visit counts: pages viewed, countries, and the sites visitors came from. It doesn't show us your IP address. If that changes, we will update this notice first.",
        ],
      },
    ],
  },

  terms: {
    slug: 'terms',
    metaTitle: 'Terms (draft) | Case IQ',
    metaDescription: 'Short terms for using the Case IQ website. A draft pending legal review.',
    h1: 'Terms',
    intro: 'These are short terms for using this website. Separate terms will apply if we work together.',
    sections: [
      {
        h: 'What Case IQ is',
        paras: [
          'Case IQ is not a law firm and does not provide legal advice. We help you organize your documents and prepare information for your lawyer.',
          'We are not lawyers or paralegals.',
        ],
      },
      {
        h: 'What we do not do',
        items: [
          'Give legal advice',
          'Tell you what to do, or how your case will go',
          'Decide who’s telling the truth',
          'Write or file court documents',
          'Speak for you at a hearing',
          'Stand in for a lawyer',
        ],
      },
      {
        h: 'What we do',
        paras: ['We organize your papers, so you can find, check and explain what’s in them.'],
      },
      {
        h: 'Examples on this website',
        paras: [
          'All examples on this website are made up. Any resemblance to real people or businesses is a coincidence. They show how Case IQ works. They are not a promise of what we will find in your papers.',
        ],
      },
      {
        h: 'Information on this website',
        paras: [
          'This website gives general information only. Statistics and court quotes on it link to their sources. Check the source before you rely on it, and ask a lawyer or legal clinic about your own case.',
          'We cannot promise that a court or tribunal will accept papers organized with Case IQ. Courts decide what they accept, and each has its own rules.',
        ],
      },
      {
        h: 'Free and low-cost legal help',
        paras: [
          'The services listed on this website are run by other organizations. We are not connected with them and we are not responsible for their content.',
        ],
      },
      {
        h: 'Using the forms',
        paras: [
          'Please do not put private details in the forms. We will ask for what we need when we talk. Only share papers you have a right to have and use.',
          'A request form is not a contract. A person on our team will reply, and we will talk before anything starts.',
        ],
      },
      {
        h: 'Changes',
        paras: ['We may change these terms. The date of the latest draft is at the top of this page.'],
      },
      {
        h: 'Contact',
        paras: ['{entityLine}', '{contactLine}', '{addressLine}'],
      },
    ],
  },

  accessibility: {
    slug: 'accessibility',
    metaTitle: 'Accessibility | Case IQ',
    metaDescription: 'How Case IQ aims to meet WCAG 2.2 AA, and how to tell us about a problem. A draft pending legal review.',
    h1: 'Accessibility',
    intro: 'We aim for this website to meet the Web Content Accessibility Guidelines (WCAG) 2.2, level AA.',
    sections: [
      {
        h: 'What we have built in',
        items: [
          'You can use every part of the website with a keyboard, and the focus ring is always visible.',
          'Text and controls are designed to meet WCAG contrast ratios, and colour is never the only signal.',
          'The website works on a small phone screen and when you zoom the page to 200%.',
          'Motion is turned off, and every state shows at once, if your device asks for reduced motion.',
          'Forms have labels, error messages that name the problem, and a summary of errors that is read aloud.',
          'Quick exit is the first control after the skip link on every page.',
        ],
      },
      {
        h: 'What we have not finished',
        paras: [
          'To be confirmed. We have not yet had the website tested by people who use assistive technology, and we have not yet completed a full audit. We will list what we find here.',
        ],
        tbc: true,
      },
      {
        h: 'Tell us about a problem',
        paras: [
          'If something on this website is hard to use, tell us the page, what you tried to do, and what got in the way. Tell us the device and any assistive technology you use, if you can.',
          '{contactLine}',
          'If you prefer to tell us another way, say so in your message and we will arrange it.',
        ],
      },
    ],
  },
} as const;

export type Legal = typeof legal;
