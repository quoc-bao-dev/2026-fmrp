import { useMutation, useQuery } from '@tanstack/react-query';
import apiParcel from '@/Api/apiParcel/apiParcel';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} InstallParcelOptions
 * @property {Function} [onSuccess] - Success callback
 * @property {Function} [onError] - Error callback
 */

/**
 * Custom hook for installing parcel
 * @description Manages parcel installation operations with loading states and error handling
 * @param {InstallParcelOptions} [options] - Hook options
 * @returns {Object} Hook return object
 * @returns {Function} returns.installParcel - Function to install parcel by ID
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { installParcel, isLoading, data, error } = useInstallParcel({
 *   onSuccess: (response) => console.log('Install parcel successfully'),
 *   onError: (error) => console.error('Failed to install parcel', error)
 * });
 *
 * // Trigger install
 * const handleInstall = async () => {
 *   await installParcel(1); // parcel id
 * };
 */
export const useInstallParcel = (options = {}) => {
    const showToast = useToast();
    const { onSuccess: onSuccessCallback, onError: onErrorCallback } = options;

    const installParcelMutation = useMutation({
        mutationKey: ['apiInstallParcel'],
        mutationFn: async (id) => {
            const res = await apiParcel.apiInstallParcel(id);
            return res;
        },
        onSuccess: (data) => {
            if (data?.success) {
                // Nếu cần thanh toán, message thường là "Để sử dụng gói bạn cần thanh toán"
                // vẫn hiển thị toast success vì API xử lý thành công
                // showToast('success', data?.message || 'Cài đặt ứng dụng thành công');
                if (onSuccessCallback) {
                    onSuccessCallback(data);
                }
            } else {
                const message = data?.message || 'Cài đặt ứng dụng thất bại';
                showToast('error', message);
                if (onErrorCallback) {
                    onErrorCallback(new Error(message));
                }
            }
        },
        onError: (error) => {
            showToast('error', 'Có lỗi xảy ra khi cài đặt ứng dụng');
            if (onErrorCallback) {
                onErrorCallback(error);
            }
        },
    });

    const installParcel = async (id) => {
        if (id === undefined || id === null || id === '') {
            const error = new Error('Parcel ID is required');
            showToast('error', error.message);
            if (onErrorCallback) {
                onErrorCallback(error);
            }
            throw error;
        }

        installParcelMutation.mutate(id);
    };

    return {
        installParcel,
        isLoading: installParcelMutation.isPending,
        data: installParcelMutation.data,
        error: installParcelMutation.error,
    };
};

/**
 * Custom hook for getting parcel install status
 * @description Fetches installation status for current parcel/application
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.enabled=true] - Enable/disable query
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - Response data from status API
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Error} returns.error - Error object if any
 * @example
 * const { data, isLoading } = useGetInstallStatus();
 */
export const useGetInstallStatus = (options = {}) => {
    const { enabled = true } = options;

    const query = useQuery({
        queryKey: ['apiGetInstallStatus'],
        queryFn: async () => {
            const res = await apiParcel.apiGetInstallStatus();
            return res;
        },
        enabled,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
};
