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
 * @property {string} type_upgrade_package - Type of upgrade package ("1" -> nâng cấp, "2" -> mua user, "3" -> gia hạn)
 * @property {string} type_upgrade_package_name - Type name (e.g., "Nâng Cấp Gói Pro")
 * @property {string} name_status - Status name in Vietnamese (e.g., "Hoàn Tất", "Đang Xử Lý")
 */

/**
 * @typedef {Object} HistoryUpgradePackageResponse
 * @property {boolean} result - Indicates if the request was successful
 * @property {HistoryUpgradePackageItem[]} data - Array of upgrade package history records
 */

/**
 * @typedef {Object} UpgradeUserQRData
 * @property {string} id - Upgrade package record ID
 * @property {string} code - Transaction code (e.g., "JQKA-1764218509")
 * @property {string} id_client - Client ID
 * @property {string} id_package - Package ID
 * @property {string} id_package_detail - Package detail ID
 * @property {string} number_of_users - Number of users
 * @property {string} status - Status of the upgrade (e.g., "create")
 * @property {string} vat - VAT percentage
 * @property {string} money_need_paid - Total amount that needs to be paid
 * @property {string} money_service_add - Additional service amount
 * @property {string} amount_paid - Amount already paid
 * @property {string} create_by - User ID who created the record
 * @property {string} date_create - Creation date and time (format: "YYYY-MM-DD HH:mm:ss")
 * @property {any|null} log_before_upgrade - Log before upgrade information
 * @property {string} type_upgrade_package - Type of upgrade package ("1" -> nâng cấp, "2" -> mua user, "3" -> gia hạn)
 * @property {string} [userPlus] - Number of additional users to purchase (only for type "2" - mua user)
 * @property {string} price - Unit price per user
 * @property {number} month - Package duration in months
 */

/**
 * @typedef {Object} QRInfo
 * @property {boolean} status - QR status
 * @property {string} msg - QR message
 * @property {string} data - QR code URL
 */

/**
 * @typedef {Object} BankInfo
 * @property {string} account_bank - Bank code (e.g., "MBB")
 * @property {string} account_number - Bank account number
 * @property {string} account_name - Bank account name (e.g., "MB Bank")
 * @property {number} amount - Payment amount
 * @property {string} note - Payment note (transaction code)
 * @property {string} account_name_long - Full bank name (e.g., "Ngân hàng quân đội - Chi nhánh TP HCM")
 * @property {string} logo_bank - Bank logo URL
 */

/**
 * @typedef {Object} UpgradeUserQRDataQR
 * @property {QRInfo} qr - QR code information
 * @property {BankInfo} bank - Bank transfer information
 */

/**
 * @typedef {Object} GetUpgradeUserQRResponse
 * @property {boolean} result - Indicates if the request was successful
 * @property {UpgradeUserQRData} data - Upgrade package data
 * @property {UpgradeUserQRDataQR} dataQR - QR code and bank information
 * @property {UpgradePackageInfo} [package] - Package metadata (name, price, duration)
 */

/**
 * @typedef {Object} UpgradePackageInfo
 * @property {string} id - Package detail ID
 * @property {string} id_package_service - Package service ID
 * @property {string} fullname - Full package name (e.g., "Professional - Thời Hạn 12 Tháng")
 * @property {string} full_note_price - Price note (e.g., "35 đ/user/tháng")
 * @property {string} price - Package price per user
 * @property {string} month - Package duration in months (string number)
 * @property {string} default_user - Default number of users
 * @property {string} is_default - Whether this package is default ("1" / "0")
 * @property {string} level_service - Service level indicator
 * @property {string} date_create - Creation timestamp
 * @property {string} active - Active status ("1" / "0")
 * @property {string} order_by - Ordering value
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

  /**
   * Get Upgrade User QR Info API
   * @description Fetches interface information and QR code for upgrading/add more users
   * @returns {Promise<GetUpgradeUserQRResponse>} Promise that resolves to upgrade user QR information
   * @throws {Error} When the API call fails
   * @example
   * // Fetch upgrade user QR info
   * const response = await apiUpgradePackage.apiGetUpgradeUserQR();
   *
   * // Handle response
   * if (response.result) {
   *   console.log("Transaction code:", response.data.code);
   *   console.log("User plus:", response.data.userPlus);
   *   console.log("QR URL:", response.dataQR.qr.data);
   *   console.log("Bank info:", response.dataQR.bank);
   * }
   */
  async apiGetUpgradeUserQR() {
    const response = await axiosCustom('GET', `/api_web/Api_upgrade_package/get_upgrade_package_user?csrf_protection=true`);
    return response.data;
  },

  /**
   * Request For Invoice API
   * @description Requests an invoice for a specific upgrade package transaction by ID
   * @param {string|number} id - Upgrade package transaction ID (obtained from get_upgrade_package API response)
   * @returns {Promise<any>} Promise that resolves to invoice request response
   * @throws {Error} When the API call fails or ID is missing
   * @example
   * // Request invoice for upgrade package ID
   * const response = await apiUpgradePackage.apiRequestForInvoice('123');
   *
   * // First get upgrade package data to get the ID
   * const upgradeData = await apiUpgradePackage.apiGetUpgradePackage();
   * if (upgradeData?.data?.id) {
   *   const invoiceResponse = await apiUpgradePackage.apiRequestForInvoice(upgradeData.data.id);
   * }
   */
  async apiRequestForInvoice(id) {
    if (id === undefined || id === null || id === '') {
      throw new Error('Upgrade package ID is required for Request_for_invoice API');
    }

    const response = await axiosCustom('GET', `/api_web/Api_upgrade_package/Request_for_invoice/${id}?csrf_protection=true`);
    return response.data;
  },
};
export default apiUpgradePackage;
