import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Dashboard | ExamPrepPlus',
  description: 'Your ExamPrepPlus dashboard',
}

export default async function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">
          Your personalized exam preparation dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/tests">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>My Tests</CardTitle>
              <CardDescription>View and manage your practice tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">📝</div>
              <p className="text-sm text-muted-foreground mt-2">Start practicing now!</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/progress">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>Track your learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">📊</div>
              <p className="text-sm text-muted-foreground mt-2">View your exam readiness</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed performance insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">📈</div>
              <p className="text-sm text-muted-foreground mt-2">Analyze your performance</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/practice">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Practice Mode</CardTitle>
              <CardDescription>Smart practice with AI recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">🎯</div>
              <p className="text-sm text-muted-foreground mt-2">Practice weak topics</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">Free Plan</div>
            <p className="text-sm text-muted-foreground mt-2">Upgrade for unlimited access</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
