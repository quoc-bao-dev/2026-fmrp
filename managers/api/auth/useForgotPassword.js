import { useMutation } from '@tanstack/react-query';
import apiForgotPassword from '@/Api/apiLogin/apiForgotPassword';
import useToast from '@/hooks/useToast';
import { useLanguageContext } from '@/context/ui/LanguageContext';

/**
 * Custom hook for forgot password functionality
 * @description Manages password reset operations with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.enabled=true] - Whether the hook is enabled
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Function} returns.forgotPassword - Function to trigger password reset
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { forgotPassword, isLoading, data, error } = useForgotPassword({
 *   onSuccess: (response) => console.log('Password reset initiated successfully'),
 *   onError: (error) => console.error('Password reset failed')
 * });
 *
 * // Trigger password reset
 * const handleForgotPassword = async (credentials) => {
 *   await forgotPassword({
 *     phone_number: "0123456789",
 *     company_code: "COMP001"
 *   });
 * };
 */
export const useForgotPassword = (options = {}) => {
    const showToast = useToast();
    const dataLang = useLanguageContext();
    const forgotPasswordMutation = useMutation({
        mutationFn: async payload => {
            const res = await apiForgotPassword.forgotPassword(payload);
            return res;
        },
        onSuccess: data => {
            if (data?.isSuccess) {
                showToast('success', dataLang[data?.message] || 'Password reset initiated successfully');
                if (options.onSuccess) options.onSuccess(data);
            } else {
                showToast('error', dataLang[data?.message] || 'Password reset failed');
            }
        },
        onError: error => {
            showToast('error', 'An error occurred during password reset');
            if (options.onError) options.onError(error);
        },
    });

    const forgotPassword = async payload => {
        forgotPasswordMutation.mutate(payload);
    };

    return {
        forgotPassword,
        isLoading: forgotPasswordMutation.isPending,
        data: forgotPasswordMutation.data,
        error: forgotPasswordMutation.error,
    };
};
