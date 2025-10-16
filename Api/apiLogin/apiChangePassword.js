import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {Object} ChangePasswordPayload
 * @property {string} phone_number - Phone number
 * @property {string} company_code - Company code
 * @property {string} key_change_password - Change password key from OTP step
 * @property {string} password - New password
 */

/**
 * @typedef {Object} ChangePasswordResponse
 * @property {boolean} isSuccess - Success status
 * @property {string} [message] - Response message
 * @property {Object} [data] - Optional response data
 * @property {number} [status] - HTTP status code
 * @property {string} [timestamp] - Response timestamp
 */

const apiChangePassword = {
    /**
     * Change Password API
     * @description Changes user password using key from OTP verification
     * @param {ChangePasswordPayload} payload - Request payload
     * @returns {Promise<ChangePasswordResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * const res = await apiChangePassword.changePassword({
     *   phone_number: '0123456789',
     *   company_code: 'COMP001',
     *   key_change_password: 'abc123',
     *   password: 'newStrongPassword!'
     * });
     */
    async changePassword(payload) {
        const formData = new FormData();
        formData.append('phone_number', payload.phone_number);
        formData.append('company_code', payload.company_code);
        formData.append('key_change_password', payload.key_change_password);
        formData.append('password', payload.password);

        const response = await axiosCustom('POST', `/api_web/Api_Login/change_password?csrf_protection=true`, formData);
        return response.data;
    },
};

export default apiChangePassword;
