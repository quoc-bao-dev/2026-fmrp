/**
 * @fileoverview Định nghĩa các type và interface cho chatbot response API
 * @description Các type này được sử dụng để type-check và document các response từ chatbot API
 */

/**
 * Loại người gửi tin nhắn trong chatbot
 * @typedef {'0' | '1' | 0 | 1} ChatBotMessageSenderType
 * @description
 * - '0' hoặc 0: Tin nhắn được gửi bởi AI/Bot
 * - '1' hoặc 1: Tin nhắn được gửi bởi người dùng
 */

/**
 * Dữ liệu POST gửi kèm cho next_wait
 * @typedef {Object} ChatBotDataPost
 * @property {string} id_robot ID của robot
 * @property {string} id_robot_detail ID chi tiết của robot
 * @property {string} id_items ID của items
 * @property {*} [key] Các field khác có thể có tùy theo từng trường hợp
 */

/**
 * Dữ liệu tin nhắn từ chatbot API response
 * @typedef {Object} ChatBotMessageData
 * @property {string} id_robot_support ID của robot support
 * @property {string} id_robot_support_detail ID chi tiết của robot support
 * @property {number} id_client ID của client
 * @property {string|null} session Session ID (có thể null)
 * @property {string} session_chat Session chat ID
 * @property {number} is_read Trạng thái đã đọc (0 = chưa đọc, 1 = đã đọc)
 * @property {ChatBotMessageSenderType} type_send Loại người gửi: '0' hoặc 0 = AI gửi, '1' hoặc 1 = người dùng gửi
 * @property {string} message Nội dung tin nhắn
 * @property {string} event Loại event (vd: 'options', 'message', 'wait_reply', ...)
 * @property {string|null} file Đường dẫn file đính kèm (nếu có)
 * @property {string} suport_items Support items
 * @property {string|null} json_item JSON item (nếu có)
 * @property {string|null} show_move_event Show move event (nếu có)
 * @property {string} is_function Function được gọi (vd: 'active_robot_detail')
 * @property {number} id ID của message
 * @property {string|null} event_app Event app (nếu có)
 * @property {string} event_show Event show (vd: 'options', 'wait_reply', ...)
 * @property {string} session_robot Session robot ID
 * @property {ChatBotDataPost|null} [data_post] Dữ liệu gửi kèm cho next_wait (nếu có). Thường chứa id_robot, id_robot_detail, id_items, ...
 */

/**
 * Response từ chatbot API khi gọi next hoặc fetch message
 * @typedef {Object} ChatBotNextResponse
 * @property {boolean} result Kết quả thành công hay không
 * @property {ChatBotMessageData} data Dữ liệu tin nhắn từ API
 * @property {string|null} next URL để fetch message tiếp theo (nếu có). Nếu null thì không còn message nào.
 * @property {string|null} next_wait URL để fetch message tiếp theo sau khi chờ (nếu có). Được set vào Redux store để sử dụng sau.
 * @property {number} [send_chat] Trạng thái cho phép mở ô chat: 1 = cho phép mở ô chat, 0 = không cho mở ô chat.
 * @property {number} [is_chat] Trạng thái mở ô chat: 2 = mở ô chat 1 lần rồi đóng, 1 = mở luôn.
 */

/**
 * Helper function để xác định người gửi tin nhắn
 * @param {ChatBotMessageSenderType} type_send - Loại người gửi từ API
 * @returns {boolean} true nếu là AI gửi, false nếu là người dùng gửi
 * @example
 * // AI gửi
 * isAiSender('0') // true
 * isAiSender(0) // true
 *
 * // Người dùng gửi
 * isAiSender('1') // false
 * isAiSender(1) // false
 */
export const isAiSender = type_send => {
  return type_send === '0' || type_send === 0;
};

/**
 * Helper function để xác định người dùng gửi tin nhắn
 * @param {ChatBotMessageSenderType} type_send - Loại người gửi từ API
 * @returns {boolean} true nếu là người dùng gửi, false nếu là AI gửi
 * @example
 * // Người dùng gửi
 * isUserSender('1') // true
 * isUserSender(1) // true
 *
 * // AI gửi
 * isUserSender('0') // false
 * isUserSender(0) // false
 */
export const isUserSender = type_send => {
  return type_send === '1' || type_send === 1;
};

/**
 * Helper function để lấy sender type dạng string chuẩn
 * @param {ChatBotMessageSenderType} type_send - Loại người gửi từ API
 * @returns {'ai' | 'user'} 'ai' nếu là AI gửi, 'user' nếu là người dùng gửi
 * @example
 * getSenderType('0') // 'ai'
 * getSenderType('1') // 'user'
 * getSenderType(0) // 'ai'
 * getSenderType(1) // 'user'
 */
export const getSenderType = type_send => {
  return isAiSender(type_send) ? 'ai' : 'user';
};
