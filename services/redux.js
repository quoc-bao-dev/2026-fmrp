import { createStore } from "redux";

const initialChatBotState = {
    open: true,
    typeChat: null,
    contentChat: "",
    openViewModal: false,
    isShowAi: false,
    dataReview: null,
    typeData: "",

    // new
    messenger: [],
    chatScenariosId: 0,
    sessionId: "",
    step: 0,
    isPending: false,
    options: {
        required: false,
        type: "text",
        value: [],
        valueProduct: false,
        stepNext: 1,
        keyValue: "",
        messageOptions: "",
        isFinished: false,
        api: "",
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
        { label: "English", code: "en" },
        { label: "Tiếng Việt", code: "vi" },
    ],
    lang: "vi",
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
        contentChat: "",
        openViewModal: false,
        isShowAi: false,
        dataReview: null,
        typeData: "",

        //new
        messenger: [],
        chatScenariosId: 0,
        sessionId: "",
        step: 0,
        isPending: false,
        options: {
            required: false,
            type: "text",
            value: [],
            valueProduct: false,
            stepNext: 1,
            keyValue: "",
            messageOptions: "",
            isFinished: false,
            api: "",
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
        case "auth/update":
            return { ...state, auth: action.payload };
        case "lang/update":
            return { ...state, lang: action.payload };
        case "unit_NVL/update":
            return { ...state, unit_NVL: action.payload };
        case "branch/update":
            return { ...state, branch: action.payload };
        case "variant_NVL/update":
            return { ...state, variant_NVL: action.payload };
        case "department_staff/update":
            return { ...state, department_staff: action.payload };
        case "position_staff/update":
            return { ...state, position_staff: action.payload };
        case "categoty_finishedProduct/update":
            return { ...state, categoty_finishedProduct: action.payload };
        case "type_finishedProduct/update":
            return { ...state, type_finishedProduct: action.payload };
        case "unit_finishedProduct/update":
            return { ...state, unit_finishedProduct: action.payload };
        case "stage_finishedProduct/update":
            return { ...state, stage_finishedProduct: action.payload };
        case "location_inventory/update":
            return { ...state, location_inventory: action.payload };
        case "status/user":
            return { ...state, statusUser: action.payload };
        case "status/exprired":
            return { ...state, statusExprired: action.payload };
        case "setings/server":
            return { ...state, setings: action.payload };
        case "setings/feature":
            return { ...state, feature: action.payload };
        case "stateBoxChatAi":
            return { ...state, stateBoxChatAi: action.payload };
        case "statePopupAccountInformation":
            return { ...state, statePopupAccountInformation: action.payload };
        case "statePopupChangePassword":
            return { ...state, statePopupChangePassword: action.payload };
        case "statePopupUpgradeProfessional":
            return { ...state, statePopupUpgradeProfessional: action.payload };
        case "statePopupSuccessfulPayment":
            return { ...state, statePopupSuccessfulPayment: action.payload };
        case "statePopupRecommendation":
            return { ...state, statePopupRecommendation: action.payload };
        case "statePopupUpdateVersion":
            return { ...state, statePopupUpdateVersion: action.payload };
        case "statePopupParent":
            return { ...state, statePopupParent: action.payload };
        case "statePopupGlobal":
            return { ...state, statePopupGlobal: action.payload };
        case "statePopupPreviewImage":
            return { ...state, statePopupPreviewImage: action.payload };
        case "stateFilterDropdown":
            return {
                ...state,
                stateFilterDropdown: {
                    openDropdownId: action.payload.openDropdownId,
                },
            };
        //chat bot

        case "chatbot/openBoxChatAi":
            return {
                ...state,
                stateBoxChatAi: {
                    ...state.stateBoxChatAi,
                    open: action.payload,
                },
            };

        case "chatbot/addInitialBotMessage":
            return {
                ...state,
                stateBoxChatAi: {
                    ...state.stateBoxChatAi,
                    chatScenariosId: action.payload.chat_scenarios_id,
                    sessionId: action.payload.session_id,
                    step: action.payload.step,
                    messenger: [
                        ...state.stateBoxChatAi.messenger,
                        { text: action.payload.message, sender: "ai", hasResponse: false },
                    ],
                    options: {
                        required: action.payload.options?.required || false,
                        value: action.payload.options?.value || "",
                        valueProduct: action.payload.options?.value_product || false,
                        type: action.payload.options?.type,
                        stepNext: action.payload.options?.step_next,
                    },
                },
            };

        case "chatbot/addUserMessage":
            return {
                ...state,
                stateBoxChatAi: {
                    ...state.stateBoxChatAi,
                    messenger: [
                        ...state.stateBoxChatAi.messenger,
                        { text: action.payload, sender: "user" },
                    ],
                },
            };

        case "chatbot/addAiMessageOnly":
            return {
                ...state,
                stateBoxChatAi: {
                    ...state.stateBoxChatAi,
                    messenger: [
                        ...state.stateBoxChatAi.messenger,
                        {
                            text: action.payload.text,
                            sender: "ai",
                            hasResponse: action.payload.hasResponse,
                        },
                    ],
                },
            };

        case "chatbot/updateScenarioMeta":
            return {
                ...state,
                stateBoxChatAi: {
                    ...state.stateBoxChatAi,
                    chatScenariosId: action.payload.chat_scenarios_id,
                    sessionId: action.payload.session_id,
                    step: action.payload.step,
                    options: {
                        required: action.payload.options?.required || false,
                        value: action.payload.options?.value || "",
                        valueProduct: action.payload.options?.value_product || false,
                        type: action.payload.options?.type,
                        stepNext: action.payload.options?.step_next,
                        keyValue: action.payload.options?.key_value,
                        messageOptions: action.payload.options?.message_1 || "",
                        isFinished: action.payload.options?.is_finished || false,
                        api: action.payload.options?.api || "",
                    },
                    response: action.payload.response
                        ? {
                            materialsPrimary:
                                action.payload.response?.materials_primary || [],
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

        case "chatbot/updateOptions":
            return {
                ...state,
                options: action.payload,
            };


        case "chatbot/reset":
            return {
                ...state,
                stateBoxChatAi: { ...initialChatBotState },
            };
        case "chatbot/resetLogout":
            return {
                ...state,
                stateBoxChatAi: { ...initialChatBotState, open: false },
            };
        default:
            return state;
    }
}

const store = createStore(adminReducer);
export default store;
