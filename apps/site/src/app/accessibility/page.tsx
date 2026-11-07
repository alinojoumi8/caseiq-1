import type { Metadata } from 'next';
import { legal } from '@/content/legal';
import { LegalPage } from '@/components/sections/b/LegalPage';

export const metadata: Metadata = {
  title: legal.accessibility.metaTitle,
  description: legal.accessibility.metaDescription,
  alternates: { canonical: '/accessibility' },
};

export default function AccessibilityPage() {
  return <LegalPage page={legal.accessibility} />;
}
