import { AppLayout } from '@/components/layout/AppLayout';
import { useStats, useMonthlyData, useCategoryBreakdown } from '@/hooks/useStats';
import { useTransactions } from '@/hooks/useTransactions';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { profile } = useProfile();
  const { stats, isLoading: statsLoading } = useStats();
  const { monthlyData } = useMonthlyData();
  const { breakdown: expenseBreakdown } = useCategoryBreakdown('expense');
  const { transactions: recentTransactions, isLoading: transactionsLoading } = useTransactions(undefined, 5);

  const currency = profile?.currency || 'USD';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'TRY' ? '₺' : '$';

  const formatAmount = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (statsLoading) {
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
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
              <Wallet className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{formatAmount(stats?.balance || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Current month</p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-success">{formatAmount(stats?.totalIncome || 0)}</div>
              <div className="flex items-center gap-1 mt-1">
                {stats?.incomeChange !== 0 && (
                  <>
                    {stats?.incomeChange && stats.incomeChange > 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-success" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-destructive" />
                    )}
                    <span className={cn("text-xs", stats?.incomeChange && stats.incomeChange > 0 ? "text-success" : "text-destructive")}>
                      {Math.abs(stats?.incomeChange || 0).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-destructive">{formatAmount(stats?.totalExpenses || 0)}</div>
              <div className="flex items-center gap-1 mt-1">
                {stats?.expenseChange !== 0 && (
                  <>
                    {stats?.expenseChange && stats.expenseChange > 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-destructive" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-success" />
                    )}
                    <span className={cn("text-xs", stats?.expenseChange && stats.expenseChange > 0 ? "text-destructive" : "text-success")}>
                      {Math.abs(stats?.expenseChange || 0).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
              <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center">
                <span className="text-xs font-bold text-info">#</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{stats?.transactionCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Income vs Expenses Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display">Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => formatAmount(value)}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="hsl(var(--success))"
                      fill="url(#incomeGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="hsl(var(--destructive))"
                      fill="url(#expenseGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseBreakdown.length > 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height="60%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatAmount(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {expenseBreakdown.slice(0, 4).map((item, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No expense data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${transaction.category?.color}20` }}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-4 h-4" style={{ color: transaction.category?.color || 'hsl(var(--success))' }} />
                        ) : (
                          <TrendingDown className="w-4 h-4" style={{ color: transaction.category?.color || 'hsl(var(--destructive))' }} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description || transaction.category?.name || 'Uncategorized'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(transaction.date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <span className={cn("font-semibold", transaction.type === 'income' ? 'text-success' : 'text-destructive')}>
                      {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet. Start by adding your first transaction!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
