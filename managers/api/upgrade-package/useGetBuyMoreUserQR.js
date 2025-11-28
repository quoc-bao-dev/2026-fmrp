import { useQuery } from '@tanstack/react-query';
import apiGetBuyMoreUserQR from '@/Api/apiUpgradePackage/apiGetBuyMoreUserQR';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} UseGetBuyMoreUserQROptions
 * @property {string} [transactionId] - Transaction ID to fetch QR information for (e.g., "JQKA-1762335425")
 * @property {any} [data] - Data to check for enabling the query (query is enabled when both data and transactionId exist)
 * @property {boolean} [enabled=true] - Whether the query is enabled (will be combined with data and transactionId check)
 * @property {Function} [onSuccess] - Callback invoked when the request succeeds
 * @property {Function} [onError] - Callback invoked when the request fails
 */

/**
 * Custom hook for Get Buy More User QR Info
 * @description Manages buy more user QR information fetching with loading states and error handling. Query is enabled based on data and transactionId parameters.
 * @param {UseGetBuyMoreUserQROptions} [options] - Hook options
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - API response data with structure: { result: boolean, data: any, dataQR: any, package: any }
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isFetching - Fetching state
 * @returns {Error} returns.error - Error object if any
 * @returns {Function} returns.refetch - Function to refetch data manually
 * @example
 * // Basic usage with transaction ID and data check
 * const { data, isLoading } = useGetBuyMoreUserQR({
 *   transactionId: 'JQKA-1762335425',
 *   data: upgradePackageData,
 *   enabled: !!upgradePackageData && !!transactionId
 * });
 *
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
 * const { data, refetch } = useGetBuyMoreUserQR({
 *   transactionId: 'JQKA-1762335425',
 *   data: authState,
 *   enabled: !!authState?.auth && !!transactionId,
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
export const useGetBuyMoreUserQR = (options = {}) => {
  const showToast = useToast();
  const { transactionId, data, enabled = true, onSuccess, onError } = options;

  // Enable query based on data and transactionId - if both exist and enabled is true
  const isEnabled = !!transactionId;

  const queryResult = useQuery({
    queryKey: ['apiGetBuyMoreUserQR', transactionId, data],
    queryFn: async () => {
      const res = await apiGetBuyMoreUserQR.getBuyMoreUserQR(transactionId);

      return res;
    },
    enabled: isEnabled,
    onSuccess: response => {
      if (response?.result) {
        if (onSuccess) onSuccess(response);
      } else {
        const message = response?.message || 'Failed to load buy more user QR information';
        showToast('error', message);
        if (onError) onError(new Error(message));
      }
    },
    onError: error => {
      showToast('error', 'An error occurred while fetching buy more user QR information');
      if (onError) onError(error);
    },
    retry: 3,
    retryDelay: 2000,
  });

  return queryResult;
};
