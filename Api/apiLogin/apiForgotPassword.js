import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {Object} ForgotPasswordPayload
 * @property {string} phone_number - Phone number for password reset
 * @property {string} company_code - Company code for verification
 */

/**
 * @typedef {Object} ForgotPasswordResponse
 * @property {boolean} isSuccess - Success status
 * @property {string} message - Response message
 * @property {Object} [data] - Response data payload
 * @property {number} [status] - HTTP status code
 * @property {string} [timestamp] - Response timestamp
 */

const apiForgotPassword = {
    /**
     * Forgot Password API
     * @description Initiates password reset process by sending verification to phone number
     * @param {ForgotPasswordPayload} payload - Request payload
     * @param {string} payload.phone_number - Phone number for password reset
     * @param {string} payload.company_code - Company code for verification
     * @returns {Promise<ForgotPasswordResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Basic usage
     * const result = await apiForgotPassword.forgotPassword({
     *   phone_number: "0123456789",
     *   company_code: "COMP001"
     * });
     *
     * // Handle response
     * if (result.isSuccess) {
     *   console.log("Password reset initiated:", result.message);
     * } else {
     *   console.error("Password reset failed:", result.message);
     * }
     */
    async forgotPassword(payload) {
        // Create FormData object
        const formData = new FormData();
        formData.append('phone_number', payload.phone_number);
        formData.append('company_code', payload.company_code);

        const response = await axiosCustom('POST', `/api_web/Api_Login/forgot_password?csrf_protection=true`, formData);
        return response.data;
    },
};

export default apiForgotPassword;
