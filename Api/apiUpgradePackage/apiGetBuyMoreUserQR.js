import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {Object} GetBuyMoreUserQRResponse
 * @property {boolean} [result] - Indicates if the request was successful
 * @property {string} [message] - Response message from the server
 * @property {any} [data] - Response data (structure defined by backend)
 * @property {any} [dataQR] - QR information returned by the backend
 * @property {any} [package] - Package metadata returned by the backend
 */

const apiGetBuyMoreUserQR = {
  /**
   * Get Buy More User QR Info API
   * @description Retrieves interface information and QR code for buying more users based on transaction ID
   * @param {string} transactionId - Transaction ID (e.g., "JQKA-1762335425")
   * @returns {Promise<GetBuyMoreUserQRResponse>} Promise that resolves to API response
   * @throws {Error} When the API call fails
   * @example
   * // Get QR info for transaction
   * const response = await apiGetBuyMoreUserQR.getBuyMoreUserQR('JQKA-1762335425');
   *
   * if (response?.result) {
   *   console.log('QR URL:', response?.dataQR?.qr?.data);
   *   console.log('Transaction data:', response?.data);
   * }
   */
  async getBuyMoreUserQR(transactionId) {
    const response = await axiosCustom('GET', `/cron/cong_test/${transactionId}?csrf_protection=true`);

    return response.data;
  },
};

export default apiGetBuyMoreUserQR;

