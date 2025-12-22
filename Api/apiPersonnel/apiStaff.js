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

/**
 * @typedef {Object} BranchInfo
 * @property {string} id - Branch ID
 * @property {string} name - Branch name
 */

/**
 * @typedef {Object} StaffInfo
 * @property {string} id - Staff ID
 * @property {string|null} profile_image - URL to staff profile image (can be null)
 * @property {string} full_name - Full name of the staff
 */

/**
 * @typedef {Object} GroupMember
 * @property {string} id - Group ID
 * @property {string} code - Group code
 * @property {string} name - Group name
 * @property {string} active - Active status ("0" or "1")
 * @property {BranchInfo[]} branch - Array of branch information
 * @property {StaffInfo[]} staff - Array of staff members in the group
 */

/**
 * @typedef {Object} OutputData
 * @property {number} draw - Draw counter
 * @property {string} iTotalRecords - Total records count
 * @property {string} iTotalDisplayRecords - Total display records count
 * @property {number} next - Next page indicator
 * @property {Array} aaData - Additional data array
 */

/**
 * @typedef {Object} GroupMembersResponse
 * @property {GroupMember[]} rResult - List of groups with their members
 * @property {OutputData} output - Output metadata
 */

/**
 * @typedef {Object} CreateGroupMemberPayload
 * @property {string} name - Group name
 * @property {string} [code] - Group code
 * @property {number[]} id_staff - Array of staff IDs to add to the group
 * @property {number} branch_id - Branch ID
 */

/**
 * @typedef {Object} CreateGroupMemberResponse
 * @property {number} isSuccess - Indicates if the request was successful (1 for success)
 * @property {string} message - Response message
 * @property {Object} [data] - Response data payload (if available)
 */

/**
 * @typedef {Object} UpdateGroupMemberPayload
 * @property {string} name - Group name
 * @property {string} [code] - Group code
 * @property {number[]} id_staff - Array of staff IDs to add to the group
 * @property {number} branch_id - Branch ID
 */

/**
 * @typedef {Object} UpdateGroupMemberResponse
 * @property {boolean|number} isSuccess - Indicates if the request was successful (true or 1 for success)
 * @property {string} message - Response message key (e.g., "aler_success")
 * @property {number} [submitId] - ID of the updated group member
 */

/**
 * @typedef {Object} DeleteGroupMemberResponse
 * @property {boolean|number} isSuccess - Indicates if the request was successful (true or 1 for success)
 * @property {string} message - Response message key (e.g., "aler_success")
 * @property {number} [submitId] - ID of the deleted group member
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
    /**
     * Get group members
     * @description Fetch list of groups with their members and branch information
     * @returns {Promise<GroupMembersResponse>} Promise that resolves to API response
     * @returns {Promise<Object>} Response structure: { rResult: GroupMember[], output: OutputData }
     * @throws {Error} When API call fails
     * @example
     * const result = await apiSatff.apiGroupMembers();
     * // result structure:
     * // {
     * //   rResult: [
     * //     {
     * //       id: "5",
     * //       code: "N2",
     * //       name: "Nhom 2",
     * //       active: "0",
     * //       branch: [{ id: "44", name: "Cần Giờ" }],
     * //       staff: [
     * //         { id: "24", profile_image: null, full_name: "Huy" },
     * //         { id: "46", profile_image: "http://...", full_name: "vip12" }
     * //       ]
     * //     }
     * //   ],
     * //   output: {
     * //     draw: 0,
     * //     iTotalRecords: "2",
     * //     iTotalDisplayRecords: "2",
     * //     next: 0,
     * //     aaData: []
     * //   }
     * // }
     */
    async apiGroupMembers(params = {}) {
        const queryParams = {};

        if (Array.isArray(params.branch_id) && params.branch_id.length > 0) {
            params.branch_id.forEach((id, idx) => {
                queryParams[`filter[branch_id][${idx}]`] = id;
            });
        }

        if (
            Array.isArray(params.id_group_members) &&
            params.id_group_members.length > 0
        ) {
            params.id_group_members.forEach((groupId, idx) => {
                queryParams[`filter[id_group_members][${idx}]`] = groupId;
            });
        }

        if (params.search) {
            queryParams.search = params.search;
        }

        if (params.limit) {
            queryParams.limit = params.limit;
        }

        if (params.page) {
            queryParams.page = params.page;
        }

        const response = await axiosCustom(
            'GET',
            `/api_web/api_staff/group_members?csrf_protection=true`,
            Object.keys(queryParams).length ? { params: queryParams } : undefined
        );
        return response.data;
    },
    /**
     * Create group member
     * @description Create a new group with staff members using FormData
     * @param {CreateGroupMemberPayload} payload - Request payload
     * @param {string} payload.name - Group name
     * @param {number[]} payload.id_staff - Array of staff IDs
     * @param {number} payload.branch_id - Branch ID
     * @returns {Promise<CreateGroupMemberResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * const result = await apiSatff.apiCreateGroupMember({
     *   name: "Nhóm Gia Công",
     *   code: "N1",
     *   id_staff: [1, 2, 3],
     *   branch_id: 44
     * });
     * 
     * if (result.isSuccess === 1) {
     *   console.log("Group created successfully:", result.message);
     * } else {
     *   console.error("Failed to create group:", result.message);
     * }
     */
    async apiCreateGroupMember(payload) {
        const formData = new FormData();
        
        // Add group name
        formData.append('name', payload.name);
        
        // Add group code (if provided)
        if (payload.code) {
            formData.append('code', payload.code);
        }
        
        // Add staff IDs as array
        if (Array.isArray(payload.id_staff)) {
            payload.id_staff.forEach((staffId, index) => {
                formData.append(`id_staff[${index}]`, staffId.toString());
            });
        }
        
        // Add branch ID as array
        if (payload.branch_id) {
            formData.append('branch_id[0]', payload.branch_id.toString());
        }
        
        const response = await axiosCustom(
            'POST',
            `/api_web/api_staff/group_members?csrf_protection=true`,
            formData
        );
        return response.data;
    },

    /**
     * Update Group Member API
     * @description Update an existing group member by ID using FormData
     * @param {string|number} id - Group member ID to update
     * @param {UpdateGroupMemberPayload} payload - Request payload
     * @param {string} payload.name - Group name
     * @param {string} [payload.code] - Group code
     * @param {number[]} payload.id_staff - Array of staff IDs
     * @param {number} payload.branch_id - Branch ID
     * @returns {Promise<UpdateGroupMemberResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * const result = await apiSatff.apiUpdateGroupMember(5, {
     *   name: "Nhóm Gia Công Cập Nhật",
     *   code: "N1",
     *   id_staff: [1, 2, 3],
     *   branch_id: 44
     * });
     * 
     * if (result.isSuccess === true || result.isSuccess === 1) {
     *   console.log("Group updated successfully:", result.message);
     *   console.log("Updated ID:", result.submitId);
     * } else {
     *   console.error("Failed to update group:", result.message);
     * }
     */
    async apiUpdateGroupMember(id, payload) {
        const formData = new FormData();
        
        // Add group name
        formData.append('name', payload.name);
        
        // Add group code (if provided)
        if (payload.code) {
            formData.append('code', payload.code);
        }
        
        // Add staff IDs as array
        if (Array.isArray(payload.id_staff)) {
            payload.id_staff.forEach((staffId, index) => {
                formData.append(`id_staff[${index}]`, staffId.toString());
            });
        }
        
        // Add branch ID as array
        if (payload.branch_id) {
            formData.append('branch_id[0]', payload.branch_id.toString());
        }
        
        const response = await axiosCustom(
            'POST',
            `/api_web/api_staff/group_members/${id}?csrf_protection=true`,
            formData
        );
        return response.data;
    },

    /**
     * Delete Group Member API
     * @description Delete a group member by ID
     * @param {string|number} id - Group member ID to delete
     * @returns {Promise<DeleteGroupMemberResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Delete a group member
     * const result = await apiSatff.apiDeleteGroupMember(5);
     * 
     * // Handle response
     * if (result.isSuccess === true || result.isSuccess === 1) {
     *   console.log("Group deleted successfully:", result.message);
     *   console.log("Deleted ID:", result.submitId);
     * } else {
     *   console.error("Failed to delete group:", result.message);
     * }
     */
    async apiDeleteGroupMember(id) {
        const response = await axiosCustom(
            'DELETE',
            `/api_web/api_staff/group_members/${id}?csrf_protection=true`
        );
        return response.data;
    },
}
export default apiSatff