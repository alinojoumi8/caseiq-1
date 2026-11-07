import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono, Source_Serif_4 } from 'next/font/google';
import { en } from '@/content/en';
import { BUILD_MODE, robotsMeta } from '@/lib/buildMode';
import { CaseTypeProvider } from '@/components/CaseTypeContext';
import { Q_MOTION } from '@/lib/motion/queries';
import { Footer } from '@/components/layout/Footer';
import { Nav } from '@/components/layout/Nav';
import { SafetyBar } from '@/components/layout/SafetyBar';
import { BackScroll } from '@/components/layout/BackScroll';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import './globals.css';

// Display 800 at about 78% width, body 400. The wdth axis is what makes the condensed headline.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz', 'wdth'],
  display: 'swap',
  variable: '--font-bricolage',
});

// Verbatim document text in product UI depictions.
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-serif',
});

// Page references, timestamps, figures.
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

// Runs while the browser parses the head, before the first paint. When motion is allowed it adds html.js-motion, which holds the
// hero intro's pieces in their start state (hero.css) so they never flash before hydration. The intro takes the class off when it
// starts. If it has not started 2.5s later (a script error, a slow connection) this does, and everything shows; so does a page that
// comes back from the back-forward cache. With no JavaScript, or with reduced motion, the class is never added.
const motionGate = `(function(){try{var d=document.documentElement;if(!matchMedia('${Q_MOTION}').matches)return;d.classList.add('js-motion');var off=function(){d.classList.remove('js-motion')};setTimeout(off,2500);addEventListener('pageshow',function(e){if(e.persisted)off()})}catch(e){}})()`;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL; // domain undecided: no canonical host is invented

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: en.meta.title,
  description: en.meta.description,
  alternates: { canonical: '/' },
  // The here.now preview is hidden from search engines. The default build adds no robots tag.
  ...(robotsMeta(BUILD_MODE) ? { robots: robotsMeta(BUILD_MODE) as string } : {}),
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: en.brand.name,
    title: en.meta.title,
    description: en.meta.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: en.meta.title,
    description: en.meta.description,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F2F2F5',
  // On Android the keyboard shrinks the layout, so the sheet's 100dvh and its composer stay above it.
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // suppressHydrationWarning: the gate above changes the html class before React hydrates.
    <html lang="en-CA" className={`${bricolage.variable} ${sourceSerif.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGate }} />
      </head>
      <body>
        <SmoothScroll />
        <BackScroll />
        <a className="skip-link" href="#main">
          {en.ui.skip}
        </a>
        <CaseTypeProvider>
          <header>
            <SafetyBar />
            <Nav />
          </header>
          {children}
          <Footer />
        </CaseTypeProvider>
      </body>
    </html>
  );
}
