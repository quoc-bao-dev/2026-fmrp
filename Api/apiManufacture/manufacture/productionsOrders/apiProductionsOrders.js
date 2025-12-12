import { _ServerInstance as axiosCustom } from "@/services/axios";

/**
 * @typedef {Object} ProductionOrderManagerItem
 * @property {number} id - Item ID (0 for new items)
 * @property {number} staff_id - Staff ID
 * @property {number} is_manager - Manager flag (1: quản lý, 0: không)
 * @property {number} is_btp_nvl - BTP & NVL responsible flag (1: Phụ trách BTP & NVL, 0: không)
 * @property {number} is_manufacture - Manufacture responsible flag (1: Phụ trách sản xuất, 0: không)
 */

/**
 * @typedef {Object} SaveProductionOrderManagersPayload
 * @property {number} po_id - Production order ID (id lệnh sản xuất tổng)
 * @property {ProductionOrderManagerItem[]} items - Array of manager items
 */

/**
 * @typedef {Object} SaveProductionOrderManagersResponse
 * @property {boolean|number} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {Object} [data] - Response data payload
 */

/**
 * @typedef {Object} ProductionOrderManagerStaff
 * @property {string|number} staffid - Staff ID
 * @property {string} full_name - Staff full name
 * @property {string} [profile_image] - URL to staff profile image
 */

/**
 * @typedef {Object} ProductionOrderManagerRecord
 * @property {string|number} id - Record ID
 * @property {string|number} po_id - Production order ID
 * @property {string|number} staff_id - Staff ID
 * @property {string|number} is_manager - Manager flag ("1" or "0")
 * @property {string|number} is_btp_nvl - BTP & NVL flag ("1" or "0")
 * @property {string|number} is_manufacture - Manufacture flag ("1" or "0")
 * @property {ProductionOrderManagerStaff} staff - Staff info
 */

/**
 * @typedef {Object} ProductionOrderManagersResponse
 * @property {boolean|number} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {string} [branch_name] - Branch name (can be empty string)
 * @property {Object} [data] - Response data payload
 * @property {ProductionOrderManagerRecord[]} [data.production_order_managers] - List of managers
 */

/**
 * @typedef {Object} ProductionOrderManagerDetailResponse
 * @property {boolean|number} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {Object} [data] - Response data payload
 */

/**
 * @typedef {Object} ProductionOrderManagerDetailItem
 * @property {number} staff_id - Staff ID
 * @property {number} is_manufacture - Manufacture responsible flag (1: Phụ trách sản xuất, 0: không)
 */

/**
 * @typedef {Object} SaveProductionOrderManagerDetailPayload
 * @property {number} po_id - Production order ID (id lệnh sản xuất tổng)
 * @property {number} poi_id - Production order item/detail ID (id dòng sản phẩm)
 * @property {ProductionOrderManagerDetailItem[]} items - Array of manager detail items
 */

/**
 * @typedef {Object} SaveProductionOrderManagerDetailResponse
 * @property {boolean|number} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {Object} [data] - Response data payload
 */

const apiProductionsOrders = {
    async apiProductionOrders(page, limit, param) {
        // Danh sách LSX tổng
        const response = await axiosCustom('GET', `/api_web/api_manufactures/getProductionOrders?page=${page}&limit=${limit}`, param);
        return response.data
    },
    async apiDetailProductionOrders(id) {
        // api chi tiết danh sách LSX tổng
        const response = await axiosCustom('GET', `/api_web/api_manufactures/getDetailProductionOrder/${id}`);
        return response.data
    },
    // bộ lọc lsx
    async apiComboboxProductionOrders(param) {
        const response = await axiosCustom('GET', `/api_web/api_manufactures/searchPO`, param);
        return response.data
    },
    // bộ lọc lsx chi tiết
    async apiComboboxProductionOrdersDetail(param) {
        const response = await axiosCustom('GET', `/api_web/api_manufactures/searchPODetail`, param);
        return response.data
    },
    // api chi tiết lsx
    async apiItemOrdersDetail(id) {
        const response = await axiosCustom('GET', `/api_web/api_manufactures/getPOD/${id}`);
        return response.data
    },
    // Tình hình xuất NVL danh sách giữ liệu
    async apiExportSituation(id) {
        const response = await axiosCustom('GET', `/api_web/api_manufactures/getListBomPOD/${id}`);
        return response.data
    },
    // lịch sử xuất NVL/BTP
    // async apiGetSuggestExporting(data) {
    //     const response = await axiosCustom('POST', `/api_web/Api_Suggest_Exporting/getSuggestExporting?page=${page}&limit=${limit}`, data);
    //     return response.data
    // },
    async apiGetSuggestExporting({ page = 1, limit = 3 }, data) {
        const response = await axiosCustom('POST', `/api_web/Api_Suggest_Exporting/getItems?page=${page}&limit=${limit}`, data);
        return response.data
    },

    //  lịch sử nhập kho tp
    // async apiGetPurchaseProducts(data) {
    //     const response = await axiosCustom('POST', `/api_web/Api_Purchase_Products/getPurchaseProducts`, data);
    //     return response.data
    // },
    async apiGetPurchaseProducts({ page = 1, limit = 3 }, data) {
        const response = await axiosCustom('POST', `/api_web/Api_Purchase_Products/getItems?page=${page}&limit=${limit}`, data);
        return response.data
    },
    // thu hồi nvl
    async apiGetRecallProduction({ page = 1, limit = 3 }, data) {
        const response = await axiosCustom('POST', `/api_web/Api_Purchase_Internal/getItems?page=${page}&limit=${limit}`, data);
        return response.data
    },
    // chi phí nvl
    async apiGetCostProduction({ page = 1, limit = 3 }, data) {
        const response = await axiosCustom('POST', `/api_web/Api_Suggest_Exporting/getFactoryProductionCost?page=${page}&limit=${limit}`, data);
        return response.data
    },

    // api đổi trạng thái sản xuất
    async apiAgreeProcess(data) {
        const response = await axiosCustom('POST', `/api_web/api_manufactures/agreeProcess`, data);
        return response.data
    },

    async apiHandingProducts(data) {
        const response = await axiosCustom('POST', `/api_web/api_manufactures/handlingProducts`, data);
        return response.data
    },

    // Lấy dữ liệu trước khi nhập sản xuất
    async apiDataProducts(data) {
        const response = await axiosCustom('POST', `/api_web/api_manufactures/getDataProducts`, data);
        return response.data
    },
    // lấy combobox kho của NVL/BTP xuất
    async apiDataWarehousePo(data) {
        const response = await axiosCustom('POST', `/api_web/api_manufactures/searchWarehousePOD`, data);
        return response.data
    },

    // xóa thành phẩm trong công đoạn
    async apiRemovePurchaseProduct(data) {
        const response = await axiosCustom('POST', `/api_web/api_manufactures/removePurchaseProduct`, data);
        return response.data
    },

    // ds công đoạn tp, công đoạn btp

    async apiFinishedStages(id) {
        const response = await axiosCustom('GET', `/api_web/api_manufactures/finished_stages?po_id=${id}`);
        return response.data
    },
    // lấy thông tin mặt hàng cần hoàn thành
    async apiActiveStages(data) {
        const response = await axiosCustom('POST', `/api_web/api_manufactures/activeStages`, data);
        return response.data
    },
    // API lấy thông tin BOM cần xuất
    async apiLoadOutOfStock(data) {
        const response = await axiosCustom('POST', `/api_web/api_manufactures/loadOutOfStock`, data);
        return response.data
    },
    // api lưu hoàn thành
    async apiHandlingFinishedStages(data) {
        const response = await axiosCustom('POST', `/api_web/api_manufactures/handlingFinishedStages`, data);
        return response.data
    },
    // xóa lsx
    async apiDeleteProductionOrders(id) {
        const response = await axiosCustom('DELETE', `/api_web/api_manufactures/deleteProductionOrders/${id}`);
        return response.data
    },

    // GET list comment
    async apiGetListComment({ page = 1, limit = 3, type = "", post_id = "" }, data) {
        const response = await axiosCustom('POST', `/api_web/Api_Comments_Chat/getComments?page=${page}&limit=${limit}&type=${type}&post_id=${post_id}`, data);
        return response.data
    },

    // POST like comment
    async apiPostAddComment(data) {
        const response = await axiosCustom('POST', `/api_web/Api_Comments_Chat/add_comment`, data);
        return response.data
    },

    // POST like comment
    async apiPostLikeComment({ idComment }) {
        const response = await axiosCustom('GET', `/api_web/Api_Comments_Chat/like_comment/${idComment}`);
        return response.data
    },

    //DETETE comment
    async apiDeleteComment(idComment) {
        const response = await axiosCustom('DELETE', `/api_web/Api_Comments_Chat/delete_comment/${idComment}`);
        return response.data
    },

    // POST unlike comment
    async apiPostUnlikeComment({ idComment }) {
        const response = await axiosCustom('GET', `/api_web/Api_Comments_Chat/unlike_comment/${idComment}`);
        return response.data
    },

    // GET danh sách khách hàng or nhân viên
    async apiGetListStaffs({ limit = 500 }, data) {
        const response = await axiosCustom('GET', `/api_web/Api_staff/searchStaffs?limit=${limit}`, data);
        return response.data
    },

    // GET danh sách Emoji
    async apiGetListEmoji() {
        const response = await axiosCustom('GET', `/api_web/Api_Emoji/getEmoji`);
        return response.data
    },

    // lấy danh sách mặt hàng hoàn thành
    async apiGetListProductCompleted(id) {
        const response = await axiosCustom('GET', `/api_web/Api_Production_orders/getProductCompleted?po_id=${id}`);
        return response.data
    },

    // xử lý sản phẩm hoàn thành
    async apiHandlingProductCompleted(data) {
        const response = await axiosCustom('POST', `/api_web/Api_Production_orders/handlingProductCompleted`, data);
        return response.data
    },

    // Danh sách xuất kho LSX
    async apiGetListExportProductionOrder(id) {
        const response = await axiosCustom('GET', `/api_web/Api_Production_order_bom/show/${id}?is_web=1`);
        return response.data
    },

    // Lấy danh sách kho của BOM
    async apiGetWarehousesBOM(data) {
        const response = await axiosCustom('POST', `/api_web/Api_Production_order_bom/getWarehousesBOM`, data);
        return response.data;
    },

    // Xác nhận xuất kho BOM
    async apiHandlingExportTotalPO(data) {
        const response = await axiosCustom('POST', `/api_web/Api_Suggest_Exporting/handlingExportTotalPO`, data);
        return response.data;
    },

    // Nguyên vật liệu xuất thêm
    async apiListSuggestPo(data) {
        const response = await axiosCustom('POST', `/api_web/suggest-exporting/list-sug-po`, data);
        return response.data;
    },
    
    // Lưu nguyên vật liệu xuất thêm
    async apiSaveSuggestExporting(data) {
        const response = await axiosCustom('POST', `/api_web/suggest-exporting/save`, data);
        return response.data;
    },

    // Lấy danh sách nguyên liệu bổ sung
     async apiLookupMaterialsVariant(data) {
        const response = await axiosCustom('GET', `/api_web/product-materials/lookup-variant`, data);
        return response.data;
    },

    // Lấy danh sách nguyên liệu bổ sung
    async apiLookupWarehouses(data) {
        const response = await axiosCustom('POST', `/api_web/warehouses/lookup`, data);
        return response.data;
    },

    // Lấy danh sách nguyên liệu thu hồi
    async apiMaterialsRecall(data) {
        const response = await axiosCustom('POST', `/api_web/purchase-internal/list-sug-pi`, data);
        return response.data;
    },

    // Lưu thu hồi nguyên liệu
    async apiSaveRecallMaterials(data) {
        const response = await axiosCustom('POST', `/api_web/purchase-internal/save`, data);
        return response.data;
    },
    
    /**
     * Save Production Order Managers API
     * @description Save list of responsible persons (managers) for a production order
     * @param {SaveProductionOrderManagersPayload} payload - Request payload
     * @returns {Promise<SaveProductionOrderManagersResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Save production order managers
     * const result = await apiProductionsOrders.apiSaveProductionOrderManagers({
     *   po_id: 50,
     *   items: [
     *     {
     *       id: 0,
     *       staff_id: 1,
     *       is_manager: 0,
     *       is_btp_nvl: 0,
     *       is_manufacture: 1
     *     }
     *   ]
     * });
     *
     * // Handle response
     * if (result.isSuccess) {
     *   console.log("Managers saved successfully:", result.message);
     * } else {
     *   console.error("Failed to save managers:", result.message);
     * }
     */
    async apiSaveProductionOrderManagers(payload) {
        const response = await axiosCustom('POST', `/api_web/production-order-managers/save?csrf_protection=true`, { data: payload });
        return response.data;
    },

    /**
     * Get Production Order Managers API
     * @description Get list of responsible persons (managers) for a production order
     * @param {number|string} po_id - Production order ID
     * @returns {Promise<ProductionOrderManagersResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * const result = await apiProductionsOrders.apiGetProductionOrderManagers(50);
     * if (result?.isSuccess) {
     *   console.log('Managers list:', result.data);
     * }
     */
    async apiGetProductionOrderManagers(po_id) {
        const response = await axiosCustom('GET', `/api_web/production-order-managers/index/${po_id}/0?csrf_protection=true`);
        return response.data;
    },

    /**
     * Get Production Order Manager Detail API
     * @description Get manager detail for a specific production order line
     * @param {number|string} po_id - Production order ID
     * @param {number|string} poi_id - Production order item/detail ID
     * @returns {Promise<ProductionOrderManagerDetailResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * const result = await apiProductionsOrders.apiGetProductionOrderManagerDetail(62, 89);
     * if (result?.isSuccess) {
     *   console.log('Managers detail:', result.data);
     * }
     */
    async apiGetProductionOrderManagerDetail(po_id, poi_id) {
        const response = await axiosCustom('GET', `/api_web/production-order-managers/get-detail/${po_id}/${poi_id}?csrf_protection=true`);
        return response.data;
    },

    /**
     * Save Production Order Manager Detail API
     * @description Save manager detail for a specific production order line (dòng sản phẩm)
     * @param {SaveProductionOrderManagerDetailPayload} payload - Request payload
     * @returns {Promise<SaveProductionOrderManagerDetailResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Save production order manager detail
     * const result = await apiProductionsOrders.apiSaveProductionOrderManagerDetail({
     *   po_id: 62,
     *   poi_id: 89,
     *   items: [
     *     {
     *       staff_id: 3,
     *       is_manufacture: 1 // 1: Phụ trách sản xuất
     *     }
     *   ]
     * });
     *
     * // Handle response
     * if (result.isSuccess || result.isSuccess === 1) {
     *   console.log("Manager detail saved successfully:", result.message);
     * } else {
     *   console.error("Failed to save manager detail:", result.message);
     * }
     */
    async apiSaveProductionOrderManagerDetail(payload) {
        const response = await axiosCustom('POST', `/api_web/production-order-managers/save-detail?csrf_protection=true`, { data: payload });
        return response.data;
    },
}
export default apiProductionsOrders