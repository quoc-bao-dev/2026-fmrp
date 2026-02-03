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
};

export default apiParcel;
