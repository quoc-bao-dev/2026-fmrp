import { useQuery } from "@tanstack/react-query";
import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { optionsQuery } from "@/configs/optionsQuery";

/**
 * Custom hook for getting production order manager detail (per line)
 * @description Fetches manager detail for a specific production order item/detail
 * @param {Object} params - Hook params
 * @param {number|string} params.po_id - Production order ID
 * @param {number|string} params.poi_id - Production order item/detail ID
 * @param {boolean} [params.enabled=true] - Whether the query is enabled
 * @param {Function} [params.onSuccess] - Success callback
 * @param {Function} [params.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - Response data
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Error} returns.error - Error object if any
 * @example
 * const { data, isLoading, error } = useProductionOrderManagerDetail({
 *   po_id: 62,
 *   poi_id: 89,
 *   enabled: true,
 * });
 */
export const useProductionOrderManagerDetail = ({ po_id, poi_id, enabled = true, onSuccess, onError } = {}) => {
  return useQuery({
    queryKey: ["apiGetProductionOrderManagerDetail", po_id, poi_id],
    queryFn: async () => {
      const res = await apiProductionsOrders.apiGetProductionOrderManagerDetail(po_id, poi_id);
      if (res?.isSuccess && onSuccess) onSuccess(res);
      if (!res?.isSuccess && onError) onError(new Error(res?.message || "Failed to get manager detail"));
      return res;
    },
    enabled: !!po_id && !!poi_id && enabled,
    ...optionsQuery,
  });
};

