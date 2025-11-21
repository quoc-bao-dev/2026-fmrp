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
 * @typedef {Object} CreateSessionAppPayload
 * @property {string} session_web - Session identifier from web client
 */

/**
 * @typedef {Object} CreateSessionAppResponse
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

  /**
   * Create session for Login QR from web app
   * @description Creates a QR login session based on an existing web session, used when web app generates QR
   * @param {CreateSessionAppPayload} payload - Request payload
   * @returns {Promise<CreateSessionAppResponse>} API response
   * @throws {Error} When API call fails
   * @example
   * // Basic usage
   * const res = await apiLoginQR.createSessionApp({
   *   session_web: '123123',
   * });
   * if (res?.isSuccess) {
   *   const token = res?.data?.session_token;
   *   // Use token in QR string for app-to-web login
   * }
   */
  async createSessionApp(payload) {
    const form = new FormData();
    form.append('session_web', payload?.session_web ?? '');
    const response = await axiosCustom('POST', `/api_web/api_login_qr/createSessionApp`, form);
    return response.data;
  },
};

export default apiLoginQR;
