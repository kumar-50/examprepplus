# Settings - Implementation Guide

## Quick Start

Simple settings page with two core features: Profile Management and Subscription Control.

---

## 🏗️ File Structure

```
src/
├── app/
│   └── dashboard/
│       └── settings/
│           ├── page.tsx                  (Main settings page - NEW)
│           └── actions.ts                (Server actions - NEW)
├── components/
│   └── settings/
│       ├── profile-settings-form.tsx     (NEW)
│       ├── avatar-upload.tsx             (NEW)
│       ├── password-change-modal.tsx     (NEW)
│       ├── subscription-card.tsx         (NEW)
│       ├── plan-selector.tsx             (NEW)
│       └── billing-history.tsx           (NEW)
└── lib/
    └── settings/
        └── subscription-utils.ts         (NEW - Helper functions)
```

---

## 📋 Implementation Steps

### Step 1: Create Settings Page Layout

**File:** `src/app/dashboard/settings/page.tsx`

```typescript
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form';
import { PasswordChangeModal } from '@/components/settings/password-change-modal';
import { SubscriptionCard } from '@/components/settings/subscription-card';

export const metadata: Metadata = {
  title: 'Settings | ExamPrepPlus',
  description: 'Manage your profile and subscription',
};

export default async function SettingsPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || '',
    phone: user.user_metadata?.phone || '',
    avatar_url: user.user_metadata?.avatar_url || '',
    target_exam: user.user_metadata?.target_exam || '',
    exam_date: user.user_metadata?.exam_date || '',
    email_verified: user.email_confirmed_at !== null,
  };

  // TODO: Fetch subscription data from database
  const subscription = {
    plan: 'free' as const,
    status: 'active' as const,
    billing_cycle: null,
    price: 0,
    next_billing_date: null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile and subscription
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSettingsForm profile={profile} />
          <PasswordChangeModal />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionCard subscription={subscription} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

### Step 2: Create Profile Settings Form

**File:** `src/components/settings/profile-settings-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from './avatar-upload';
import { toast } from 'sonner';

interface ProfileSettingsFormProps {
  profile: {
    id: string;
    email: string;
    name: string;
    phone: string;
    avatar_url: string;
    target_exam: string;
    exam_date: string;
    email_verified: boolean;
  };
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    phone: profile.phone,
    target_exam: profile.target_exam,
    exam_date: profile.exam_date,
    avatar_url: profile.avatar_url,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast.success('Profile updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div>
            <Label>Profile Picture</Label>
            <AvatarUpload
              currentUrl={formData.avatar_url}
              onUpload={(url) => setFormData({ ...formData, avatar_url: url })}
            />
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Input id="email" value={profile.email} disabled />
              {profile.email_verified ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  Not Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed directly. Contact support if needed.
            </p>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 1234567890"
            />
          </div>

          {/* Target Exam */}
          <div>
            <Label htmlFor="target_exam">Target Exam</Label>
            <Input
              id="target_exam"
              value={formData.target_exam}
              onChange={(e) => setFormData({ ...formData, target_exam: e.target.value })}
              placeholder="e.g., RRB NTPC 2026"
            />
          </div>

          {/* Exam Date */}
          <div>
            <Label htmlFor="exam_date">Exam Date</Label>
            <Input
              id="exam_date"
              type="date"
              value={formData.exam_date}
              onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

### Step 3: Create Avatar Upload Component

**File:** `src/components/settings/avatar-upload.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentUrl: string;
  onUpload: (url: string) => void;
}

export function AvatarUpload({ currentUrl, onUpload }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/settings/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { avatar_url } = await response.json();
      setPreview(avatar_url);
      onUpload(avatar_url);
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4 mt-2">
      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl text-white font-bold overflow-hidden">
        {preview ? (
          <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          'U'
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
        {preview && (
          <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
            Remove
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
```

---

### Step 4: Create Password Change Modal

**File:** `src/components/settings/password-change-modal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function PasswordChangeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.new_password !== formData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password,
        }),
      });

      if (!response.ok) throw new Error('Failed to change password');

      toast.success('Password changed successfully');
      setIsOpen(false);
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error('Failed to change password. Check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Manage your account security</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Password</Label>
            <p className="text-sm text-muted-foreground">
              Last changed: Never (using email login)
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Change Password</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and choose a new one
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="current">Current Password</Label>
                  <Input
                    id="current"
                    type="password"
                    value={formData.current_password}
                    onChange={(e) =>
                      setFormData({ ...formData, current_password: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new">New Password</Label>
                  <Input
                    id="new"
                    type="password"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) =>
                      setFormData({ ...formData, confirm_password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### Step 5: Create Subscription Card

**File:** `src/components/settings/subscription-card.tsx`

```typescript
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface SubscriptionCardProps {
  subscription: {
    plan: 'free' | 'premium' | 'pro';
    status: 'active' | 'cancelled' | 'expired';
    billing_cycle: 'monthly' | 'yearly' | null;
    price: number;
    next_billing_date: string | null;
  };
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const isFree = subscription.plan === 'free';

  const handleUpgrade = async () => {
    // TODO: Integrate Stripe Checkout
    window.location.href = '/api/settings/subscription/checkout?plan=premium&cycle=monthly';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            {isFree
              ? 'Upgrade to unlock all features'
              : `Next billing: ${subscription.next_billing_date}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFree ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold">Free Plan</h3>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>5 tests per day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Community support</span>
                  </li>
                </ul>
              </div>
              <Button onClick={handleUpgrade} className="w-full">
                Upgrade to Premium
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Premium Plan</h3>
                  <p className="text-muted-foreground">
                    ₹{subscription.price}/{subscription.billing_cycle}
                  </p>
                </div>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Unlimited tests</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Priority support</span>
                </li>
              </ul>
              <div className="flex gap-2">
                <Button variant="outline">Manage Subscription</Button>
                <Button variant="ghost">Cancel Plan</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      {isFree && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>Premium Monthly</CardTitle>
              <CardDescription>₹499/month</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Unlimited tests</li>
                <li>• Advanced analytics</li>
                <li>• Priority support</li>
              </ul>
              <Button className="w-full mt-4" onClick={handleUpgrade}>
                Select Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-blue-500">
            <Badge className="absolute top-2 right-2 bg-blue-500">Save 17%</Badge>
            <CardHeader>
              <CardTitle>Premium Yearly</CardTitle>
              <CardDescription>₹4,999/year</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Unlimited tests</li>
                <li>• Advanced analytics</li>
                <li>• Priority support</li>
              </ul>
              <Button className="w-full mt-4" onClick={handleUpgrade}>
                Select Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Testing Checklist

- [ ] Profile form saves correctly
- [ ] Avatar uploads to Supabase Storage
- [ ] Password change works with validation
- [ ] Subscription plan displays correctly
- [ ] Upgrade button navigates to checkout
- [ ] Email verification badge shows
- [ ] Form validation works
- [ ] Success/error toasts appear
- [ ] Responsive on mobile

---

## 🚀 Next Steps

1. Create API routes in `src/app/api/settings/`
2. Set up Supabase Storage bucket for avatars
3. Integrate Stripe for subscription checkout
4. Add email templates for password change
5. Test all flows end-to-end

---

**Status:** Implementation Guide Complete - Simple & Focused
