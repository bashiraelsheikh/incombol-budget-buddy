import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  created_at: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export function useBudgets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(id, name, icon, color)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user,
  });

  const addBudget = useMutation({
    mutationFn: async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'category'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('budgets')
        .insert({ ...budget, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add budget: ' + error.message);
    },
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Budget> & { id: string }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update budget: ' + error.message);
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete budget: ' + error.message);
    },
  });

  return {
    budgets,
    isLoading,
    addBudget: addBudget.mutate,
    updateBudget: updateBudget.mutate,
    deleteBudget: deleteBudget.mutate,
    isAdding: addBudget.isPending,
    isUpdating: updateBudget.isPending,
    isDeleting: deleteBudget.isPending,
  };
}
