import { useQuery } from "@tanstack/react-query";
import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { optionsQuery } from "@/configs/optionsQuery";

/**
 * Custom hook for getting production order managers
 * @description Fetches list of responsible persons (managers) for a production order
 * @param {Object} params - Hook params
 * @param {number|string} params.po_id - Production order ID
 * @param {boolean} [params.enabled=true] - Whether the query is enabled
 * @param {Function} [params.onSuccess] - Success callback
 * @param {Function} [params.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - Response data
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Error} returns.error - Error object if any
 * @example
 * const { data, isLoading, error } = useProductionOrderManagers({
 *   po_id: 50,
 *   enabled: true,
 *   onSuccess: (res) => console.log('Managers:', res?.data),
 * });
 */
export const useProductionOrderManagers = ({ po_id, enabled = true, onSuccess, onError } = {}) => {
  const queryResult = useQuery({
    queryKey: ["apiGetProductionOrderManagers", po_id],
    queryFn: async () => {
      const res = await apiProductionsOrders.apiGetProductionOrderManagers(po_id);
      if (res?.isSuccess && onSuccess) onSuccess(res);
      if (!res?.isSuccess && onError) onError(new Error(res?.message || "Failed to get managers"));
      return res;
    },
    enabled: !!po_id && enabled,
    ...optionsQuery,
  });

  return {
    ...queryResult,
    refetch: queryResult.refetch,
  };
};

