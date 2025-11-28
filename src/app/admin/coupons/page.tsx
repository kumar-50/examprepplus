'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  Tag,
  Copy,
  Check,
  Percent,
  IndianRupee,
  Users,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PromoCode {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicablePlanId: string | null;
  applicablePlanIds: string[] | null;
  applicablePlanNames: string;
  maxUses: number | null;
  currentUses: number;
  maxUsesPerUser: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  isGlobal: boolean;
  appliedBy: 'admin' | 'user';
  createdAt: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

interface PromoFormData {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicablePlanIds: string[];
  maxUses: string;
  maxUsesPerUser: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isGlobal: boolean;
  appliedBy: 'admin' | 'user';
}

const initialFormData: PromoFormData = {
  code: '',
  name: '',
  description: '',
  discountType: 'percentage',
  discountValue: 10,
  applicablePlanIds: [],
  maxUses: '',
  maxUsesPerUser: '1',
  validFrom: '',
  validUntil: '',
  isActive: true,
  isGlobal: false,
  appliedBy: 'user',
};

export default function CouponsPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [deletingPromo, setDeletingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<PromoFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Fetch promo codes
  useEffect(() => {
    fetchPromoCodes();
    fetchPlans();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await fetch('/api/admin/promo-codes');
      const data = await response.json();
      
      if (data.success) {
        setPromoCodes(data.promoCodes);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch promo codes',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch promo codes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleCreate = () => {
    setEditingPromo(null);
    setFormData(initialFormData);
    setIsSheetOpen(true);
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      name: promo.name,
      description: promo.description || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      applicablePlanIds: promo.applicablePlanIds || [],
      maxUses: promo.maxUses?.toString() || '',
      maxUsesPerUser: promo.maxUsesPerUser?.toString() || '1',
      validFrom: promo.validFrom ? format(new Date(promo.validFrom), "yyyy-MM-dd'T'HH:mm") : '',
      validUntil: promo.validUntil ? format(new Date(promo.validUntil), "yyyy-MM-dd'T'HH:mm") : '',
      isActive: promo.isActive,
      isGlobal: promo.isGlobal || false,
      appliedBy: promo.appliedBy || 'user',
    });
    setIsSheetOpen(true);
  };

  const handleDelete = (promo: PromoCode) => {
    setDeletingPromo(promo);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingPromo) return;
    
    try {
      const response = await fetch(`/api/admin/promo-codes/${deletingPromo.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: data.deactivated 
            ? 'Promo code was deactivated (it has been used)'
            : 'Promo code deleted successfully',
        });
        fetchPromoCodes();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete promo code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete promo code',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingPromo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        applicablePlanIds: formData.applicablePlanIds.length > 0 ? formData.applicablePlanIds : null,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        maxUsesPerUser: formData.maxUsesPerUser ? Number(formData.maxUsesPerUser) : 1,
        validFrom: formData.validFrom || null,
        validUntil: formData.validUntil || null,
        isActive: formData.isActive,
        isGlobal: formData.isGlobal,
        appliedBy: formData.appliedBy,
      };

      const url = editingPromo 
        ? `/api/admin/promo-codes/${editingPromo.id}`
        : '/api/admin/promo-codes';
      
      const response = await fetch(url, {
        method: editingPromo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: editingPromo 
            ? 'Promo code updated successfully'
            : 'Promo code created successfully',
        });
        setIsSheetOpen(false);
        fetchPromoCodes();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save promo code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save promo code',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      const response = await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: `Promo code ${promo.isActive ? 'deactivated' : 'activated'}`,
        });
        fetchPromoCodes();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update promo code',
        variant: 'destructive',
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getDiscountDisplay = (promo: PromoCode) => {
    if (promo.discountType === 'percentage') {
      return `${promo.discountValue}%`;
    }
    return `₹${promo.discountValue}`;
  };

  const getUsageDisplay = (promo: PromoCode) => {
    if (promo.maxUses) {
      return `${promo.currentUses} / ${promo.maxUses}`;
    }
    return `${promo.currentUses} / ∞`;
  };

  const isExpired = (promo: PromoCode) => {
    if (!promo.validUntil) return false;
    return new Date(promo.validUntil) < new Date();
  };

  // Stats
  const stats = {
    total: promoCodes.length,
    active: promoCodes.filter(p => p.isActive && !isExpired(p)).length,
    totalUsed: promoCodes.reduce((sum, p) => sum + p.currentUses, 0),
    expired: promoCodes.filter(p => isExpired(p)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promo Codes</h1>
          <p className="text-muted-foreground">
            Manage discount codes and promotional offers
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Promo Code
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Redemptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.totalUsed}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{stats.expired}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promo Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Promo Codes</CardTitle>
          <CardDescription>
            Click on a code to copy it to clipboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : promoCodes.length === 0 ? (
            <div className="text-center py-10">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No promo codes yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first promo code to offer discounts
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Promo Code
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Applicable To</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <button
                          onClick={() => copyCode(promo.code)}
                          className="flex items-center gap-2 font-mono font-bold hover:text-primary transition-colors"
                        >
                          {promo.code}
                          {copiedCode === promo.code ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        {promo.isGlobal && promo.appliedBy === 'admin' && (
                          <Badge variant="secondary" className="ml-2 text-xs">Global</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{promo.name}</p>
                          {promo.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {promo.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {promo.discountType === 'percentage' ? (
                            <Percent className="h-3 w-3 mr-1" />
                          ) : (
                            <IndianRupee className="h-3 w-3 mr-1" />
                          )}
                          {getDiscountDisplay(promo)} OFF
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {promo.applicablePlanNames}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{getUsageDisplay(promo)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {promo.validUntil ? (
                          <span className={`text-sm ${isExpired(promo) ? 'text-red-500' : ''}`}>
                            {format(new Date(promo.validUntil), 'MMM d, yyyy')}
                            {isExpired(promo) && ' (Expired)'}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No expiry</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={promo.isActive}
                          onCheckedChange={() => handleToggleActive(promo)}
                          disabled={isExpired(promo)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(promo)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(promo)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
            </SheetTitle>
            <SheetDescription>
              {editingPromo 
                ? 'Update the promo code details'
                : 'Create a new promotional discount code'
              }
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER50"
                required
              />
              <p className="text-xs text-muted-foreground">
                Code will be automatically converted to uppercase
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Summer Sale"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Special discount for summer season..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setFormData({ ...formData, discountType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">Discount Value *</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="1"
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Applicable Plans</Label>
              <div className="space-y-2 rounded-md border p-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-plans"
                    checked={formData.applicablePlanIds.length === 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({ ...formData, applicablePlanIds: [] });
                      }
                    }}
                  />
                  <label htmlFor="all-plans" className="text-sm font-medium cursor-pointer">
                    All Plans
                  </label>
                </div>
                <div className="border-t my-2" />
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`plan-${plan.id}`}
                      checked={formData.applicablePlanIds.includes(plan.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ 
                            ...formData, 
                            applicablePlanIds: [...formData.applicablePlanIds, plan.id] 
                          });
                        } else {
                          setFormData({ 
                            ...formData, 
                            applicablePlanIds: formData.applicablePlanIds.filter(id => id !== plan.id) 
                          });
                        }
                      }}
                    />
                    <label htmlFor={`plan-${plan.id}`} className="text-sm cursor-pointer">
                      {plan.name} (₹{plan.price / 100})
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select specific plans or leave unchecked for all plans
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses (Total)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUsesPerUser">Max Uses Per User</Label>
                <Input
                  id="maxUsesPerUser"
                  type="number"
                  min="1"
                  value={formData.maxUsesPerUser}
                  onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Enable or disable this promo code
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            {/* Global Promo Settings */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-sm">Global Promo Settings</h4>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label>Global Promo</Label>
                  <p className="text-xs text-muted-foreground">
                    Show this promo on the pricing table automatically
                  </p>
                </div>
                <Switch
                  checked={formData.isGlobal}
                  onCheckedChange={(checked) => setFormData({ ...formData, isGlobal: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appliedBy">Applied By</Label>
                <Select
                  value={formData.appliedBy}
                  onValueChange={(value: 'admin' | 'user') => 
                    setFormData({ ...formData, appliedBy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin (Auto-applied to pricing)</SelectItem>
                    <SelectItem value="user">User (User must enter code)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.appliedBy === 'admin' 
                    ? 'Discount will be automatically shown on pricing table'
                    : 'Users will need to enter the promo code manually'
                  }
                </p>
              </div>
            </div>

            <SheetFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingPromo ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingPromo ? 'Update' : 'Create'
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promo Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the promo code "{deletingPromo?.code}"?
              {deletingPromo && deletingPromo.currentUses > 0 && (
                <span className="block mt-2 text-amber-600">
                  Note: This code has been used {deletingPromo.currentUses} time(s). 
                  It will be deactivated instead of deleted.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
