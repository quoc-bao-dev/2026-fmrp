import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {Object} ActiveRobotDetailParams
 * @property {string} data - Identifier appended to the endpoint path (e.g. robot code or slug)
 */

/**
 * @typedef {Object} RobotSupportOption
 * @property {string} id - Option identifier
 * @property {string} id_robot_support - Robot support identifier
 * @property {string} name - Option name/title
 * @property {string} level - Option level/priority
 * @property {string|null} link - Optional link URL
 * @property {string} content - Option display text (may contain HTML entities)
 * @property {string|null} file - Optional file attachment
 * @property {string} type_send - Type indicator ("0" for negative/error, "1" for positive/success)
 * @property {string} event_show - Event display type (e.g. "options")
 * @property {string|null} event_app - App-specific event name
 * @property {string|null} show_move_event - Event to trigger UI transition
 * @property {string|boolean} next - Next API endpoint URL or false if no next step
 */

/**
 * @typedef {Object} ActiveRobotDetailData
 * @property {string} id_robot_support - Robot support identifier
 * @property {string} id_robot_support_detail - Support detail identifier
 * @property {number} id_client - Client/company identifier
 * @property {string|null} session - Deprecated session value (always null in sample)
 * @property {string} session_chat - Session identifier for the chat thread
 * @property {number} is_read - Whether the intro message has been read (0/1)
 * @property {string} type_send - Message type flag returned by backend
 * @property {string} message - HTML string for welcome/intro content
 * @property {string} event - Event type (e.g. "start")
 * @property {string|null} file - Attachment info if any
 * @property {number} suport_items - Number of support items linked to this node
 * @property {any} json_item - Additional JSON payload when support items exist
 * @property {string|null} show_move_event - Event to trigger UI transition (null by default)
 * @property {string} is_function - Backend function tag (e.g. "active_robot_detail")
 * @property {number} id - Row identifier of current event
 * @property {string|null} event_app - App-specific event name
 * @property {string} event_show - Event label for UI
 * @property {number} session_robot - Session identifier used for subsequent API calls
 * @property {RobotSupportOption[]} [options] - Array of selectable options when event_show is "options"
 */

/**
 * @typedef {Object} ActiveRobotDetailResponse
 * @property {boolean} result - Indicates if request succeeded
 * @property {ActiveRobotDetailData} data - Robot detail payload
 * @property {string} [next] - URL for fetching the next event/state
 */

const apiActiveRobotDetail = {
  /**
   * Get Active Robot Detail API
   * @description Retrieves activation detail of a chatbot robot by dynamic `$data` identifier
   * @param {ActiveRobotDetailParams} params - Request params
   * @returns {Promise<ActiveRobotDetailResponse>} Promise resolving to API response
   * @throws {Error} When the API call fails
   * @example
   * const response = await apiActiveRobotDetail.apiGetActiveRobotDetail({
   *   data: 'PRODUCT_ANALYSIS',
   * });
   */
  async apiGetActiveRobotDetail({ data }) {
    if (!data) {
      throw new Error('apiGetActiveRobotDetail requires `data` parameter');
    }

    const encodedValue = encodeURIComponent(data);
    const response = await axiosCustom('GET', `/api_web/Api_chatbot/active_robot_detail/${encodedValue}?csrf_protection=true`);
    return response.data;
  },
};

export default apiActiveRobotDetail;
