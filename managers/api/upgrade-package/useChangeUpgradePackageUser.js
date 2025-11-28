import { useQuery } from '@tanstack/react-query';
import apiChangeUpgradePackageUser from '@/Api/apiUpgradePackage/apiChangeUpgradePackageUser';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object|FormData|string|number} ChangeUpgradePackageUserData
 * @property {string|number} number_of_users - Number of users when using object payload
 */

/**
 * @typedef {Object} UseChangeUpgradePackageUserOptions
 * @property {ChangeUpgradePackageUserData} [data] - Payload used to trigger the query (checked to enable the request)
 * @property {boolean} [enabled=true] - Whether the query is enabled (combined with data validation)
 * @property {Function} [onSuccess] - Callback invoked when the request succeeds
 * @property {Function} [onError] - Callback invoked when the request fails
 */

const getNumberOfUsersValue = payload => {
  if (payload instanceof FormData) {
    return payload.get('number_of_users');
  }

  if (typeof payload === 'object' && payload !== null) {
    return payload.number_of_users;
  }

  return payload;
};

const hasValidNumberOfUsers = value => {
  if (value === undefined || value === null) return false;
  return `${value}`.trim() !== '';
};

const buildFormDataPayload = payload => {
  if (payload instanceof FormData) {
    return payload;
  }

  const formData = new FormData();
  const value = getNumberOfUsersValue(payload);

  if (!hasValidNumberOfUsers(value)) {
    throw new Error('number_of_users is required to change upgrade package user');
  }

  formData.append('number_of_users', value);
  return formData;
};

/**
 * Custom hook for Change Upgrade Package User
 * @description Fetches interface data and QR information when the number_of_users changes. The query only runs when `data` provides a valid number_of_users and `enabled` is true.
 * @param {UseChangeUpgradePackageUserOptions} [options] - Hook options
 * @returns {import('@tanstack/react-query').UseQueryResult<any, Error>} Hook return object
 * @example
 * // Basic usage with raw number
 * const { data, isFetching } = useChangeUpgradePackageUser({
 *   data: { number_of_users: 20 },
 *   enabled: true,
 *   onSuccess: (response) => {
 *     if (response?.result) {
 *       console.log('QR URL:', response?.dataQR?.qr?.data);
 *     }
 *   },
 * });
 *
 * // Usage with FormData
 * const formData = new FormData();
 * formData.append('number_of_users', '15');
 *
 * const query = useChangeUpgradePackageUser({
 *   data: formData,
 *   enabled: !!selectedPackage,
 * });
 */
export const useChangeUpgradePackageUser = (options = {}) => {
  const showToast = useToast();
  const { data, enabled = true, onSuccess, onError } = options;

  const numberOfUsersValue = getNumberOfUsersValue(data);
  const isEnabled = enabled && hasValidNumberOfUsers(numberOfUsersValue);

  const queryResult = useQuery({
    queryKey: ['apiChangeUpgradePackageUser', `${numberOfUsersValue ?? ''}`],
    queryFn: async () => {
      const formDataPayload = buildFormDataPayload(data);
      const res = await apiChangeUpgradePackageUser.changeUpgradePackageUser(formDataPayload);
      return res;
    },
    enabled: isEnabled,
    onSuccess: response => {
      if (response?.result) {
        if (onSuccess) onSuccess(response);
      } else {
        const message = response?.message || 'Failed to load upgrade user information';
        showToast('error', message);
        if (onError) onError(new Error(message));
      }
    },
    onError: error => {
      showToast('error', 'An error occurred while fetching upgrade user information');
      if (onError) onError(error);
    },
    retry: 3,
    retryDelay: 1500,
  });

  return queryResult;
};
