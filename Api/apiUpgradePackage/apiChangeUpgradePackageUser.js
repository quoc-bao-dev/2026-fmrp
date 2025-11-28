import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {FormData|Object} ChangeUpgradePackageUserPayload
 * @property {string|number} number_of_users - Number of additional users to request
 */

/**
 * @typedef {Object} ChangeUpgradePackageUserResponse
 * @property {boolean} [result] - Indicates if the request was successful
 * @property {string} [message] - Response message from the server
 * @property {any} [data] - Response data (structure defined by backend)
 * @property {any} [dataQR] - QR information returned by the backend
 * @property {any} [package] - Package metadata returned by the backend
 */

const apiChangeUpgradePackageUser = {
  /**
   * Change Upgrade Package User API
   * @description Retrieves interface details and QR information when updating the number of users in the upgrade package
   * @param {ChangeUpgradePackageUserPayload} payload - Request payload (expects FormData with `number_of_users`)
   * @returns {Promise<ChangeUpgradePackageUserResponse>} Promise that resolves to API response
   * @throws {Error} When the API call fails
   * @example
   * // Change number of users to 15
   * const formData = new FormData();
   * formData.append('number_of_users', '15');
   *
   * const response = await apiChangeUpgradePackageUser.changeUpgradePackageUser(formData);
   *
   * if (response?.result) {
   *   console.log('QR URL:', response?.dataQR?.qr?.data);
   * }
   */
  async changeUpgradePackageUser(payload) {
    const response = await axiosCustom('POST', `/api_web/Api_upgrade_package/change_upgrade_package_user?csrf_protection=true`, payload);

    return response.data;
  },
};

export default apiChangeUpgradePackageUser;
