import { _ServerInstance as axiosCustom } from '@/services/axios';
const apiInventory = {
  async apiListInventory(param) {
    const response = await axiosCustom('GET', `/api_web/api_inventory/inventory`, param);
    return response.data;
  },
  async apiDeleteInventory(id) {
    const response = await axiosCustom('DELETE', `/api_web/api_inventory/inventory/${id}`);
    return response.data;
  },
  async apiDetailInventory(id) {
    const response = await axiosCustom('GET', `/api_web/api_inventory/inventory/${id}`);
    return response.data;
  },
  // form

  async apiHandingInventory(data) {
    const response = await axiosCustom('POST', `/api_web/api_inventory/addDetail?csrf_protection=true`, data);
    return response.data;
  },
  // popup
  async apiItemsNoneVariantInventory(param) {
    const response = await axiosCustom('POST', `/api_web/api_product/searchItemsNoneVariant?csrf_protection=true`, param);
    return response.data;
  },
  async apiGetVariantInventory(param) {
    const response = await axiosCustom('POST', `/api_web/api_inventory/GetVariantInventory?csrf_protection=true`, param);
    return response.data;
  },
  /**
   * Get Date Excel API
   * @description Retrieves Excel template data for inventory import
   * @param {Object} [params] - Query parameters (optional)
   * @param {string} [params.warehouse_id] - Warehouse ID filter
   * @returns {Promise<GetDateExcelResponse>} Promise that resolves to API response
   * @throws {Error} When API call fails
   * @example
   * // Basic usage
   * const result = await apiInventory.apiGetDateExcel();
   *
   * // With warehouse filter
   * const result = await apiInventory.apiGetDateExcel({ warehouse_id: "123" });
   *
   * // Handle response
   * if (result.isSuccess) {
   *   console.log("Excel data:", result.data);
   * } else {
   *   console.error("Failed to get Excel data:", result.message);
   * }
   */
  async apiGetDateExcel(params) {
    const response = await axiosCustom('GET', `/api_web/api_inventory/getDateExcel`, params);
    return response.data;
  },
  /**
   * @typedef {Object} ImportDateExcelPayload
   * @property {File} file_excel - Excel file to import
   * @property {string} warehouse_id - Warehouse ID for the import
   */

  /**
   * @typedef {Object} ImportDateExcelResponse
   * @property {boolean} isSuccess - Indicates if the request was successful
   * @property {string} [message] - Response message
   * @property {Object} [data] - Response data payload
   * @property {number} [status] - HTTP status code
   * @property {string} [timestamp] - Response timestamp
   */

  /**
   * Import Date Excel API
   * @description Imports inventory data from Excel file for a specific warehouse
   * @param {FormData|ImportDateExcelPayload} payload - Request payload containing file_excel and warehouse_id
   * @returns {Promise<ImportDateExcelResponse>} Promise that resolves to API response
   * @throws {Error} When API call fails
   * @example
   * // Basic usage with FormData
   * const formData = new FormData();
   * formData.append('file_excel', file);
   * formData.append('warehouse_id', '123');
   * const result = await apiInventory.apiImportDateExcel(formData);
   *
   * // Handle response
   * if (result.isSuccess) {
   *   console.log("Import successful:", result.data);
   * } else {
   *   console.error("Import failed:", result.message);
   * }
   */
  async apiImportDateExcel(payload) {
    // Ensure payload is FormData
    let formData;
    if (payload instanceof FormData) {
      formData = payload;
    } else {
      formData = new FormData();
      if (payload?.file_excel) {
        formData.append('file_excel', payload.file_excel);
      }
      if (payload?.warehouse_id) {
        formData.append('warehouse_id', payload.warehouse_id);
      }
    }
    const response = await axiosCustom('POST', `/api_web/Api_inventory/ImportDateExcel?csrf_protection=true`, formData);
    return response.data;
  },
};
export default apiInventory;
