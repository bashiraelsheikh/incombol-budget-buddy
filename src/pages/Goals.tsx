import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useGoals } from '@/hooks/useGoals';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Loader2, Trash2, Calendar, PlusCircle, CheckCircle2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const colorOptions = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
  '#06B6D4', '#EF4444', '#84CC16', '#6366F1', '#F97316',
];

export default function Goals() {
  const { profile } = useProfile();
  const { goals, isLoading, addGoal, updateGoal, deleteGoal, addToGoal, isAdding } = useGoals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addFundsDialogOpen, setAddFundsDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#10B981');

  const currency = profile?.currency || 'USD';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'TRY' ? '₺' : '$';

  const formatAmount = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setDeadline('');
    setColor('#10B981');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a goal name');
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    addGoal({
      name: name.trim(),
      target_amount: parseFloat(targetAmount),
      current_amount: 0,
      deadline: deadline || null,
      icon: 'target',
      color,
    });

    resetForm();
    setDialogOpen(false);
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (selectedGoalId) {
      addToGoal({ id: selectedGoalId, amount: parseFloat(fundAmount) });
    }

    setFundAmount('');
    setSelectedGoalId(null);
    setAddFundsDialogOpen(false);
  };

  const openAddFundsDialog = (goalId: string) => {
    setSelectedGoalId(goalId);
    setAddFundsDialogOpen(true);
  };

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Goals</h1>
            <p className="text-muted-foreground mt-1">Set and track your savings goals</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-bg hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Emergency Fund"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
                    <Input
                      id="target"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full transition-all ${
                          color === c ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-bg" disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Goal
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Add Funds Dialog */}
        <Dialog open={addFundsDialogOpen} onOpenChange={setAddFundsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Funds to Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddFunds} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="fundAmount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
                  <Input
                    id="fundAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-bg">
                Add Funds
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Overview Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-3xl font-bold font-display">{formatAmount(totalSaved)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Target</p>
                <p className="text-2xl font-bold text-muted-foreground">{formatAmount(totalTarget)}</p>
              </div>
            </div>
            {totalTarget > 0 && (
              <div className="mt-4">
                <Progress value={(totalSaved / totalTarget) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {((totalSaved / totalTarget) * 100).toFixed(1)}% of total goals achieved
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : goals.length > 0 ? (
            goals.map((goal) => {
              const percentage = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
              const isCompleted = percentage >= 100;
              const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;

              return (
                <Card key={goal.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6" style={{ color: goal.color }} />
                          ) : (
                            <Target className="w-6 h-6" style={{ color: goal.color }} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{goal.name}</h3>
                          {goal.deadline && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {daysLeft !== null && daysLeft > 0 ? `${daysLeft} days left` : format(new Date(goal.deadline), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{formatAmount(Number(goal.current_amount))}</span>
                        <span className="text-muted-foreground">{formatAmount(Number(goal.target_amount))}</span>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-2"
                        style={{ '--progress-color': goal.color } as React.CSSProperties}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% complete
                        </span>
                        {!isCompleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => openAddFundsDialog(goal.id)}
                          >
                            <PlusCircle className="w-3 h-3 mr-1" />
                            Add Funds
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No goals set yet</p>
                  <p className="text-sm">Create your first savings goal to get started</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
