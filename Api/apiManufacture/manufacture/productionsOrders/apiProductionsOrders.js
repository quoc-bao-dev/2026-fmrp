import { _ServerInstance as axiosCustom } from "@/services/axios";
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
}
export default apiProductionsOrders