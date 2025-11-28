import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/server';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';

export const metadata: Metadata = {
  title: 'Analytics | ExamPrepPlus Admin',
  description: 'Payment analytics and conversion metrics',
};

export default async function AnalyticsPage() {
  // This will throw and redirect if not admin
  await requireAdmin();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Analytics</h1>
          <p className="text-muted-foreground">
            Track payment conversions, revenue, and trends
          </p>
        </div>

        <AnalyticsDashboard />
      </div>
    </div>
  );
}
