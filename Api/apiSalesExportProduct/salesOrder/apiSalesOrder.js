import { _ServerInstance as axiosCustom } from "@/services/axios";
const apiSalesOrder = {
    async apiListSalesOrder(params) {
        const response = await axiosCustom('GET', `/api_web/Api_sale_order/saleOrder/?csrf_protection=true`, params);
        return response.data
    },
    async apiListFilterbar(params) {
        const response = await axiosCustom('GET', `/api_web/Api_sale_order/filterBar?csrf_protection=true`, params);
        return response.data
    },
    async apiSearchOrder(params) {
        const response = await axiosCustom('GET', `/api_web/api_sale_order/searchOrders?csrf_protection=true`, params);
        return response.data
    },
    async apiSearchOrderWithBranch(params) {
        const response = await axiosCustom('GET', `/api_web/api_sale_order/searchOrders?csrf_protection=true`, params);
        return response.data
    },
    async apiHandingStatus(id, stt, data) {
        const response = await axiosCustom('POST', `/api_web/Api_sale_order/confirm/${id}/${stt}?csrf_protection=true`, data);
        return response.data
    },

    async apiDetail(id) {
        const response = await axiosCustom('GET', `/api_web/Api_sale_order/saleOrder/${id}?csrf_protection=true`);
        return response.data
    },
    async apiListKeepOrder(id, params) {
        const response = await axiosCustom('GET', `/api_web/Api_sale_order/GetListKeepOrder/${id}/?csrf_protection=true`, params);
        return response.data
    },
    async apiListTransferCombobox() {
        const response = await axiosCustom('GET', `/api_web/Api_transfer/TransferCombobox/?csrf_protection=true`);
        return response.data
    },
    async apiWarehouseComboboxFindBranch() {
        const response = await axiosCustom('GET', `/api_web/Api_warehouse/warehouseComboboxFindBranch/?csrf_protection=true`);
        return response.data
    },
    async apiHandingTransferCombobox(data) {
        const response = await axiosCustom('POST', `/api_web/Api_sale_order/EditKeepStockOrder?csrf_protection=true`, data);
        return response.data
    },
    async apiDeleteTransferKeep(id) {
        const response = await axiosCustom('DELETE', `/api_web/Api_transfer/deletetransferKeep/${id}?csrf_protection=true`);
        return response.data
    },
    async apiDetailKeepStockOrder(id, params) {
        const response = await axiosCustom('GET', `/api_web/Api_sale_order/KeepStockOrder/${id}`, params);
        return response.data
    },
    async apiWarehouseComboboxNotSystem() {
        const response = await axiosCustom('GET', `/api_web/Api_warehouse/warehouseCombobox_not_system/?csrf_protection=true`);
        return response.data
    },
    async apiHanDingKeepStook(data) {
        const response = await axiosCustom('POST', `/api_web/Api_sale_order/AddKeepStockOrder?csrf_protection=true`, data);
        return response.data
    },

    async apiQuotationNotOrdered(params) {
        const response = await axiosCustom('GET', `/api_web/Api_quotation/quotationNotOrderedCombobox/?csrf_protection=true`, params);
        return response.data
    },
    async apiItems(data) {
        const response = await axiosCustom('POST', `/api_web/Api_product/searchItemsVariant/?csrf_protection=true`, data);
        return response.data
    },
    async apiQuotaItems(prams) {
        const response = await axiosCustom('POST', `/api_web/Api_quotation/searchItemsVariant/?csrf_protection=true`, prams);
        return response.data
    },
    async apiHandingSalesOrder(id, data) {
        const response = await axiosCustom('POST', id ? `/api_web/Api_sale_order/saleOrder/${id}?csrf_protection=true` : "/api_web/Api_sale_order/saleOrder/?csrf_protection=true", data);
        return response.data
    },
    async apiPrintSaleOrder(data) {
        const response = await axiosCustom('POST', `/api_web/Api_print/Print_SalesOrderWeb?csrf_protection=true`, data)
        return response.data
    },

    async apiPrintDelivery(data) {
        const response = await axiosCustom('POST', `/api_web/Api_print/Print_DeliverytWeb?csrf_protection=true`, data)
        return response.data
    },
}
export default apiSalesOrder