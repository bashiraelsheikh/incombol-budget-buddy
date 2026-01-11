import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Wallet, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { startOfMonth, endOfMonth, format, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Budget() {
  const { profile } = useProfile();
  const { budgets, isLoading, addBudget, deleteBudget, isAdding } = useBudgets();
  const { categories } = useCategories('expense');
  const { transactions: allTransactions } = useTransactions('expense');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const currency = profile?.currency || 'USD';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'TRY' ? '₺' : '$';

  const formatAmount = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getSpentAmount = (categoryId: string, period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'weekly':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'yearly':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return allTransactions
      .filter(t => 
        t.category_id === categoryId &&
        new Date(t.date) >= startDate &&
        new Date(t.date) <= endDate
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    addBudget({
      amount: parseFloat(amount),
      category_id: categoryId,
      period,
    });

    setAmount('');
    setCategoryId('');
    setPeriod('monthly');
    setDialogOpen(false);
  };

  const availableCategories = categories.filter(
    cat => !budgets.some(b => b.category_id === cat.id)
  );

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + getSpentAmount(b.category_id, b.period), 0);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Budget</h1>
            <p className="text-muted-foreground mt-1">Set and track your spending limits</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-bg hover:opacity-90" disabled={availableCategories.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select value={period} onValueChange={(v) => setPeriod(v as 'weekly' | 'monthly' | 'yearly')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full gradient-bg" disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Budget
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-3xl font-bold font-display">{formatAmount(totalBudget)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className={cn("text-2xl font-bold", totalSpent > totalBudget ? "text-destructive" : "text-foreground")}>
                  {formatAmount(totalSpent)}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={(totalSpent / totalBudget) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {((totalSpent / totalBudget) * 100).toFixed(1)}% of total budget used
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Budget List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Budget Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const spent = getSpentAmount(budget.category_id, budget.period);
                  const percentage = (spent / Number(budget.amount)) * 100;
                  const isOverBudget = percentage > 100;
                  const isNearLimit = percentage >= 80 && percentage <= 100;

                  return (
                    <div
                      key={budget.id}
                      className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${budget.category?.color}20` }}
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: budget.category?.color }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{budget.category?.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{budget.period} budget</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isOverBudget && <AlertTriangle className="w-4 h-4 text-destructive" />}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={() => deleteBudget(budget.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className={cn(isOverBudget ? "text-destructive" : "text-foreground")}>
                            {formatAmount(spent)} spent
                          </span>
                          <span className="text-muted-foreground">
                            {formatAmount(Number(budget.amount))} budget
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className={cn(
                            "h-2",
                            isOverBudget && "[&>div]:bg-destructive",
                            isNearLimit && "[&>div]:bg-warning"
                          )} 
                        />
                        <p className={cn(
                          "text-xs",
                          isOverBudget ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {isOverBudget 
                            ? `${formatAmount(spent - Number(budget.amount))} over budget!`
                            : `${formatAmount(Number(budget.amount) - spent)} remaining`
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No budgets set yet</p>
                <p className="text-sm">Create your first budget to start tracking</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
