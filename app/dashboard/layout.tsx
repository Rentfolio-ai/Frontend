import DashboardLayout from '@/components/layout/DashboardLayout';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { ToastProvider } from '@/contexts/ToastContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SubscriptionProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </SubscriptionProvider>
    </ToastProvider>
  );
}
