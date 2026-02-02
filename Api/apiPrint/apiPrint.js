import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {Object} GetConfigPayload
 * @description Empty payload for getConfig API
 */

/**
 * @typedef {Object} PrintLSTemplate
 * @property {string} id - Template ID
 * @property {string} name - Template name
 * @property {string|null} title - Template title (nullable)
 * @property {string} image - Template image URL
 * @property {number} selected - Selected status (0 or 1)
 */

/**
 * @typedef {Object} PrintTemTemplate
 * @property {string} id - Template ID
 * @property {string} name - Template name
 * @property {string} title - Template title
 * @property {string} image - Template image URL
 * @property {string} is_show - Show status ("1" or "2")
 * @property {number} selected - Selected status (0 or 1)
 */

/**
 * @typedef {Object} PrintTemNVLTemplate
 * @property {string} id - Template ID
 * @property {string} name - Template name
 * @property {string} title - Template title
 * @property {string} image - Template image URL
 * @property {string} is_show - Show status ("1" or "2")
 * @property {number} selected - Selected status (0 or 1)
 */

/**
 * @typedef {Object} PrintConfigData
 * @property {PrintLSTemplate[]} print_lsx - Production order print templates
 * @property {PrintTemTemplate[]} print_tem - Finished product label print templates
 * @property {PrintTemNVLTemplate[]} print_tem_nvl - Material label print templates
 */

/**
 * @typedef {Object} GetConfigResponse
 * @property {number} isSuccess - Success status (1 for success)
 * @property {string} message - Response message
 * @property {string} branch_name - Branch name (can be empty)
 * @property {PrintConfigData[]} data - Array containing print configuration data
 */

const apiPrint = {
  /**
   * Get Print Config API
   * @description Retrieves print configuration settings
   * @param {GetConfigPayload} [payload={}] - Request payload (empty object)
   * @returns {Promise<GetConfigResponse>} Promise that resolves to API response
   * @throws {Error} When API call fails
   * @example
   * // Basic usage
   * const result = await apiPrint.getConfig({});
   *
   * // Handle response
   * if (result.isSuccess) {
   *   console.log('Config retrieved:', result.data);
   * } else {
   *   console.error('Failed to get config:', result.message);
   * }
   */
  async getConfig(payload = {}) {
    const response = await axiosCustom('POST', `/api_web/api_print/getConfig?csrf_protection=true`, payload);
    return response.data;
  },

  /**
   * Set Print Config API
   * @description Updates selected print template for a given category
   * @param {Object} payload - Request payload
   * @param {string} [payload.config_print_lsx] - Selected template id for production order
   * @param {string} [payload.config_print_tem] - Selected template id for finished product label
   * @param {string} [payload.config_print_tem_nvl] - Selected template id for material label
   * @returns {Promise<any>} Promise that resolves to API response
   * @example
   * await apiPrint.setConfig({ config_print_tem: 'template-id' });
   */
  async setConfig(payload) {
    // Chuẩn hóa payload thành FormData để phù hợp backend
    let formData;
    if (payload instanceof FormData) {
      formData = payload;
    } else {
      formData = new FormData();
      if (payload && typeof payload === 'object') {
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }
    }
    const response = await axiosCustom('POST', `/api_web/api_print/setConfig?csrf_protection=true`, formData);
    return response.data;
  },

  /**
   * Print Transfer Keep Stock Labels API
   * @description Prints labels for transfer keep stock items
   * @param {FormData} formData - FormData containing print data
   * @param {string} formData.id - Transfer keep stock ID
   * @param {string} formData.data[0][id] - Item ID
   * @param {string} formData.data[0][code] - Item code
   * @param {string} formData.data[0][name] - Item name
   * @param {string} formData.data[0][variant_main] - Product variation
   * @param {string} formData.data[0][lot] - Lot number
   * @param {string} formData.data[0][date] - Expiration date
   * @param {string} formData.data[0][serial] - Serial number
   * @param {string} formData.data[0][quality] - Quantity to print
   * @returns {Promise<ApiResponse>} Promise that resolves to API response
   * @throws {Error} When API call fails
   * @example
   * // Create FormData
   * const formData = new FormData();
   * formData.append('id', '179');
   * formData.append('data[0][id]', '222');
   * formData.append('data[0][code]', 'NVL_000099');
   * formData.append('data[0][name]', 'Vải cotton');
   * formData.append('data[0][variant_main]', '(NONE)');
   * formData.append('data[0][lot]', 'NK_000297');
   * formData.append('data[0][date]', '2026-02-02');
   * formData.append('data[0][serial]', '');
   * formData.append('data[0][quality]', '1');
   *
   * // Print labels
   * const result = await apiPrint.printTransferKeepStock(formData);
   *
   * // Handle response
   * if (result.isSuccess === 1) {
   *   console.log('Print successful:', result.pdf_url);
   * } else {
   *   console.error('Print failed:', result.message);
   * }
   */
  async printTransferKeepStock(formData) {
    const response = await axiosCustom(
      'POST',
      `/api_web/Api_print/Print_tem_transfer_web?csrf_protection=true`,
      formData
    );
    return response.data;
  },
};

export default apiPrint;
