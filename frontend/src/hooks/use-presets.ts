import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PurchasePresetItem {
  id: string;
  categoryId: string;
  name: string;
  price: string; // Decimal is returned as string from JSON
  isActive: boolean;
}

export function useCategoryPresets(categoryId?: string) {
  return useQuery({
    queryKey: ['presets', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const res = await api.get<{ success: boolean; data: PurchasePresetItem[] }>(`/presets/categories/${categoryId}`);
      return res.data.data;
    },
    enabled: !!categoryId,
  });
}

export function useUpdateCategoryPresets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, items }: { categoryId: string; items: { id?: string; name: string; price: number; isActive: boolean }[] }) => {
      const res = await api.patch<{ success: boolean; data: PurchasePresetItem[] }>(`/presets/categories/${categoryId}`, { items });
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['presets', variables.categoryId] });
    },
  });
}
