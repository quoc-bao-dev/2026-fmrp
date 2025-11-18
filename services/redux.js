import { createStore } from 'redux';

/**
 * @typedef {'ai' | 'user'} ChatSender
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} text Nội dung tin nhắn hiển thị trong UI.
 * @property {ChatSender} sender Xác định tin nhắn thuộc về AI hay người dùng để render phong cách bong bóng.
 * @property {boolean} [hasResponse=false] Tin nhắn AI có đính kèm payload phản hồi (`response`) hay chưa, dùng để bật phần kết quả.
 * @property {Object} [response=null] Payload phản hồi từ API khi tin nhắn AI có response.
 */

/**
 * @typedef {Object} ChatScenarioOptionValue
 * @property {number|string} value Giá trị thực gửi lên API khi người dùng chọn.
 * @property {string} label Nội dung hiển thị của lựa chọn nhanh (quick reply).
 * @property {number|string} [step_next] Cho phép override bước tiếp theo nếu chọn option này.
 */

/**
 * @typedef {Object} ChatScenarioOptions
 * @property {boolean} required Bật khi bot bắt buộc người dùng phải chọn option thay vì gõ tay.
 * @property {'text'|'radio'|string} type Kiểu input mà UI sẽ hiển thị (textbox, radio list, ...).
 * @property {ChatScenarioOptionValue[]|string} value Danh sách option trả về từ API hoặc chuỗi mô tả tùy từng bước.
 * @property {boolean} valueProduct Lưu lại giá trị sản phẩm cuối cùng mà user cung cấp, dùng để gọi API phân tích.
 * @property {number|string} stepNext Bước kế tiếp mặc định nếu server không override.
 * @property {string} keyValue Khóa động để build payload (`params`) khi user chọn option (vd: idSemiProduct).
 * @property {string} messageOptions Nội dung giải thích thêm cho danh sách option.
 * @property {boolean} isFinished Cho biết bot đã thu đủ dữ liệu và sẽ gọi `completeStepChatBot`.
 * @property {string} api Endpoint server cần gọi khi `isFinished` bật.
 */

/**
 * @typedef {Object} ChatBotResponseData
 * @property {Array} materialsPrimary Nguyên liệu chính mà bot thu thập được.
 * @property {Object} product Thông tin sản phẩm được AI phân tích.
 * @property {Array} semiProducts Danh sách bán thành phẩm mà người dùng chọn.
 * @property {Array} stages Quy trình/công đoạn sản xuất trả ra từ AI.
 */

/**
 * @typedef {Object} ChatBotState
 * @property {boolean} open Drawer chat AI đang mở hay đóng.
 * @property {string|null} typeChat Loại kịch bản hiện hành (vd: PRODUCT_ANALYSIS).
 * @property {string} contentChat Nội dung đang nhập tại textarea chính.
 * @property {boolean} openViewModal Mở modal xem chi tiết kết quả chat.
 * @property {boolean} isShowAi Đánh dấu UI đang highlight AI assistant.
 * @property {*} dataReview Payload hiển thị ở modal review (nếu có).
 * @property {string} typeData Phân loại dữ liệu review để render phù hợp.
 * @property {ChatMessage[]} messenger Toàn bộ lịch sử hội thoại phục vụ render UI và backscroll.
 * @property {number} chatScenariosId ID kịch bản hiện tại trả về từ server.
 * @property {string} sessionId Chuỗi session để server giữ context hội thoại.
 * @property {number|string} step Bước hiện tại trong flow (string khi server trả '2','3',...).
 * @property {boolean} isPending Cho biết bot đang chờ API trả lời để disable input.
 * @property {boolean} isLoadingGeneraAnswer Trạng thái loading khi đang generate answer.
 * @property {string|null} nextWait URL để fetch message tiếp theo sau khi chờ (nếu có từ next_wait trong response).
 * @property {number|null} sendChat Trạng thái cho phép mở ô chat: 1 = cho phép mở ô chat, 0 = không cho mở ô chat.
 * @property {number|null} isChat Trạng thái mở ô chat: 2 = mở ô chat 1 lần rồi đóng, 1 = mở luôn.
 * @property {Object|null} dataPost Dữ liệu gửi kèm cho next_wait (nếu có từ data_post trong response.data). Thường chứa id_robot, id_robot_detail, id_items, ...
 * @property {string|null} sessionRobot Session robot ID dùng để gửi kèm tin nhắn (nếu có từ session_robot trong response.data).
 * @property {ChatScenarioOptions} options Metadata điều khiển input và chuyển bước tiếp theo.
 * @property {ChatBotResponseData} response Payload thô dùng để render kết quả cuối (materials/stages/...).
 */

/**
 * @typedef {Object} AdminStoreState
 * @property {*} auth Thông tin xác thực hiện tại.
 * @property {{label:string,code:string}[]} availableLang Danh sách ngôn ngữ cho toàn hệ thống.
 * @property {string} lang Mã ngôn ngữ đang chọn.
 * @property {*} information Thông tin doanh nghiệp/người dùng hiển thị dashboard.
 * @property {*} unit_NVL Bộ đơn vị của nguyên vật liệu.
 * @property {*} branch Danh sách chi nhánh.
 * @property {*} variant_NVL Phân loại nguyên vật liệu.
 * @property {*} department_staff Danh mục phòng ban nhân sự.
 * @property {*} position_staff Danh mục chức vụ nhân sự.
 * @property {*} categoty_finishedProduct Nhóm sản phẩm hoàn thiện.
 * @property {*} type_finishedProduct Loại sản phẩm hoàn thiện.
 * @property {*} unit_finishedProduct Đơn vị tính của sản phẩm hoàn thiện.
 * @property {*} stage_finishedProduct Danh sách công đoạn sản xuất.
 * @property {*} location_inventory Thông tin kho/vị trí lưu trữ.
 * @property {Object} setings Thiết lập server (mặc định rỗng, được action `setings/server` fill).
 * @property {*} feature Thông tin tính năng bật/tắt từ server.
 * @property {{open:boolean}} statePopupAccountInformation Trạng thái popup thông tin tài khoản.
 * @property {{open:boolean}} statePopupChangePassword Trạng thái popup đổi mật khẩu.
 * @property {{open:boolean}} statePopupUpgradeProfessional Popup nâng cấp gói dịch vụ.
 * @property {{open:boolean}} statePopupSuccessfulPayment Popup thanh toán thành công.
 * @property {{open:boolean}} statePopupRecommendation Popup gợi ý nâng cấp.
 * @property {{open:boolean}} statePopupUpdateVersion Popup cập nhật phiên bản.
 * @property {{open:boolean}} statePopupParent Popup dùng chung cho parent modal.
 * @property {{open:boolean,data:Object}} statePopupPreviewImage Popup xem ảnh lớn.
 * @property {{openDropdownId:null|number|string}} stateFilterDropdown ID dropdown đang mở toàn cục.
 * @property {{open:boolean,children:React.ReactNode|null}} statePopupGlobal Container popup global để nhúng bất kỳ nội dung nào.
 * @property {ChatBotState} stateBoxChatAi Toàn bộ trạng thái chat bot AI được BoxChatAI subscribe.
 */

const initialChatBotState = {
  open: true,
  typeChat: null,
  contentChat: '',
  openViewModal: false,
  isShowAi: false,
  dataReview: null,
  typeData: '',

  // new
  messenger: [],
  chatScenariosId: 0,
  sessionId: '',
  step: 0,
  isPending: false,
  isLoadingGeneraAnswer: false,
  nextWait: null,
  sendChat: null,
  isChat: null,
  dataPost: null,
  sessionRobot: null,
  isGreeting: false,
  options: {
    required: false,
    type: 'text',
    value: [],
    valueProduct: false,
    stepNext: 1,
    keyValue: '',
    messageOptions: '',
    isFinished: false,
    api: '',
  },
  response: {
    materialsPrimary: [],
    product: {},
    semiProducts: [],
    stages: [],
  },
};

const adminState = {
  auth: null,
  availableLang: [
    { label: 'English', code: 'en' },
    { label: 'Tiếng Việt', code: 'vi' },
  ],
  lang: 'vi',
  information: null,
  unit_NVL: null,
  branch: null,
  variant_NVL: null,
  department_staff: null,
  position_staff: null,
  categoty_finishedProduct: null,
  type_finishedProduct: null,
  unit_finishedProduct: null,
  stage_finishedProduct: null,
  location_inventory: null,
  setings: {},

  statePopupAccountInformation: {
    open: false,
  },
  statePopupChangePassword: {
    open: false,
  },
  statePopupUpgradeProfessional: {
    open: false,
  },
  statePopupSuccessfulPayment: {
    open: false,
  },
  statePopupRecommendation: {
    open: false,
  },
  statePopupUpdateVersion: {
    open: false,
  },
  statePopupParent: {
    open: false,
  },
  statePopupPreviewImage: {
    open: false,
    data: {},
  },
  stateFilterDropdown: {
    openDropdownId: null, // ← thêm vào đây thay vì open
  },
  statePopupGlobal: {
    open: false,
    children: null,
  },
  stateBoxChatAi: {
    open: false,
    typeChat: null,
    contentChat: '',
    openViewModal: false,
    isShowAi: false,
    dataReview: null,
    typeData: '',

    //new
    messenger: [],
    chatScenariosId: 0,
    sessionId: '',
    step: 0,
    isPending: false,
    isLoadingGeneraAnswer: false,
    nextWait: null,
    sendChat: null,
    isChat: null,
    dataPost: null,
    sessionRobot: null,
    options: {
      required: false,
      type: 'text',
      value: [],
      valueProduct: false,
      stepNext: 1,
      keyValue: '',
      messageOptions: '',
      isFinished: false,
      api: '',
    },
    response: {
      materialsPrimary: [],
      product: {},
      semiProducts: [],
      stages: [],
    },
  },
};

function adminReducer(state = adminState, action) {
  switch (action.type) {
    case 'auth/update':
      return { ...state, auth: action.payload };
    case 'lang/update':
      return { ...state, lang: action.payload };
    case 'unit_NVL/update':
      return { ...state, unit_NVL: action.payload };
    case 'branch/update':
      return { ...state, branch: action.payload };
    case 'variant_NVL/update':
      return { ...state, variant_NVL: action.payload };
    case 'department_staff/update':
      return { ...state, department_staff: action.payload };
    case 'position_staff/update':
      return { ...state, position_staff: action.payload };
    case 'categoty_finishedProduct/update':
      return { ...state, categoty_finishedProduct: action.payload };
    case 'type_finishedProduct/update':
      return { ...state, type_finishedProduct: action.payload };
    case 'unit_finishedProduct/update':
      return { ...state, unit_finishedProduct: action.payload };
    case 'stage_finishedProduct/update':
      return { ...state, stage_finishedProduct: action.payload };
    case 'location_inventory/update':
      return { ...state, location_inventory: action.payload };
    case 'status/user':
      return { ...state, statusUser: action.payload };
    case 'status/exprired':
      return { ...state, statusExprired: action.payload };
    case 'setings/server':
      return { ...state, setings: action.payload };
    case 'setings/feature':
      return { ...state, feature: action.payload };
    case 'stateBoxChatAi':
      return { ...state, stateBoxChatAi: action.payload };
    case 'statePopupAccountInformation':
      return { ...state, statePopupAccountInformation: action.payload };
    case 'statePopupChangePassword':
      return { ...state, statePopupChangePassword: action.payload };
    case 'statePopupUpgradeProfessional':
      return { ...state, statePopupUpgradeProfessional: action.payload };
    case 'statePopupSuccessfulPayment':
      return { ...state, statePopupSuccessfulPayment: action.payload };
    case 'statePopupRecommendation':
      return { ...state, statePopupRecommendation: action.payload };
    case 'statePopupUpdateVersion':
      return { ...state, statePopupUpdateVersion: action.payload };
    case 'statePopupParent':
      return { ...state, statePopupParent: action.payload };
    case 'statePopupGlobal':
      return { ...state, statePopupGlobal: action.payload };
    case 'statePopupPreviewImage':
      return { ...state, statePopupPreviewImage: action.payload };
    case 'stateFilterDropdown':
      return {
        ...state,
        stateFilterDropdown: {
          openDropdownId: action.payload.openDropdownId,
        },
      };
    //chat bot

    case 'chatbot/openBoxChatAi':
      return {
        ...state,
        stateBoxChatAi: {
          ...state.stateBoxChatAi,
          open: action.payload,
        },
      };

    case 'chatbot/addInitialBotMessage':
      return {
        ...state,
        stateBoxChatAi: {
          ...state.stateBoxChatAi,
          chatScenariosId: action.payload.chat_scenarios_id,
          sessionId: action.payload.session_id,
          step: action.payload.step,
          messenger: [...state.stateBoxChatAi.messenger, { text: action.payload.message, sender: 'ai', hasResponse: false, response: action.payload.response }],
          options: {
            required: action.payload.options?.required || false,
            value: action.payload.options?.value || '',
            valueProduct: action.payload.options?.value_product || false,
            type: action.payload.options?.type,
            stepNext: action.payload.options?.step_next,
          },
          isGreeting: true, // Đánh dấu đã load tin nhắn đầu tiên
        },
      };

    case 'chatbot/addUserMessage':
      return {
        ...state,
        stateBoxChatAi: {
          ...state.stateBoxChatAi,
          messenger: [...state.stateBoxChatAi.messenger, { text: action.payload, sender: 'user' }],
        },
      };

    case 'chatbot/addAiMessageOnly':
      return {
        ...state,
        stateBoxChatAi: {
          ...state.stateBoxChatAi,
          messenger: [
            ...state.stateBoxChatAi.messenger,
            {
              text: action.payload.text,
              sender: 'ai',
              hasResponse: action.payload.hasResponse,
              response: action.payload.response,
            },
          ],
        },
      };

    case 'chatbot/updateScenarioMeta':
      return {
        ...state,
        stateBoxChatAi: {
          ...state.stateBoxChatAi,
          chatScenariosId: action.payload.chat_scenarios_id,
          sessionId: action.payload.session_id,
          step: action.payload.step,
          options: {
            required: action.payload.options?.required || false,
            value: action.payload.options?.value || '',
            valueProduct: action.payload.options?.value_product || false,
            type: action.payload.options?.type,
            stepNext: action.payload.options?.step_next,
            keyValue: action.payload.options?.key_value,
            messageOptions: action.payload.options?.message_1 || '',
            isFinished: action.payload.options?.is_finished || false,
            api: action.payload.options?.api || '',
          },
          response: action.payload.response
            ? {
                materialsPrimary: action.payload.response?.materials_primary || [],
                product: action.payload.response?.product || {},
                semiProducts: action.payload.response?.semi_products || [],
                stages: action.payload.response?.stages || [],
              }
            : state.stateBoxChatAi.response,
          // response: {
          //     ...state.stateBoxChatAi.response,
          //     ...action.payload.response,
          // }
        },
      };

    case 'chatbot/updateOptions':
      return {
        ...state,
        options: action.payload,
      };

    case 'chatbot/setIsLoadingGeneraAnswer':
      return {
        ...state,
        stateBoxChatAi: {
          ...state.stateBoxChatAi,
          isLoadingGeneraAnswer: action.payload,
        },
      };

    case 'chatbot/setNextWait':
      return {
        ...state,
        stateBoxChatAi: {
          ...state.stateBoxChatAi,
          nextWait: action.payload,
        },
      };

    case 'chatbot/setSendChat':
      return {
        ...state,
        stateBoxChatAi: {
          ...state.stateBoxChatAi,
          sendChat: action.payload,
        },
      };

    case 'chatbot/setIsChat':
      return {
        ...state,
        stateBoxChatAi: {
          ...state.stateBoxChatAi,
          isChat: action.payload,
        },
      };

    case 'chatbot/setDataPost':
      return {
        ...state,
        stateBoxChatAi: {
          ...state.stateBoxChatAi,
          dataPost: action.payload,
        },
      };

    case 'chatbot/setSessionRobot':
      return {
        ...state,
        stateBoxChatAi: {
          ...state.stateBoxChatAi,
          sessionRobot: action.payload,
        },
      };

    case 'chatbot/setIsGreeting':
      return {
        ...state,
        stateBoxChatAi: {
          ...state.stateBoxChatAi,
          isGreeting: action.payload,
        },
      };

    case 'chatbot/reset':
      return {
        ...state,
        stateBoxChatAi: { ...initialChatBotState },
      };
    case 'chatbot/resetLogout':
      return {
        ...state,
        stateBoxChatAi: { ...initialChatBotState, open: false },
      };
    default:
      return state;
  }
}

/**
 * @typedef {ReturnType<typeof adminReducer>} AdminStoreState
 *
 * Cấu trúc state duy nhất của Redux store quản lý toàn bộ thông tin admin và box chat AI:
 * - Lưu trữ cấu hình tài khoản/admin, danh sách ngôn ngữ, metadata của popup toàn hệ thống.
 * - Đồng bộ trạng thái chatbot (`stateBoxChatAi`) bao gồm session, lịch sử tin nhắn, option điều hướng luồng
 *   và dữ liệu phản hồi (`response`) giúp UI render theo từng bước kịch bản.
 * - Cho phép các action `statePopup*`, `chatbot/*`, ... cập nhật nhất quán để UI có thể đọc từ một nguồn state duy nhất.
 */

/** @type {import("redux").Store<AdminStoreState>} */
const store = createStore(adminReducer);
export default store;
