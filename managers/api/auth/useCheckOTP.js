import { useMutation } from '@tanstack/react-query';
import apiCheckOTP from '@/Api/apiLogin/apiCheckOTP';
import useToast from '@/hooks/useToast';
import { useLanguageContext } from '@/context/ui/LanguageContext';

/**
 * Custom hook for OTP verification
 * @description Manages OTP verification with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Function} returns.checkOTP - Function to trigger OTP verification
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { checkOTP, isLoading, data, error } = useCheckOTP({
 *   onSuccess: (response) => console.log('OTP verified successfully'),
 *   onError: (error) => console.error('OTP verification failed')
 * });
 *
 * // Trigger verification
 * const handleVerify = async () => {
 *   await checkOTP({ phone_number: '0123456789', otp_code: '123456' });
 * };
 */
export const useCheckOTP = (options = {}) => {
    const showToast = useToast();
    const dataLang = useLanguageContext();

    const checkOTPMutation = useMutation({
        mutationFn: async payload => {
            const res = await apiCheckOTP.checkOTP(payload);
            return res;
        },
        onSuccess: data => {
            if (data?.isSuccess) {
                showToast('success', dataLang[data?.message] || 'OTP verified successfully');
                if (options.onSuccess) options.onSuccess(data);
            } else {
                showToast('error', dataLang[data?.message] || 'OTP verification failed');
            }
        },
        onError: error => {
            showToast('error', 'An error occurred during OTP verification');
            if (options.onError) options.onError(error);
        },
    });

    const checkOTP = async payload => {
        checkOTPMutation.mutate(payload);
    };

    return {
        checkOTP,
        isLoading: checkOTPMutation.isPending,
        data: checkOTPMutation.data,
        error: checkOTPMutation.error,
    };
};
