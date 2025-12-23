import apiProductionsOrders from '@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders';
import useToast from '@/hooks/useToast';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useLookupWarehouses = (params = null, enabled = true) => {
  return useQuery({
    queryKey: ['api_lookup_warehouses', params],
    queryFn: async () => {
      const response = await apiProductionsOrders.apiLookupWarehouses({ params });
      return response.data;
    },
    enabled: enabled,
  });
};

export const useMaterialsRecall = (params = null, enabled = false) => {
  return useQuery({
    queryKey: ['api_materials_recall', params],
    queryFn: async () => {
      const response = await apiProductionsOrders.apiMaterialsRecall({ params });
      return response.data;
    },
    enabled: enabled,
  });
};

export const useSaveRecallMaterials = onClose => {
  const showToast = useToast();

  return useMutation({
    mutationKey: ['api_save_recall_materials'],
    mutationFn: async payload => {
      const response = await apiProductionsOrders.apiSaveRecallMaterials({ data: payload });
      return response;
    },
    onSuccess: data => {
      const response = data?.data || data;
      if (response?.isSuccess) {
        showToast('success', response?.message || 'Thu hồi nguyên liệu thành công');
        onClose?.();
      } else {
        showToast('error', response?.message || 'Thu hồi nguyên liệu thất bại');
      }
    },
    onError: error => {
      const message = error?.response?.data?.message || 'Thu hồi nguyên liệu thất bại';
      showToast('error', message);
    },
  });
};
