import { _ServerInstance as axiosCustom } from "@/services/axios";

const apiOrder = {
    async apiListOrder(param) {
        const response = await axiosCustom('GET', `/api_web/Api_purchase_order/purchase_order/?csrf_protection=true`, param ? param : undefined);
        return response.data
    },
    async apiListFilterBar(param) {
        const response = await axiosCustom('GET', `/api_web/Api_purchase_order/filterBar/?csrf_protection=true`, param);
        return response.data
    },
    async apiListOrderType(param) {
        const response = await axiosCustom('GET', `/api_web/Api_purchase_order/order_type_option/?csrf_protection=true`, param);
        return response.data
    },
    async apiDetailOrder(id) {
        const response = await axiosCustom('GET', `/api_web/Api_purchase_order/purchase_order/${id}?csrf_protection=true`);
        return response.data
    },
    async apiDeleteOrder(id) {
        const response = await axiosCustom('DELETE', `/api_web/Api_purchase_order/purchase_order/${id}?csrf_protection=true`);
        return response.data
    },
    async apiOptionNotComplete(param) {
        const response = await axiosCustom('GET', `/api_web/Api_purchases/purchasesOptionNotComplete?csrf_protection=true`, param);
        return response.data
    },
    async apiSearchItems(param) {
        const response = await axiosCustom('GET', `/api_web/Api_purchases/searchItemsVariant?csrf_protection=true`, param);
        return response.data
    },
    async apiSearchProductItems(data) {
        const response = await axiosCustom('POST', `/api_web/api_inventory/searchItemsVariant/?csrf_protection=true`, data);
        return response.data
    },
    async apiHandingOrder(id, data) {
        const response = await axiosCustom('POST', id ? `/api_web/Api_purchase_order/purchase_order/${id}?csrf_protection=true` : "/api_web/Api_purchase_order/purchase_order/?csrf_protection=true", data);
        return response.data
    },

    async apiPrintPurchaseOrder(data) {
        const response = await axiosCustom('POST', `/api_web/Api_print/Print_PurchaseOrderWeb?csrf_protection=true`, data)
        return response.data
    },

    async apiPrintPurchaseImport(data) {
        const response = await axiosCustom('POST', `/api_web/Api_print/Print_ImportWeb?csrf_protection=true`, data)
        return response.data
    },

    async apiPurchaseConfirm(id, data) {
        const response = await axiosCustom('POST', `/api_web/Api_purchase_order/confirm/${id}?csrf_protection=true`, { data: data })
        return response.data
    },
    
}
export default apiOrder