import apiProductionsOrders from '@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders';
import apiMaterialsPlanning from '@/Api/apiManufacture/manufacture/materialsPlanning/apiMaterialsPlanning';
import useToast from '@/hooks/useToast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useListRecallKeepStock = (params = null, enabled = false) => {
  return useQuery({
    queryKey: ['api_list_recall_keep_stock', params],
    queryFn: async () => {
      const response = await apiProductionsOrders.apiListRecallKeepStock({ params });
      return response;
    },
    enabled: enabled,
  });
};

// Lấy danh sách bán thành phẩm (keep stock) dùng chung cho PopupRecallStock
export const useProductionOrderKeepStok = (params = null, enabled = false) => {
  return useQuery({
    queryKey: ['api_manufactures_production_order_keep_stok', params],
    queryFn: async () => {
      if (!params) return null;
      const r = await apiMaterialsPlanning.apiManufacturesProductionOrderKeepStok({params});
      return {
        ...r,
        data: {
          ...r?.data,
          items_poi: (r?.data?.items_poi || []).map(e => ({
            ...e,
            value: e?.ppi_id,
            label: e?.item_name,
          })),
        },
      };
    },
    enabled: enabled,
  });
};

export const useSaveRecoveryKeepStock = (onClose, ppId = null, onErrorCallback = null) => {
  const showToast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['api_save_recovery_keep_stock'],
    mutationFn: async payload => {
      const response = await apiProductionsOrders.apiSaveRecoveryKeepStock({ data: payload });
      return response;
    },
    onSuccess: data => {
      const response = data?.data || data;
      if (response?.isSuccess) {
        showToast('success', response?.message || 'Thu hồi nguyên liệu thành công');
        
        // Invalidate query useListBomProductPlan để cập nhật lại dữ liệu
        if (ppId) {
          queryClient.invalidateQueries({
            queryKey: ['apiListBomProductPlan', ppId],
          });
          queryClient.invalidateQueries({
            queryKey: ['apiDetailProductionOrders'],
          });
        }

        onClose?.();
      } else {
        // Nếu errors là array → hiển thị banner chi tiết
        // Nếu errors là object → chỉ showToast message
        if (onErrorCallback && response?.errors && Array.isArray(response.errors)) {
          onErrorCallback({
            message: response?.message || 'Thu hồi nguyên liệu thất bại',
            errors: response.errors,
          });
        } else {
          // errors là object hoặc không có errors → chỉ showToast
          showToast('error', response?.message || 'Thu hồi nguyên liệu thất bại');
        }
      }
    },
    onError: error => {
      const message = error?.response?.data?.message || 'Thu hồi nguyên liệu thất bại';
      showToast('error', message);
    },
  });
};
