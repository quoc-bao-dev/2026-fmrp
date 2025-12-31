import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {Object} ScheduleHeader
 * @property {string} label - Header label (e.g., "T2 29/12")
 * @property {string} date - Date in YYYY-MM-DD format (e.g., "2025-12-29")
 */

/**
 * @typedef {Object} ScheduleShift
 * @property {*} [shift_data] - Shift data (structure depends on shift type)
 */

/**
 * @typedef {Object} ScheduleRow
 * @property {string|number} staff_id - Staff ID
 * @property {string} staff_name - Staff full name
 * @property {string|null} avatar - URL to staff avatar image or null
 * @property {ScheduleShift[][]} shifts - Array of shift arrays, one array per day (matches headers length)
 */

/**
 * @typedef {Object} GetScheduleTableData
 * @property {ScheduleHeader[]} headers - Array of schedule headers (days)
 * @property {ScheduleRow[]} rows - Array of staff schedule rows
 */

/**
 * @typedef {Object} GetScheduleTableResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {GetScheduleTableData} data - Response data payload containing headers and rows
 */

/**
 * @typedef {Object} UpdateScheduleTablePayload
 * @property {string|number} staff_id - Staff ID
 * @property {string} date - Date in YYYY-MM-DD format
 * @property {*} shift_data - Shift data to update (structure depends on shift type)
 */

/**
 * @typedef {Object} UpdateScheduleTableResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {Object} [data] - Response data payload
 */

/**
 * @typedef {Object} DeleteScheduleTableResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {Object} [data] - Response data payload
 */

/**
 * @typedef {Object} ShiftData
 * @property {string|number} id - Shift ID
 * @property {string} name - Shift name (e.g., "Ca sáng 2")
 * @property {string} time_start - Shift start time in HH:mm:ss format (e.g., "08:00:00")
 * @property {string} time_end - Shift end time in HH:mm:ss format (e.g., "12:30:00")
 * @property {string|number} branch_id - Branch ID that this shift belongs to
 */

/**
 * @typedef {Object} GetShiftsByBranchResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {ShiftData[]} [data] - Array of shift data objects
 */

const apiShiftSchedule = {
  /**
   * Get Schedule Table API
   * @description Retrieves the schedule table data with headers (days) and rows (staff schedules)
   * @param {Object} [params] - Query parameters (optional)
   * @param {string} [params.date] - Start date filter (YYYY-MM-DD format)
   * @param {number|string} [params.branch_id] - Branch ID filter
   * @param {number|string} [params.staff_id] - Staff ID filter
   * @returns {Promise<GetScheduleTableResponse>} Promise that resolves to API response
   * @throws {Error} When API call fails
   * @example
   * // Basic usage
   * const result = await apiShiftSchedule.apiGetScheduleTable();
   *
   * // With query parameters
   * const result = await apiShiftSchedule.apiGetScheduleTable({
   *   date: "2025-12-29",
   *   branch_id: 1
   * });
   *
   * // Handle response
   * if (result.success) {
   *   console.log("Headers:", result.data.headers);
   *   // Headers: [{ label: "T2 29/12", date: "2025-12-29" }, ...]
   *
   *   console.log("Rows:", result.data.rows);
   *   // Rows: [{ staff_id: "1", staff_name: "foso1", avatar: "...", shifts: [[], [], ...] }, ...]
   *
   *   // Access specific staff schedule
   *   result.data.rows.forEach(row => {
   *     console.log(`${row.staff_name} schedule:`, row.shifts);
   *   });
   * } else {
   *   console.error("Failed to get schedule table");
   * }
   */
  async apiGetScheduleTable(params) {
    // Xử lý branch_id array để serialize thành branch_id[]=59&branch_id[]=61
    let url = `/api_web/Api_shift_schedule/get_schedule_table?csrf_protection=true`;

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
   * Update Schedule Table API
   * @description Updates schedule table data for a specific staff and date
   * @param {UpdateScheduleTablePayload} payload - Request payload
   * @param {string|number} payload.staff_id - Staff ID
   * @param {string} payload.date - Date in YYYY-MM-DD format
   * @param {*} payload.shift_data - Shift data to update
   * @returns {Promise<UpdateScheduleTableResponse>} Promise that resolves to API response
   * @throws {Error} When API call fails
   * @example
   * // Update schedule table for a staff on a specific date
   * const result = await apiShiftSchedule.apiUpdateScheduleTable({
   *   staff_id: "1",
   *   date: "2025-12-29",
   *   shift_data: { shift_id: 1, start_time: "08:00", end_time: "17:00" }
   * });
   *
   * // Handle response
   * if (result.success) {
   *   console.log("Schedule updated successfully:", result.message);
   * } else {
   *   console.error("Failed to update schedule:", result.message);
   * }
   */
  async apiUpdateScheduleTable(payload) {
    const response = await axiosCustom('POST', `/api_web/Api_shift_schedule/update_schedule_table?csrf_protection=true`, { data: payload });
    return response.data;
  },

  /**
   * Delete Schedule Table API
   * @description Deletes a schedule table entry (no payload required, only ID in URL)
   * @param {number|string} id - Schedule table ID to delete
   * @returns {Promise<DeleteScheduleTableResponse>} Promise that resolves to API response
   * @throws {Error} When API call fails
   * @example
   * // Delete schedule table entry
   * const result = await apiShiftSchedule.apiDeleteScheduleTable(1);
   *
   * // Handle response
   * if (result.success) {
   *   console.log("Schedule deleted successfully:", result.message);
   * } else {
   *   console.error("Failed to delete schedule:", result.message);
   * }
   */
  async apiDeleteScheduleTable(id) {
    const response = await axiosCustom('DELETE', `/api_web/Api_shift_schedule/delete_schedule_table/${id}?csrf_protection=true`);
    return response.data;
  },

  /**
   * Get Shifts By Branch API
   * @description Retrieves list of shifts filtered by branch IDs
   * @param {Object} [params] - Query parameters (optional)
   * @param {number[]|string[]} [params.branch_id] - Array of branch IDs to filter shifts
   * @returns {Promise<GetShiftsByBranchResponse>} Promise that resolves to API response
   * @throws {Error} When API call fails
   * @example
   * // Basic usage with single branch
   * const result = await apiShiftSchedule.apiGetShiftsByBranch({
   *   branch_id: [59]
   * });
   *
   * // With multiple branches
   * const result = await apiShiftSchedule.apiGetShiftsByBranch({
   *   branch_id: [59, 61]
   * });
   *
   * // Handle response
   * if (result.success) {
   *   console.log("Shifts:", result.data);
   *   // Shifts: [{ id: "3", name: "Ca sáng 2", time_start: "08:00:00", time_end: "12:30:00", branch_id: "61" }, ...]
   * } else {
   *   console.error("Failed to get shifts:", result.message);
   * }
   */
  async apiGetShiftsByBranch(params) {
    // Xử lý branch_id array để serialize thành branch_id[]=59&branch_id[]=61
    let url = `/api_web/api_setup_shift/get_shifts_by_branch?csrf_protection=true`;

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

export default apiShiftSchedule;
