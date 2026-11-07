import type { Metadata } from 'next';
import { legal } from '@/content/legal';
import { LegalPage } from '@/components/sections/b/LegalPage';

export const metadata: Metadata = {
  title: legal.privacy.metaTitle,
  description: legal.privacy.metaDescription,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return <LegalPage page={legal.privacy} />;
}
