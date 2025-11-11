import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  users: { total: number };
  questions: { total: number; approved: number; pending: number; rejected: number };
  tests: { total: number; published: number; draft: number; free: number };
}

async function getStats(): Promise<DashboardStats> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/dashboard/stats`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    return await response.json();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your ExamPrepPlus platform
        </p>
      </div>

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
