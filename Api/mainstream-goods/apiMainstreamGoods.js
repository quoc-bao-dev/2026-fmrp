import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {Object} MainstreamGoodsPricePayload
 * @property {number|string} supplier_id - Supplier identifier that owns the mainstream goods
 * @property {Array<number|string>} item_variation_ids - Array of item variation IDs that need to be priced
 */

/**
 * @typedef {Object} MainstreamGoodsPriceResponse
 * @property {boolean} [result] - Indicates whether the request succeeded
 * @property {string} [message] - Additional message provided by the backend
 * @property {Object} [data] - Interface data payload returned by the API
 * @property {Object} [dataQR] - QR data payload returned by the API
 * @property {Object} [package] - Optional package metadata describing the upgrade selection
 */

const apiMainstreamGoods = {
  /**
   * Get Mainstream Goods Prices API
   * @description Retrieves UI information and QR data for upgrading additional users based on supplier and item variations
   * @param {FormData} payload - Request payload formatted as FormData (supplier_id, item_variation_ids[])
   * @returns {Promise<MainstreamGoodsPriceResponse>} Promise that resolves to API response
   * @throws {Error} When the API call fails
   * @example
   * // Build request payload with FormData
   * const formData = new FormData();
   * formData.append('supplier_id', 40);
   * formData.append('item_variation_ids[]', 944);
   *
   * // Execute API call
   * const response = await apiMainstreamGoods.getMainstreamGoodsPrices(formData);
   *
   * if (response?.result) {
   *   console.log('QR URL:', response?.dataQR?.qr?.data);
   * }
   */
  async getMainstreamGoodsPrices(payload) {
    const response = await axiosCustom('POST', `/api_web/mainstream-goods/prices?csrf_protection=true`, payload);
    return response.data;
  },
};

export default apiMainstreamGoods;
