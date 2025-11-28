import { useQuery } from '@tanstack/react-query';
import apiUpgradePackage from '@/Api/apiUpgradePackage/apiUpgradePackage';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} HistoryUpgradePackageParams
 * @property {string} [page] - Page number for pagination
 * @property {string} [limit] - Number of items per page
 * @property {string} [date_start] - Start date filter
 * @property {string} [date_end] - End date filter
 */

/**
 * @typedef {Object} HistoryUpgradePackageItem
 * @property {string} id - Upgrade package history record ID
 * @property {string} code - Transaction code
 * @property {string} name_package - Package name
 * @property {string|null} name_package_detail - Package detail name
 * @property {string} number_of_users - Number of users in the package
 * @property {string} vat - VAT percentage
 * @property {string|null} service_add - Additional service description
 * @property {string} money_need_paid - Total amount that needs to be paid
 * @property {string} amount_paid - Amount already paid
 * @property {string} status - Status of the upgrade (e.g., "success", "create")
 * @property {string} date_create - Creation date and time
 * @property {string|null} full_note_price - Full price note
 * @property {string} type_upgrade_package - Type of upgrade package
 * @property {string} type_upgrade_package_name - Type name
 * @property {string} name_status - Status name in Vietnamese
 */

/**
 * @typedef {Object} UseHistoryUpgradePackageOptions
 * @property {HistoryUpgradePackageParams} [params] - Query parameters forwarded to the API
 * @property {boolean} [enabled=true] - Whether the query is enabled
 * @property {Function} [onSuccess] - Callback invoked when the request succeeds
 * @property {Function} [onError] - Callback invoked when the request fails
 */

/**
 * Custom hook for Get History Upgrade Package
 * @description Manages upgrade package history fetching with loading states and error handling
 * @param {UseHistoryUpgradePackageOptions} [options] - Hook options
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - API response data with structure: { result: boolean, data: HistoryUpgradePackageItem[] }
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isFetching - Fetching state
 * @returns {Error} returns.error - Error object if any
 * @returns {Function} returns.refetch - Function to refetch data manually
 * @example
 * // Basic usage
 * const { data, isLoading } = useHistoryUpgradePackage();
 * // Access history items: data?.data?.forEach(item => console.log(item.code, item.name_package));
 * // Response structure: { result: true, data: [{ id: "1", code: "JQKA-1745828538", ... }, ...] }
 *
 * // Fetch with query params and custom callbacks
 * const { data, refetch } = useHistoryUpgradePackage({
 *   params: { page: '1', limit: '10' },
 *   enabled: !!authState?.auth,
 *   onSuccess: (response) => {
 *     if (response.result) {
 *       console.log('History loaded', response.data);
 *     }
 *   },
 *   onError: (error) => console.error('Failed to load history', error),
 * });
 *
 * // Fetch with date filter
 * const { data } = useHistoryUpgradePackage({
 *   params: {
 *     date_start: '2024-01-01',
 *     date_end: '2024-12-31'
 *   }
 * });
 *
 * // Render history list
 * {data?.result && data.data.map(item => (
 *   <div key={item.id}>
 *     <p>Code: {item.code}</p>
 *     <p>Package: {item.name_package}</p>
 *     <p>Status: {item.name_status}</p>
 *   </div>
 * ))}
 */
export const useHistoryUpgradePackage = (options = {}) => {
  const showToast = useToast();
  const { params = {}, enabled = true, onSuccess, onError } = options;

  const queryResult = useQuery({
    queryKey: ['apiHistoryUpgradePackage', params],
    queryFn: async () => {
      const res = await apiUpgradePackage.apiHistoryUpgradePackage(params);
      return res;
    },
    enabled,
    onSuccess: data => {
      if (data?.result) {
        if (onSuccess) onSuccess(data);
      } else {
        const message = 'Failed to load upgrade package history';
        showToast('error', message);
        if (onError) onError(new Error(message));
      }
    },
    onError: error => {
      showToast('error', 'An error occurred while fetching upgrade package history');
      if (onError) onError(error);
    },
    retry: 3,
    retryDelay: 2000,
  });

  return queryResult;
};
