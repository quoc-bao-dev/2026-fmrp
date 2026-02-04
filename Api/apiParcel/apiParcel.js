import { _ServerInstance as axiosCustom } from "@/services/axios";

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {Object} [data] - Response data payload
 * @property {number} [status] - HTTP status code
 * @property {string} [timestamp] - Response timestamp
 */

/**
 * @typedef {Object} ParcelData
 * @property {string|number} id - Parcel ID
 * @property {string|number} id_category - Category ID
 * @property {string} name - Parcel name
 * @property {string} content - Parcel content/description
 * @property {string} image - Parcel image URL
 * @property {string} status - Parcel status: "1" = đã ra mắt, "2" = sắp ra mắt
 * @property {string} type - Parcel type: "free" = miễn phí, "charge" = tính phí, "contact" = liên hệ
 * @property {string} price - Parcel price
 * @property {string} type_name - Type name display
 * @property {number} is_use - Installation status: 0 = chưa cài, 1 = đã cài
 * @property {string} [description] - Parcel description
 * @property {string} [created_at] - Creation timestamp
 * @property {string} [updated_at] - Update timestamp
 */

/**
 * @typedef {Object} GetParcelParams
 * @property {string|number} [id_category] - Category ID to filter parcels
 * @property {string} [search] - Search keyword to filter parcels by name or content
 */

/**
 * @typedef {Object} GetParcelResponse
 * @property {boolean} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {ParcelData[]} [data] - Array of parcel data objects
 * @property {number} [status] - HTTP status code
 */

/**
 * @typedef {Object} InstallParcelQRBank
 * @property {string} account_bank - Bank short code (e.g. "MBB")
 * @property {string} account_number - Bank account number
 * @property {string} account_name - Bank account display name
 * @property {number} amount - Payment amount
 * @property {string} note - Transfer note / reference (e.g. "UPL-1770107090")
 * @property {string} account_name_long - Full bank name with branch
 * @property {string} logo_bank - Bank logo URL
 */

/**
 * @typedef {Object} InstallParcelQRInfo
 * @property {boolean} status - QR generation status
 * @property {string} msg - QR generation message
 * @property {string} data - QR URL (payment gateway link)
 */

/**
 * @typedef {Object} InstallParcelQRData
 * @property {InstallParcelQRInfo} qr - QR information
 * @property {InstallParcelQRBank} bank - Bank information for manual transfer
 */

/**
 * @typedef {Object} InstallParcelResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {boolean} [need_payment] - Whether user needs to make a payment
 * @property {InstallParcelQRData} [qr] - QR and bank information for payment
 * @property {string} [url_install] - URL to trigger actual installation when payment is not required
 * @property {string} [message] - Response message (e.g. "Để sử dụng gói bạn cần thanh toán")
 */

/**
 * @typedef {Object} InstallStatusData
 * @property {boolean} success - Indicates if the installation process is finished successfully
 * @property {string} [message] - Status message from server
 * @property {Object} [meta] - Additional metadata if provided by backend
 */

/**
 * @typedef {Object} InstallStatusResponse
 * @property {boolean} isSuccess - Indicates if request to status API was successful
 * @property {string} [message] - Response message
 * @property {InstallStatusData} [data] - Installation status data
 * @property {number} [status] - HTTP status code
 */

const apiParcel = {
    /**
     * Get Parcel API
     * @description Retrieves list of parcels, optionally filtered by category ID and search keyword
     * @param {GetParcelParams} [params] - Query parameters (optional)
     * @param {string|number} [params.id_category] - Category ID to filter parcels
     * @param {string} [params.search] - Search keyword to filter parcels by name or content
     * @returns {Promise<GetParcelResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Basic usage - get all parcels
     * const result = await apiParcel.apiGetParcel();
     *
     * // With category filter
     * const result = await apiParcel.apiGetParcel({
     *   id_category: "1"
     * });
     *
     * // With search keyword
     * const result = await apiParcel.apiGetParcel({
     *   search: "lương"
     * });
     *
 * // Handle response
 * if (result.isSuccess) {
 *   console.log("Parcels:", result.data);
 *   // Parcels: [{ 
 *   //   id: "1", 
 *   //   name: "Lương sản lượng", 
 *   //   content: "Thống kê lương...", 
 *   //   image: "http://...", 
 *   //   status: "1", // "1" = đã ra mắt, "2" = sắp ra mắt
 *   //   type: "free", // "free" = miễn phí, "charge" = tính phí, "contact" = liên hệ
 *   //   price: "0",
 *   //   type_name: "Miễn Phí",
 *   //   is_use: 0 // 0 = chưa cài, 1 = đã cài
 *   // }, ...]
 * } else {
 *   console.error("Failed to get parcels:", result.message);
 * }
     */
    async apiGetParcel(params) {
        let url = `/api_web/api_parcel/parcel?csrf_protection=true`;

        if (params) {
            const searchParams = new URLSearchParams();

            Object.keys(params).forEach(key => {
                const value = params[key];
                if (Array.isArray(value)) {
                    // Serialize array thành format key[]=value1&key[]=value2
                    value.forEach(item => {
                        searchParams.append(`${key}[]`, item);
                    });
                } else if (value !== null && value !== undefined && value !== '') {
                    searchParams.append(key, value);
                }
            });

            const queryString = searchParams.toString();
            if (queryString) {
                url += '&' + queryString;
            }
        }

        const response = await axiosCustom('GET', url, {});
        return response.data;
    },

    /**
     * Install Parcel API
     * @description Marks a parcel as installed by its ID
     * @param {string|number} id - Parcel ID to install
     * @returns {Promise<InstallParcelResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Install parcel with ID 1
     * const result = await apiParcel.apiInstallParcel(1);
     *
 * if (result.success) {
 *   if (result.need_payment && result.qr) {
 *     // Show QR & bank info
 *     console.log('Payment required, QR info:', result.qr);
 *   } else if (!result.need_payment && result.url_install) {
 *     // Call install URL (GET) when payment is not required
 *     await fetch(result.url_install);
 *   }
 * } else {
 *   console.error('Failed to install parcel:', result.message);
 * }
     */
    async apiInstallParcel(id) {
        if (id === undefined || id === null || id === '') {
            throw new Error('Parcel ID is required for install_parcel API');
        }

        const url = `/api_web/api_parcel/install_parcel/${id}?csrf_protection=true`;
        const response = await axiosCustom('POST', url, {});
        return response.data;
    },

    /**
     * Get Install Status API
     * @description Checks current installation status of parcel/features
     * @returns {Promise<InstallStatusResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * const result = await apiParcel.apiGetInstallStatus();
     * if (result.isSuccess) {
     *   console.log('Install status:', result.data);
     * }
     */
    async apiGetInstallStatus() {
        const url = `/api_web/api_parcel/install?csrf_protection=true`;
        const response = await axiosCustom('GET', url, {});
        return response.data;
    },
};

export default apiParcel;
