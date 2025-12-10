import { useMutation } from "@tanstack/react-query";
import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import useToast from "@/hooks/useToast";

/**
 * Custom hook for saving production order managers
 * @description Manages saving responsible persons (managers) for production orders with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Function} returns.saveProductionOrderManagers - Function to save production order managers
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { saveProductionOrderManagers, isLoading, data, error } = useSaveProductionOrderManagers({
 *   onSuccess: (response) => console.log('Managers saved successfully'),
 *   onError: (error) => console.error('Failed to save managers')
 * });
 *
 * // Save managers
 * const handleSave = async () => {
 *   await saveProductionOrderManagers({
 *     po_id: 50,
 *     items: [
 *       {
 *         id: 0,
 *         staff_id: 1,
 *         is_manager: 0,
 *         is_btp_nvl: 0,
 *         is_manufacture: 1
 *       }
 *     ]
 *   });
 * };
 */
export const useSaveProductionOrderManagers = (options = {}) => {
  const showToast = useToast();

  const saveProductionOrderManagersMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiProductionsOrders.apiSaveProductionOrderManagers(payload);
      return res;
    },
    onSuccess: (data) => {
      if (data?.isSuccess || data?.isSuccess === 1) {
        showToast("success", data?.message || "Lưu danh sách người phụ trách thành công");
        if (options.onSuccess) options.onSuccess(data);
      } else {
        showToast("error", data?.message || "Lưu danh sách người phụ trách thất bại");
      }
    },
    onError: (error) => {
      showToast("error", "Đã xảy ra lỗi khi lưu danh sách người phụ trách");
      if (options.onError) options.onError(error);
    },
  });

  const saveProductionOrderManagers = async (payload) => {
    saveProductionOrderManagersMutation.mutate(payload);
  };

  return {
    saveProductionOrderManagers,
    isLoading: saveProductionOrderManagersMutation.isPending,
    data: saveProductionOrderManagersMutation.data,
    error: saveProductionOrderManagersMutation.error,
  };
};

