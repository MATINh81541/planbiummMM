/*
 * Contact form service.
 *
 * In demo mode, messages are stored in localStorage so the user sees real
 * feedback. When the backend is ready, replace the demo branch with a fetch
 * to a Supabase edge function or email API.
 */

import { appConfig } from '@/lib/config/env';
import { demoGet, demoSet, demoId } from '@/lib/services/demo/shared';

const STORAGE_KEY = 'contact_messages';

export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

export interface StoredContactMessage extends ContactMessageInput {
  id: string;
  createdAt: string;
}

export interface ContactValidationErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactMessage(input: ContactMessageInput): ContactValidationErrors {
  const errors: ContactValidationErrors = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'contact.error.name';
  }

  if (!input.email || !EMAIL_REGEX.test(input.email.trim())) {
    errors.email = 'contact.error.email';
  }

  if (!input.message || input.message.trim().length < 10) {
    errors.message = 'contact.error.message';
  }

  return errors;
}

export async function submitContactMessage(input: ContactMessageInput): Promise<StoredContactMessage> {
  const errors = validateContactMessage(input);
  if (Object.keys(errors).length > 0) {
    throw new ContactValidationError(errors);
  }

  if (appConfig.isDemo) {
    // TODO: Replace this localStorage demo storage with a real backend call
    // (e.g. Supabase edge function or email API) when the backend is ready.
    await new Promise((resolve) => setTimeout(resolve, 400));
    const messages = demoGet<StoredContactMessage[]>(STORAGE_KEY, []);
    const stored: StoredContactMessage = {
      id: demoId('msg'),
      name: input.name.trim(),
      email: input.email.trim(),
      message: input.message.trim(),
      createdAt: new Date().toISOString(),
    };
    messages.unshift(stored);
    demoSet(STORAGE_KEY, messages);
    return stored;
  }

  // TODO: Replace the demo branch above with a real fetch to the backend.
  // Example:
  //   const res = await fetch('/functions/v1/planbium-contact', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(input),
  //   });
  //   if (!res.ok) throw new Error('Failed to submit');
  //   return res.json();
  throw new Error('Contact submission is not configured outside demo mode');
}

export class ContactValidationError extends Error {
  constructor(public readonly errors: ContactValidationErrors) {
    super('Contact validation failed');
    this.name = 'ContactValidationError';
  }
}
