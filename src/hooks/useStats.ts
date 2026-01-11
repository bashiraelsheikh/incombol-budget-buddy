import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

export function useStats() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

      // Get current month transactions
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd);

      if (error) throw error;

      const totalIncome = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const totalExpenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const balance = totalIncome - totalExpenses;

      // Get last month for comparison
      const lastMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');
      const lastMonthEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');

      const { data: lastMonthTransactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('date', lastMonthStart)
        .lte('date', lastMonthEnd);

      const lastMonthIncome = lastMonthTransactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const lastMonthExpenses = lastMonthTransactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const incomeChange = lastMonthIncome > 0 
        ? ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100 
        : 0;
      
      const expenseChange = lastMonthExpenses > 0 
        ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
        : 0;

      return {
        totalIncome,
        totalExpenses,
        balance,
        incomeChange,
        expenseChange,
        transactionCount: transactions?.length || 0,
      };
    },
    enabled: !!user,
  });

  return { stats, isLoading };
}

export function useMonthlyData() {
  const { user } = useAuth();

  const { data: monthlyData = [], isLoading } = useQuery({
    queryKey: ['monthlyData', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = format(startOfMonth(date), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd');

        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', user.id)
          .gte('date', monthStart)
          .lte('date', monthEnd);

        const income = transactions
          ?.filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        const expenses = transactions
          ?.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        months.push({
          month: format(date, 'MMM'),
          income,
          expenses,
        });
      }

      return months;
    },
    enabled: !!user,
  });

  return { monthlyData, isLoading };
}

export function useCategoryBreakdown(type: 'income' | 'expense') {
  const { user } = useAuth();

  const { data: breakdown = [], isLoading } = useQuery({
    queryKey: ['categoryBreakdown', user?.id, type],
    queryFn: async () => {
      if (!user) return [];

      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          amount,
          category:categories(id, name, color)
        `)
        .eq('user_id', user.id)
        .eq('type', type)
        .gte('date', monthStart)
        .lte('date', monthEnd);

      const categoryTotals = new Map<string, { name: string; color: string; amount: number }>();

      transactions?.forEach(t => {
        if (t.category) {
          const existing = categoryTotals.get(t.category.id);
          if (existing) {
            existing.amount += Number(t.amount);
          } else {
            categoryTotals.set(t.category.id, {
              name: t.category.name,
              color: t.category.color,
              amount: Number(t.amount),
            });
          }
        }
      });

      return Array.from(categoryTotals.values()).sort((a, b) => b.amount - a.amount);
    },
    enabled: !!user,
  });

  return { breakdown, isLoading };
}
