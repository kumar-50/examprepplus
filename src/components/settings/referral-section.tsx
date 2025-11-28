'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, Gift, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  rewardedReferrals: number;
}

export function ReferralSection({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referrals/code');
      const data = await response.json();

      if (data.success) {
        setStats(data);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load referral stats',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load referral stats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card id="referral">
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card id="referral">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Referral Program
        </CardTitle>
        <CardDescription>
          Invite friends and earn rewards when they subscribe to a premium plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Code */}
        <div className="space-y-2">
          <Label>Your Referral Code</Label>
          <div className="flex gap-2">
            <Input
              value={stats.referralCode}
              readOnly
              className="font-mono text-lg"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(stats.referralCode)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <Label>Your Referral Link</Label>
          <div className="flex gap-2">
            <Input
              value={stats.referralLink}
              readOnly
              className="text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(stats.referralLink)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Total Referrals
            </div>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingReferrals}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.completedReferrals}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Rewarded</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.rewardedReferrals}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <h4 className="font-semibold text-sm">How it works</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Share your referral code or link with friends</li>
            <li>• They sign up using your code</li>
            <li>• When they purchase a premium plan, you both get rewards!</li>
            <li>• Earn 1 free month for every 5 successful referrals</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
