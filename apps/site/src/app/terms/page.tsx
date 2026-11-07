import type { Metadata } from 'next';
import { legal } from '@/content/legal';
import { LegalPage } from '@/components/sections/b/LegalPage';

export const metadata: Metadata = {
  title: legal.terms.metaTitle,
  description: legal.terms.metaDescription,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return <LegalPage page={legal.terms} />;
}
