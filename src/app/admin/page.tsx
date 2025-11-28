import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, CreditCard, IndianRupee, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  users: { total: number };
  questions: { total: number; approved: number; pending: number; rejected: number };
  tests: { total: number; published: number; draft: number; free: number };
  subscriptions?: {
    totalUsers: number;
    activeSubscriptions: number;
    totalRevenue: number;
    freeUsers: number;
  };
}

async function getStats(): Promise<DashboardStats> {
  try {
    // Fetch both existing stats and subscription stats
    const [dashboardRes, subsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/dashboard/stats`, {
        cache: 'no-store',
      }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/stats`, {
        cache: 'no-store',
      }).catch(() => null),
    ]);
    
    const dashboardData = dashboardRes.ok ? await dashboardRes.json() : {
      users: { total: 0 },
      questions: { total: 0, approved: 0, pending: 0, rejected: 0 },
      tests: { total: 0, published: 0, draft: 0, free: 0 },
    };

    const subsData = subsRes?.ok ? await subsRes.json() : null;
    
    return {
      ...dashboardData,
      subscriptions: subsData?.success ? subsData.stats : undefined,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      users: { total: 0 },
      questions: { total: 0, approved: 0, pending: 0, rejected: 0 },
      tests: { total: 0, published: 0, draft: 0, free: 0 },
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your ExamPrepPlus platform
          </p>
        </div>
        <Link href="/admin/analytics">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Button>
        </Link>
      </div>

      {/* Subscription Stats - New Section */}
      {stats.subscriptions && (
        <>
          <h2 className="text-xl font-semibold mb-4">💰 Revenue & Subscriptions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.subscriptions.totalRevenue}</div>
                <p className="text-xs text-muted-foreground">All time earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.subscriptions.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">Active subscriptions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Free Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.subscriptions.freeUsers}</div>
                <p className="text-xs text-muted-foreground">On free tier</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.subscriptions.totalUsers
                    ? Math.round((stats.subscriptions.activeSubscriptions / stats.subscriptions.totalUsers) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Free to paid</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <h2 className="text-xl font-semibold mb-4">📊 Platform Stats</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Active platform users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground mt-2">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>Total question bank</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.questions.total}</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="default" className="text-xs">
                {stats.questions.approved} approved
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {stats.questions.pending} pending
              </Badge>
              {stats.questions.rejected > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.questions.rejected} rejected
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tests</CardTitle>
            <CardDescription>Available test templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.tests.total}</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="default" className="text-xs">
                {stats.tests.published} published
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {stats.tests.draft} draft
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
