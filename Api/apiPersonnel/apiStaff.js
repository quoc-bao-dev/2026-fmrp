import { _ServerInstance as axiosCustom } from "@/services/axios";

/**
 * @typedef {Object} SearchStaffsPayload
 * @property {number[]} [branch_ids] - Array of branch IDs to filter staffs
 */

/**
 * @typedef {Object} StaffData
 * @property {string} staffid - Staff ID
 * @property {string} full_name - Full name of the staff
 * @property {string} phonenumber - Phone number of the staff
 * @property {string} profile_image - URL to staff profile image
 * @property {string} name_position - Name of the position/department
 * @property {string} email - Email address of the staff
 * @property {string} color_position - Color code for the position (hex format)
 * @property {string|null} code - Staff code (can be null)
 */

/**
 * @typedef {Object} SearchStaffsResponse
 * @property {number} isSuccess - Indicates if the request was successful (1 for success)
 * @property {string} message - Response message
 * @property {string} branch_name - Branch name (can be empty string)
 * @property {Object} data - Response data payload
 * @property {StaffData[]} data.staffs - List of staffs
 */

const apiSatff = {
    async apiListStaff(params) {
        const response = await axiosCustom('GET', `/api_web/api_staff/staff/?csrf_protection=true`, params);
        return response.data
    },
    async apiListPositionOption(params) {
        const response = await axiosCustom('GET', `/api_web/api_staff/positionOption`, params);
        return response.data
    },
    async apiHandingStatus(data, id) {
        const response = await axiosCustom('POST', `/api_web/api_staff/change_status_staff/${id}?csrf_protection=true`, data);
        return response.data
    },
    async apiDetailStaff(id) {
        const response = await axiosCustom('GET', `/api_web/api_staff/staff/${id}?csrf_protection=true`,);
        return response.data
    },
    async apiPermissionsStaff(id, params) {
        const response = await axiosCustom('GET', id ? `/api_web/api_staff/getPermissionsStaff/${id}?csrf_protection=true` : `/api_web/api_staff/getPermissionsStaff?csrf_protection=true`, params ?? undefined);
        return response.data
    },
    async apiHandingStaff(id, data) {
        const response = await axiosCustom('POST', id ? `/api_web/api_staff/staff/${id}?csrf_protection=true` : `/api_web/api_staff/staff?csrf_protection=true`, data);
        return response.data
    },
    async apiManageStaff(id) {
        const response = await axiosCustom('GET', `/api_web/api_staff/staffManage/${id}?csrf_protection=true`);
        return response.data
    },
    /**
     * Search Staffs API
     * @description Get list of staffs for combobox, filtered by branch IDs
     * @param {SearchStaffsPayload} [params] - Request parameters
     * @param {number[]} [params.branch_ids] - Array of branch IDs to filter staffs
     * @returns {Promise<SearchStaffsResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Search staffs by branch IDs
     * const result = await apiSatff.apiSearchStaffs({
     *   branch_ids: [1, 2]
     * });
     *
     * // Handle response
     * if (result.isSuccess === 1) {
     *   console.log("Staffs found:", result.data.staffs);
     *   console.log("Branch name:", result.branch_name);
     *   console.log("Message:", result.message);
     *   // Access staff data
     *   result.data.staffs.forEach(staff => {
     *     console.log(`${staff.full_name} - ${staff.email}`);
     *   });
     * } else {
     *   console.error("Search failed:", result.message);
     * }
     */
    async apiSearchStaffs(params) {
        const queryParams = {};
        
        if (params?.branch_ids && Array.isArray(params.branch_ids)) {
            queryParams.branch_ids = params.branch_ids;
        }
        
        if (params?.po_id) {
            queryParams.po_id = params.po_id;
        }
        const response = await axiosCustom('GET', `/api_web/Api_staff/searchStaffs?csrf_protection=true`, { params: queryParams });
        return response.data
    },
}
export default apiSatff