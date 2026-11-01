import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { CONTACT_URL } from '@/components/LegalPage';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with OpenSourceHub: questions, corrections, tool suggestions or partnership enquiries.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact"
      intro="Have a question, a correction, or a tool suggestion? Send us a message and we will get back to you."
    >
      <ContactForm />

      <h2>Other ways to reach us</h2>
      <p>
        To suggest a new tool, use the <Link href="/submit">Submit a Tool</Link> page. For public corrections or
        feature ideas, you can also open an issue on our{' '}
        <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">GitHub issues page</a>.
      </p>
      <p>
        Messages sent through this form are used only to read and reply to your enquiry. See our{' '}
        <Link href="/privacy">privacy policy</Link> for details.
      </p>
    </LegalPage>
  );
}
