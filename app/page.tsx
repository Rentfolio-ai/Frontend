import { redirect } from 'next/navigation';

// Redirect root to dashboard since landing page is in separate repo
export default function HomePage() {
  redirect('/dashboard');
}