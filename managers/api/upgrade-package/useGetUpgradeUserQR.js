import { useQuery } from '@tanstack/react-query';
import apiUpgradePackage from '@/Api/apiUpgradePackage/apiUpgradePackage';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} UseGetUpgradeUserQROptions
 * @property {any} [data] - Data to check for enabling the query
 * @property {boolean} [enabled=true] - Whether the query is enabled (will be combined with data check)
 * @property {Function} [onSuccess] - Callback invoked when the request succeeds
 * @property {Function} [onError] - Callback invoked when the request fails
 */

/**
 * Custom hook for Get Upgrade User QR Info
 * @description Manages upgrade user QR information fetching with loading states and error handling. Query is enabled based on data parameter.
 * @param {UseGetUpgradeUserQROptions} [options] - Hook options
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - API response data with structure: { result: boolean, data: UpgradeUserQRData, dataQR: UpgradeUserQRDataQR, package: UpgradePackageInfo }
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isFetching - Fetching state
 * @returns {Error} returns.error - Error object if any
 * @returns {Function} returns.refetch - Function to refetch data manually
 * @example
 * // Basic usage with data check
 * const { data, isLoading } = useGetUpgradeUserQR({
 *   data: upgradePackageData,
 *   enabled: !!upgradePackageData
 * });
 * // Access transaction data
 * const transactionCode = data?.data?.code;
 * const userPlus = data?.data?.userPlus; // Number of additional users
 * const moneyNeedPaid = data?.data?.money_need_paid;
 * const pricePerUser = data?.data?.price;
 * const packageName = data?.package?.fullname;
 *
 * // Access QR URL: data?.dataQR?.qr?.data
 * // Access bank info: data?.dataQR?.bank
 *
 * // Fetch with custom callbacks
 * const { data, refetch } = useGetUpgradeUserQR({
 *   data: authState,
 *   enabled: !!authState?.auth,
 *   onSuccess: (response) => {
 *     if (response.result) {
 *       console.log('Transaction code:', response.data.code);
 *       console.log('User plus:', response.data.userPlus);
 *       console.log('QR URL:', response.dataQR.qr.data);
 *       console.log('Bank account:', response.dataQR.bank.account_number);
 *       console.log('Package:', response.package?.fullname);
 *       console.log('Amount:', response.dataQR.bank.amount);
 *     }
 *   },
 *   onError: (error) => console.error('Failed to load QR info', error),
 * });
 *
 * // Display QR code
 * {data?.dataQR?.qr?.data && (
 *   <img src={data.dataQR.qr.data} alt="QR Code" />
 * )}
 *
 * // Display transaction info
 * {data?.data && (
 *   <div>
 *     <p>Code: {data.data.code}</p>
 *     <p>User Plus: {data.data.userPlus}</p>
 *     <p>Amount: {data.data.money_need_paid}</p>
 *     <p>Price per user: {data.data.price}</p>
 *     <p>Package: {data.package?.fullname}</p>
 *   </div>
 * )}
 */
export const useGetUpgradeUserQR = (options = {}) => {
  const showToast = useToast();
  const { data, enabled = true, onSuccess, onError } = options;

  // Enable query based on data - if data exists and enabled is true
  //   const isEnabled = enabled && !!data;

  const queryResult = useQuery({
    queryKey: ['apiGetUpgradeUserQR', data],
    queryFn: async () => {
      const res = await apiUpgradePackage.apiGetUpgradeUserQR();

      return res;
    },
    enabled: enabled,
    onSuccess: response => {
      if (response?.result) {
        if (onSuccess) onSuccess(response);
      } else {
        const message = response?.message || 'Failed to load upgrade user QR information';
        showToast('error', message);
        if (onError) onError(new Error(message));
      }
    },
    onError: error => {
      showToast('error', 'An error occurred while fetching upgrade user QR information');
      if (onError) onError(error);
    },
    retry: 3,
    retryDelay: 2000,
  });

  return queryResult;
};
