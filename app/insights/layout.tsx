import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
