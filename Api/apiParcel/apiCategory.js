import { _ServerInstance as axiosCustom } from "@/services/axios";

/**
 * @typedef {Object} CategoryData
 * @property {string|number} id - Category ID (0 for "Tất cả", "1" for "Sản Xuất", etc.)
 * @property {string} name - Category name
 */

/**
 * @typedef {Object} GetCategoryResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {CategoryData[]} data - Array of category data objects
 */

const apiCategory = {
    /**
     * Get Category API
     * @description Retrieves list of parcel categories
     * @param {Object} [params] - Query parameters (optional)
     * @returns {Promise<GetCategoryResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Basic usage
     * const result = await apiCategory.apiGetCategory();
     *
     * // With query parameters
     * const result = await apiCategory.apiGetCategory({
     *   search: "electronics",
     *   limit: 10
     * });
     *
     * // Handle response
     * if (result.success) {
     *   console.log("Categories:", result.data);
     *   // Categories: [{ id: 0, name: "Tất cả" }, { id: "1", name: "Sản Xuất" }, ...]
     * } else {
     *   console.error("Failed to get categories");
     * }
     */
    async apiGetCategory(params) {
        let url = `/api_web/api_parcel/category?csrf_protection=true`;

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

export default apiCategory;
