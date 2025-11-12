import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {Object} CreateSessionQRData
 * @property {number} id
 * @property {string} session_token
 * @property {string} created_at
 * @property {string} expires_at
 * @property {number} ttl
 */
/**
 * @typedef {Object} CreateSessionQRResponse
 * @property {number} isSuccess
 * @property {string} message
 * @property {string} [branch_name]
 * @property {CreateSessionQRData} data
 */
/**
 * Create session for Login QR API
 * @description Initializes a new QR login session and returns a session token to embed in the QR
 * @returns {Promise<CreateSessionQRResponse>} API response
 * @throws {Error} When API call fails
 * @example
 * // Basic usage
 * const res = await apiLoginQR.createSession();
 * if (res?.isSuccess) {
 *   const token = res?.data?.session_token;
 *   // Use token in QR string
 * }
 */
const apiLoginQR = {
  async createSession(payload = {}) {
    const form = new FormData();
    Object.entries(payload || {}).forEach(([key, value]) => {
      form.append(key, value ?? '');
    });
    const response = await axiosCustom('POST', `/api_web/api_login_qr/createSession`, form);
    return response.data;
  },
};

export default apiLoginQR;
