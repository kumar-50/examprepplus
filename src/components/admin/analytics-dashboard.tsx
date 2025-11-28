'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Activity,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { IndianRupee } from 'lucide-react';

interface AnalyticsData {
  metrics: {
    totalInitiated: number;
    totalSuccess: number;
    totalFailed: number;
    conversionRate: number;
    failureRate: number;
  };
  revenueByMethod: Array<{ method: string; amount: number }>;
  dailyRevenue: Array<{ date: string; amount: number }>;
  failureReasons: Array<{ reason: string; count: number }>;
  recentEvents: Array<{
    id: string;
    event: string;
    amount: number | null;
    paymentMethod: string | null;
    timestamp: string;
    errorMessage: string | null;
  }>;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      const result = await response.json();

      if (result.success) {
        setData(result);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load analytics',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No analytics data available
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = data.revenueByMethod.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.totalInitiated}</div>
            <p className="text-xs text-muted-foreground">
              Payment attempts (last 30 days)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.metrics.conversionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.metrics.totalSuccess} successful payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.metrics.failureRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.metrics.totalFailed} failed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From successful payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="failures">Failures</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue by Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {data.revenueByMethod.length > 0 ? (
                  <div className="space-y-3">
                    {data.revenueByMethod.map((item) => (
                      <div key={item.method} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium capitalize">
                            {item.method}
                          </span>
                        </div>
                        <span className="text-sm font-bold">
                          ₹{item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No payment method data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Daily Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {data.dailyRevenue.length > 0 ? (
                  <div className="space-y-3">
                    {data.dailyRevenue.map((item) => (
                      <div key={item.date} className="flex items-center justify-between">
                        <span className="text-sm">{item.date}</span>
                        <span className="text-sm font-bold">
                          ₹{item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No daily revenue data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="failures">
          <Card>
            <CardHeader>
              <CardTitle>Top Failure Reasons</CardTitle>
              <CardDescription>Most common payment failures</CardDescription>
            </CardHeader>
            <CardContent>
              {data.failureReasons.length > 0 ? (
                <div className="space-y-3">
                  {data.failureReasons.map((item) => (
                    <div key={item.reason} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{item.reason}</span>
                      </div>
                      <Badge variant="destructive">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No failure data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payment Events</CardTitle>
              <CardDescription>Last 20 events</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentEvents.length > 0 ? (
                <div className="space-y-3">
                  {data.recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between border-b pb-3 last:border-0"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {event.event === 'payment_success' && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {event.event === 'payment_failed' && (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          {event.event === 'payment_initiated' && (
                            <Activity className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="text-sm font-medium capitalize">
                            {event.event.replace('_', ' ')}
                          </span>
                        </div>
                        {event.amount && (
                          <p className="text-sm text-muted-foreground">
                            Amount: ₹{event.amount.toLocaleString()}
                          </p>
                        )}
                        {event.paymentMethod && (
                          <p className="text-xs text-muted-foreground">
                            Method: {event.paymentMethod}
                          </p>
                        )}
                        {event.errorMessage && (
                          <p className="text-xs text-red-600">{event.errorMessage}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent events
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
