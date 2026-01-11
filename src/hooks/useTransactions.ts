import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  date: string;
  created_at: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export function useTransactions(type?: 'income' | 'expense', limit?: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.id, type, limit],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('transactions')
        .select(`
          *,
          category:categories(id, name, icon, color)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (type) {
        query = query.eq('type', type);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'category'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Transaction added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add transaction: ' + error.message);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update transaction: ' + error.message);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete transaction: ' + error.message);
    },
  });

  return {
    transactions,
    isLoading,
    addTransaction: addTransaction.mutate,
    updateTransaction: updateTransaction.mutate,
    deleteTransaction: deleteTransaction.mutate,
    isAdding: addTransaction.isPending,
    isUpdating: updateTransaction.isPending,
    isDeleting: deleteTransaction.isPending,
  };
}
