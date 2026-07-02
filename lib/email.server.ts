// lib/email.server.ts — SERVER ONLY. Never import client-side.
// Thin Resend wrapper. Falls back to console.log when RESEND_API_KEY is absent
// so local dev works without credentials.
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM || 'CoNa Adventures <noreply@conaadventures.com>';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export type SendEmailResult =
  | { ok: true; mock: true }
  | { ok: true; id: string | undefined }
  | { ok: false; error: string };

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<SendEmailResult> {
  if (!resend) {
    console.log('[email dev fallback]', { to, subject });
    console.log(html.replace(/<[^>]+>/g, '').trim().slice(0, 400));
    return { ok: true, mock: true };
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) throw new Error(error.message);
    return { ok: true, id: data?.id };
  } catch (e) {
    console.error('sendEmail failed:', (e as Error).message);
    return { ok: false, error: (e as Error).message };
  }
}
