import { _ServerInstance as axiosCustom } from "@/services/axios";

/**
 * @typedef {Object} SetupShiftItem
 * @property {string} id - Shift ID
 * @property {string} name - Shift name (e.g., "Ca hành chính")
 * @property {string} time_start - Start time in format "HH:mm:ss" (e.g., "08:00:00")
 * @property {string} time_end - End time in format "HH:mm:ss" (e.g., "17:00:00")
 * @property {string} branch_id - Branch ID
 * @property {string} days - Days of week as comma-separated string (e.g., "Mon,Tue,Wed")
 * @property {string} branch_name - Branch name (e.g., "Linh Đông")
 */

/**
 * @typedef {Object} SetupShiftOutput
 * @property {number} draw - Draw number for DataTables
 * @property {string} iTotalRecords - Total records count
 * @property {string} iTotalDisplayRecords - Total display records count
 * @property {number} next - Next page indicator (0 = no next page, 1 = has next page)
 * @property {Array} aaData - Additional data array (usually empty)
 */

/**
 * @typedef {Object} SetupShiftResponse
 * @property {SetupShiftItem[]} rResult - Array of shift settings
 * @property {SetupShiftOutput} output - Pagination and metadata information
 */

const apiShiftSetting = {
    /**
     * Get Setup Shift API
     * @description Get list of shift settings with pagination information
     * @param {Object} [param] - Optional query parameters
     * @param {number} [param.page] - Page number (default: 1)
     * @param {number} [param.limit] - Number of records per page
     * @param {string} [param.search] - Search keyword
     * @param {string} [param.time] - Time frame filter in format "HH:mm:ss-HH:mm:ss" (e.g., "08:00:00-17:00:00")
     * @returns {Promise<SetupShiftResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Get all shift settings
     * const result = await apiShiftSetting.apiSetupShift();
     * console.log('Shift settings:', result.rResult);
     * console.log('Total records:', result.output.iTotalRecords);
     * 
     * // Get with pagination
     * const result = await apiShiftSetting.apiSetupShift({ page: 1, limit: 10 });
     * 
     * // Get with search
     * const result = await apiShiftSetting.apiSetupShift({ page: 1, limit: 10, search: 'Ca hành chính' });
     * 
     * // Get with time filter
     * const result = await apiShiftSetting.apiSetupShift({ page: 1, limit: 10, time: '08:00:00-17:00:00' });
     * 
     * // Access shift data
     * result.rResult.forEach(shift => {
     *   console.log(`${shift.name}: ${shift.time_start} - ${shift.time_end}`);
     *   console.log(`Days: ${shift.days}`);
     *   console.log(`Branch: ${shift.branch_name}`);
     * });
     */
    async apiSetupShift(param) {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (param?.page) {
            queryParams.append('page', param.page.toString());
        }
        if (param?.limit) {
            queryParams.append('limit', param.limit.toString());
        }
        if (param?.search) {
            queryParams.append('search', param.search);
        }
        if (param?.time) {
            queryParams.append('filter[time]', param.time);
        }
        
        // Thêm filter[id_setup_shift][0], filter[id_setup_shift][1], ...
        if (param?.['filter[id_setup_shift]'] && Array.isArray(param['filter[id_setup_shift]'])) {
            param['filter[id_setup_shift]'].forEach((id, index) => {
                queryParams.append(`filter[id_setup_shift][${index}]`, id.toString());
            });
        }
        
        // Thêm filter[branch_id][0], filter[branch_id][1], ...
        if (param?.['filter[branch_id]'] && Array.isArray(param['filter[branch_id]'])) {
            param['filter[branch_id]'].forEach((id, index) => {
                queryParams.append(`filter[branch_id][${index}]`, id.toString());
            });
        }
        
        const queryString = queryParams.toString();
        const url = queryString 
            ? `/api_web/api_setup_shift/setup_shift?${queryString}`
            : `/api_web/api_setup_shift/setup_shift`;
        
        const response = await axiosCustom('GET', url, param);
        return response.data
    },

    /**
     * Create/Update Setup Shift API
     * @description Create or update a shift setting using FormData
     * @param {Object} payload - Request payload
     * @param {string} payload.name - Shift name (e.g., "Ca hành chính")
     * @param {string} payload.time_start - Start time in format "HH:mm:ss" (e.g., "08:00:00")
     * @param {string} payload.time_end - End time in format "HH:mm:ss" (e.g., "17:00:00")
     * @param {string|number} payload.branch_id - Branch ID
     * @param {string[]} payload.days - Array of day codes (e.g., ["Mon", "Tue", "Wed"])
     * @param {string|number} [payload.id] - Shift ID (for update, omit for create)
     * @returns {Promise<Object>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Create new shift
     * const result = await apiShiftSetting.apiSaveSetupShift({
     *   name: "Ca hành chính",
     *   time_start: "08:00:00",
     *   time_end: "17:00:00",
     *   branch_id: 1,
     *   days: ["Mon", "Tue", "Wed"]
     * });
     * 
     * // Update existing shift
     * const result = await apiShiftSetting.apiSaveSetupShift({
     *   id: "1",
     *   name: "Ca hành chính",
     *   time_start: "08:00:00",
     *   time_end: "17:00:00",
     *   branch_id: 1,
     *   days: ["Mon", "Tue", "Wed"]
     * });
     */
    async apiSaveSetupShift(payload) {
        const formData = new FormData();
        
        // Add id if provided (for update)
        if (payload.id) {
            formData.append('id', payload.id.toString());
        }
        
        // Add shift name
        formData.append('name', payload.name);
        
        // Add time start
        formData.append('time_start', payload.time_start);
        
        // Add time end
        formData.append('time_end', payload.time_end);
        
        // Add branch ID
        formData.append('branch_id', payload.branch_id.toString());
        
        // Add days as array: days[0], days[1], days[2], ...
        if (Array.isArray(payload.days)) {
            payload.days.forEach((day, index) => {
                formData.append(`days[${index}]`, day);
            });
        }
        
        const response = await axiosCustom(
            'POST',
            `/api_web/api_setup_shift/setup_shift`,
            formData
        );
        return response.data;
    },

    /**
     * Update Setup Shift API
     * @description Update an existing shift setting by ID using FormData
     * @param {string|number} id - Shift ID to update
     * @param {Object} payload - Request payload
     * @param {string} payload.name - Shift name (e.g., "Ca hành chính")
     * @param {string} payload.time_start - Start time in format "HH:mm:ss" (e.g., "08:00:00")
     * @param {string} payload.time_end - End time in format "HH:mm:ss" (e.g., "17:00:00")
     * @param {string|number} payload.branch_id - Branch ID
     * @param {string[]} payload.days - Array of day codes (e.g., ["Mon", "Tue", "Wed"])
     * @returns {Promise<Object>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Update existing shift
     * const result = await apiShiftSetting.apiUpdateSetupShift("1", {
     *   name: "Ca hành chính",
     *   time_start: "08:00:00",
     *   time_end: "17:00:00",
     *   branch_id: 1,
     *   days: ["Mon", "Tue", "Wed"]
     * });
     * 
     * if (result.isSuccess === true || result.isSuccess === 1) {
     *   console.log("Shift updated successfully:", result.message);
     * } else {
     *   console.error("Failed to update shift:", result.message);
     * }
     */
    async apiUpdateSetupShift(id, payload) {
        const formData = new FormData();
        
        // Add shift name
        formData.append('name', payload.name);
        
        // Add time start
        formData.append('time_start', payload.time_start);
        
        // Add time end
        formData.append('time_end', payload.time_end);
        
        // Add branch ID
        formData.append('branch_id', payload.branch_id.toString());
        
        // Add days as array: days[0], days[1], days[2], ...
        if (Array.isArray(payload.days)) {
            payload.days.forEach((day, index) => {
                formData.append(`days[${index}]`, day);
            });
        }
        
        const response = await axiosCustom(
            'POST',
            `/api_web/api_setup_shift/setup_shift/${id}`,
            formData
        );
        return response.data;
    },

    /**
     * Delete Setup Shift API
     * @description Delete a shift setting by ID
     * @param {string|number} id - Shift ID to delete
     * @returns {Promise<Object>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Delete a shift
     * const result = await apiShiftSetting.apiDeleteSetupShift("1");
     * 
     * if (result.isSuccess === true || result.isSuccess === 1) {
     *   console.log("Shift deleted successfully:", result.message);
     * } else {
     *   console.error("Failed to delete shift:", result.message);
     * }
     */
    async apiDeleteSetupShift(id) {
        const response = await axiosCustom(
            'DELETE',
            `/api_web/api_setup_shift/setup_shift/${id}`
        );
        return response.data;
    },
}

export default apiShiftSetting

