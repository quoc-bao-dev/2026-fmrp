import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {Object} CheckOTPPayload
 * @property {string} phone_number - Phone number to verify
 * @property {string} otp_code - One-time password code
 */

/**
 * @typedef {Object} CheckOTPResponse
 * @property {boolean} isSuccess - Success status
 * @property {string} [message] - Response message
 * @property {Object} [data] - Optional response data
 * @property {number} [status] - HTTP status code
 * @property {string} [timestamp] - Response timestamp
 */

const apiCheckOTP = {
    /**
     * Check OTP API
     * @description Verifies the provided OTP code for the given phone number
     * @param {CheckOTPPayload} payload - Request payload
     * @returns {Promise<CheckOTPResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Basic usage
     * const result = await apiCheckOTP.checkOTP({
     *   phone_number: '0123456789',
     *   otp_code: '123456'
     * });
     * if (result.isSuccess) {
     *   console.log('OTP verified');
     * } else {
     *   console.error('OTP verification failed:', result.message);
     * }
     */
    async checkOTP(payload) {
        const formData = new FormData();
        formData.append('phone_number', payload.phone_number);
        formData.append('otp_code', payload.otp_code);

        const response = await axiosCustom('POST', `/api_web/Api_Login/checkOTP?csrf_protection=true`, formData);
        return response.data;
    },
};

export default apiCheckOTP;
