import { AppLayout } from '@/components/layout/AppLayout';
import { useGoals } from '@/hooks/useGoals';
import { useStats, useMonthlyData } from '@/hooks/useStats';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PiggyBank, TrendingUp, Target, Loader2, ArrowUpRight, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Savings() {
  const { profile } = useProfile();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { stats, isLoading: statsLoading } = useStats();
  const { monthlyData } = useMonthlyData();

  const currency = profile?.currency || 'USD';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'TRY' ? '₺' : '$';

  const formatAmount = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const monthlySavings = stats ? stats.totalIncome - stats.totalExpenses : 0;
  const savingsRate = stats && stats.totalIncome > 0 ? (monthlySavings / stats.totalIncome) * 100 : 0;

  const savingsTrend = monthlyData.map(m => ({
    month: m.month,
    savings: m.income - m.expenses,
  }));

  const completedGoals = goals.filter(g => Number(g.current_amount) >= Number(g.target_amount));
  const activeGoals = goals.filter(g => Number(g.current_amount) < Number(g.target_amount));

  if (statsLoading || goalsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Savings</h1>
          <p className="text-muted-foreground mt-1">Track your savings progress and financial health</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="stat-card bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-2xl font-bold">{formatAmount(totalSaved)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Savings</p>
                  <p className={cn("text-2xl font-bold", monthlySavings >= 0 ? "text-success" : "text-destructive")}>
                    {formatAmount(monthlySavings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Savings Rate</p>
                  <p className="text-2xl font-bold">{savingsRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Goals Progress</p>
                  <p className="text-2xl font-bold">{completedGoals.length}/{goals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Savings Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Savings Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savingsTrend}>
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => formatAmount(v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatAmount(value), 'Savings']}
                  />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    stroke="hsl(var(--primary))"
                    fill="url(#savingsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Goals Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Goals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Active Goals</CardTitle>
              <Link to="/goals">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activeGoals.length > 0 ? (
                <div className="space-y-4">
                  {activeGoals.slice(0, 3).map((goal) => {
                    const percentage = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
                    return (
                      <div key={goal.id} className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${goal.color}20` }}
                            >
                              <Target className="w-4 h-4" style={{ color: goal.color }} />
                            </div>
                            <span className="font-medium">{goal.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>{formatAmount(Number(goal.current_amount))}</span>
                          <span>{formatAmount(Number(goal.target_amount))}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>No active goals</p>
                  <Link to="/goals">
                    <Button variant="link" size="sm">Create a goal</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-warning" />
                Completed Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedGoals.length > 0 ? (
                <div className="space-y-3">
                  {completedGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center bg-success/20"
                        >
                          <Target className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium">{goal.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Saved {formatAmount(Number(goal.current_amount))}
                          </p>
                        </div>
                      </div>
                      <div className="text-success text-sm font-medium">✓ Complete</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>No completed goals yet</p>
                  <p className="text-xs">Keep saving to reach your goals!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Card */}
        <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Savings Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Aim to save at least 20% of your income each month</li>
                  <li>• Set up automatic transfers to your savings on payday</li>
                  <li>• Review and adjust your budget monthly to find more savings opportunities</li>
                  <li>• Track your expenses closely to identify areas where you can cut back</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
