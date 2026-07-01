import { redirect } from 'next/navigation';

// Bare root — middleware handles language detection and redirects here first.
// This is a fallback for environments where middleware is bypassed.
export default function Root() {
  redirect('/en');
}
