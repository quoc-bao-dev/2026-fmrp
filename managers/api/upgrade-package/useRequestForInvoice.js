import { useMutation } from '@tanstack/react-query';
import apiUpgradePackage from '@/Api/apiUpgradePackage/apiUpgradePackage';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} RequestForInvoiceOptions
 * @property {Function} [onSuccess] - Success callback
 * @property {Function} [onError] - Error callback
 */

/**
 * Custom hook for Request For Invoice
 * @description Manages invoice request operations for upgrade package transactions
 * @param {RequestForInvoiceOptions} [options] - Hook options
 * @returns {Object} Hook return object
 * @returns {Function} returns.requestForInvoice - Function to request invoice by upgrade package ID
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { requestForInvoice, isLoading, data, error } = useRequestForInvoice({
 *   onSuccess: (response) => console.log('Invoice requested successfully'),
 *   onError: (error) => console.error('Failed to request invoice', error)
 * });
 *
 * // Get upgrade package data first, then request invoice
 * const { data: upgradeData } = useGetUpgradePackage();
 * const { requestForInvoice } = useRequestForInvoice();
 *
 * const handleRequestInvoice = async () => {
 *   if (upgradeData?.data?.id) {
 *     await requestForInvoice(upgradeData.data.id);
 *   }
 * };
 */
export const useRequestForInvoice = (options = {}) => {
    const showToast = useToast();
    const { onSuccess: onSuccessCallback, onError: onErrorCallback } = options;

    const requestForInvoiceMutation = useMutation({
        mutationKey: ['apiRequestForInvoice'],
        mutationFn: async (id) => {
            const res = await apiUpgradePackage.apiRequestForInvoice(id);
            return res;
        },
        onSuccess: (data) => {
            // Assuming API returns success indicator
            if (data?.result !== false) {
                showToast('success', 'Yêu cầu hóa đơn thành công');
                if (onSuccessCallback) {
                    onSuccessCallback(data);
                }
            } else {
                const message = data?.message || 'Yêu cầu hóa đơn thất bại';
                showToast('error', message);
                if (onErrorCallback) {
                    onErrorCallback(new Error(message));
                }
            }
        },
        onError: (error) => {
            showToast('error', 'Có lỗi xảy ra khi yêu cầu hóa đơn');
            if (onErrorCallback) {
                onErrorCallback(error);
            }
        },
    });

    const requestForInvoice = async (id) => {
        if (id === undefined || id === null || id === '') {
            const error = new Error('Upgrade package ID is required');
            showToast('error', error.message);
            if (onErrorCallback) {
                onErrorCallback(error);
            }
            throw error;
        }

        requestForInvoiceMutation.mutate(id);
    };

    return {
        requestForInvoice,
        isLoading: requestForInvoiceMutation.isPending,
        data: requestForInvoiceMutation.data,
        error: requestForInvoiceMutation.error,
    };
};
