import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {Object} HistoryUpgradePackageParams
 * @property {string} [page] - Page number for pagination
 * @property {string} [limit] - Number of items per page
 * @property {string} [date_start] - Start date filter
 * @property {string} [date_end] - End date filter
 */

/**
 * @typedef {Object} HistoryUpgradePackageItem
 * @property {string} id - Upgrade package history record ID
 * @property {string} code - Transaction code (e.g., "JQKA-1745828538")
 * @property {string} name_package - Package name (e.g., "Professional")
 * @property {string|null} name_package_detail - Package detail name (e.g., "Professional - Thời Hạn 12 Tháng")
 * @property {string} number_of_users - Number of users in the package
 * @property {string} vat - VAT percentage
 * @property {string|null} service_add - Additional service description (e.g., "Training online - 5 đ/buổi/60p")
 * @property {string} money_need_paid - Total amount that needs to be paid
 * @property {string} amount_paid - Amount already paid
 * @property {string} status - Status of the upgrade (e.g., "success", "create")
 * @property {string} date_create - Creation date and time (format: "YYYY-MM-DD HH:mm:ss")
 * @property {string|null} full_note_price - Full price note (e.g., "35 đ/user/tháng")
 * @property {string} type_upgrade_package - Type of upgrade package (e.g., "1")
 * @property {string} type_upgrade_package_name - Type name (e.g., "Nâng Cấp Gói Pro")
 * @property {string} name_status - Status name in Vietnamese (e.g., "Hoàn Tất", "Đang Xử Lý")
 */

/**
 * @typedef {Object} HistoryUpgradePackageResponse
 * @property {boolean} result - Indicates if the request was successful
 * @property {HistoryUpgradePackageItem[]} data - Array of upgrade package history records
 */

const apiUpgradePackage = {
  async apiGetUpgradePackage() {
    const response = await axiosCustom('POST', `/api_web/Api_upgrade_package/get_upgrade_package?csrf_protection=true`);
    return response.data;
  },
  async apiGetPackage(data) {
    const response = await axiosCustom('POST', `/api_web/Api_upgrade_package/get_package/?csrf_protection=true`, data);
    return response.data;
  },
  async apiGetServiceAdd(data) {
    const response = await axiosCustom('POST', `/api_web/Api_upgrade_package/get_service_add?csrf_protection=true`, data);
    return response.data;
  },
  async apiUpgradePackage(id, data) {
    const response = await axiosCustom('POST', `/api_web/Api_upgrade_package/upgrade_package/${id}?csrf_protection=true`, data);
    return response.data;
  },
  /**
   * Get History Upgrade Package API
   * @description Fetches the history of upgrade package transactions from the server
   * @param {HistoryUpgradePackageParams} [params={}] - Optional query parameters for filtering and pagination
   * @returns {Promise<HistoryUpgradePackageResponse>} Promise that resolves to history upgrade package data
   * @throws {Error} When the API call fails
   * @example
   * // Fetch all history records
   * const response = await apiUpgradePackage.apiHistoryUpgradePackage();
   * // Response: { result: true, data: [{ id: "1", code: "JQKA-1745828538", ... }, ...] }
   *
   * // Fetch history with pagination
   * const response = await apiUpgradePackage.apiHistoryUpgradePackage({
   *   page: '1',
   *   limit: '10'
   * });
   *
   * // Fetch history with date filter
   * const response = await apiUpgradePackage.apiHistoryUpgradePackage({
   *   date_start: '2024-01-01',
   *   date_end: '2024-12-31'
   * });
   *
   * // Access history items
   * if (response.result && response.data) {
   *   response.data.forEach(item => {
   *     console.log(item.code, item.name_package, item.status);
   *   });
   * }
   */
  async apiHistoryUpgradePackage(params = {}) {
    const response = await axiosCustom('GET', `/api_web/Api_upgrade_package/history_upgrade_package?csrf_protection=true`, {
      params,
    });
    return response.data;
  },
};
export default apiUpgradePackage;
