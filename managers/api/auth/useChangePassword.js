import { useMutation } from '@tanstack/react-query';
import apiChangePassword from '@/Api/apiLogin/apiChangePassword';
import useToast from '@/hooks/useToast';
import { useLanguageContext } from '@/context/ui/LanguageContext';

/**
 * Custom hook for change password
 * @description Manages password change operation with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Function} returns.changePassword - Function to trigger password change
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * const { changePassword, isLoading } = useChangePassword({
 *   onSuccess: (res) => console.log('Password changed'),
 * });
 * changePassword({ phone_number, company_code, key_change_password, password });
 */
export const useChangePassword = (options = {}) => {
    const showToast = useToast();
    const dataLang = useLanguageContext();

    const changePasswordMutation = useMutation({
        mutationFn: async payload => {
            const res = await apiChangePassword.changePassword(payload);
            return res;
        },
        onSuccess: data => {
            if (data?.isSuccess) {
                showToast('success', dataLang[data?.message] || 'Đổi mật khẩu thành công');
                if (options.onSuccess) options.onSuccess(data);
            } else {
                showToast('error', dataLang[data?.message] || 'Đổi mật khẩu thất bại');
            }
        },
        onError: error => {
            showToast('error', 'Có lỗi xảy ra khi đổi mật khẩu');
            if (options.onError) options.onError(error);
        },
    });

    const changePassword = async payload => {
        changePasswordMutation.mutate(payload);
    };

    return {
        changePassword,
        isLoading: changePasswordMutation.isPending,
        data: changePasswordMutation.data,
        error: changePasswordMutation.error,
    };
};
