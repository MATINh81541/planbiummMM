/*
 * PlanBium contact page.
 * Simple, elegant contact form with Liquid Glass styling.
 */

import { useState, type FormEvent } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { FluidBackground } from '@/components/FluidBackground';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/lib/i18n/locale-context';

export function ContactPage() {
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      // Placeholder: will be connected to an edge function or email service in a later prompt
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <FluidBackground variant="lime" />
      <div className="px-4 py-12 sm:py-16">
        <Container size="sm">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              {t('contact.title')}
            </h1>
            <p className="mt-3 text-lg text-gray-500">
              {t('contact.subtitle')}
            </p>
          </div>

          <GlassCard variant="strong" className="p-8 sm:p-10">
            {status === 'sent' ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <CheckCircle size={48} className="text-lime-600" aria-hidden="true" />
                <p className="text-lg font-medium text-gray-800">{t('contact.sent')}</p>
                <Button variant="ghost" size="md" onClick={() => setStatus('idle')}>
                  {t('common.back')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('contact.name')}
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/30 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('contact.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/30 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('contact.message')}
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/30 transition-colors resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-600">{t('contact.error')}</p>
                )}

                <Button type="submit" variant="primary" size="md" className="w-full" disabled={status === 'sending'}>
                  <Send size={18} className="rtl:rotate-180" aria-hidden="true" />
                  {status === 'sending' ? t('contact.sending') : t('contact.send')}
                </Button>
              </form>
            )}
          </GlassCard>
        </Container>
      </div>
    </>
  );
}
