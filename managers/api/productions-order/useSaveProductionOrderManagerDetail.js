import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import useToast from "@/hooks/useToast";

/**
 * Custom hook for saving production order manager detail
 * @description Manages saving responsible persons (managers) for a specific production order line (dòng sản phẩm) with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Function} returns.saveProductionOrderManagerDetail - Function to save production order manager detail
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { saveProductionOrderManagerDetail, isLoading, data, error } = useSaveProductionOrderManagerDetail({
 *   onSuccess: (response) => console.log('Manager detail saved successfully'),
 *   onError: (error) => console.error('Failed to save manager detail')
 * });
 *
 * // Save manager detail
 * const handleSave = async () => {
 *   await saveProductionOrderManagerDetail({
 *     po_id: 62,
 *     poi_id: 89,
 *     items: [
 *       {
 *         staff_id: 3,
 *         is_manufacture: 1 // 1: Phụ trách sản xuất
 *       }
 *     ]
 *   });
 * };
 */
export const useSaveProductionOrderManagerDetail = (options = {}) => {
  const showToast = useToast();
  const queryClient = useQueryClient();

  const saveProductionOrderManagerDetailMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiProductionsOrders.apiSaveProductionOrderManagerDetail(payload);
      return res;
    },
    onSuccess: (data, variables) => {
      if (data?.isSuccess || data?.isSuccess === 1) {
        showToast("success", data?.message || "Lưu danh sách người phụ trách chi tiết thành công");
        
        // Invalidate queries để refresh dữ liệu
        const { po_id, poi_id } = variables || {};
        if (po_id) {
          // Invalidate query cho manager detail (dòng sản phẩm cụ thể)
          if (poi_id) {
            queryClient.invalidateQueries({
              queryKey: ["apiGetProductionOrderManagerDetail", po_id, poi_id],
            });
          }
          
          // Invalidate query cho managers của toàn bộ production order
          queryClient.invalidateQueries({
            queryKey: ["apiGetProductionOrderManagers", po_id],
          });
        }
        
        if (options.onSuccess) options.onSuccess(data, variables);
      } else {
        showToast("error", data?.message || "Lưu danh sách người phụ trách chi tiết thất bại");
      }
    },
    onError: (error) => {
      showToast("error", "Đã xảy ra lỗi khi lưu danh sách người phụ trách chi tiết");
      if (options.onError) options.onError(error);
    },
  });

  const saveProductionOrderManagerDetail = async (payload) => {
    saveProductionOrderManagerDetailMutation.mutate(payload);
  };

  return {
    saveProductionOrderManagerDetail,
    isLoading: saveProductionOrderManagerDetailMutation.isPending,
    data: saveProductionOrderManagerDetailMutation.data,
    error: saveProductionOrderManagerDetailMutation.error,
  };
};
