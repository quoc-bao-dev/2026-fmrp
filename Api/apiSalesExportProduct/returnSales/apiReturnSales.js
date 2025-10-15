import { _ServerInstance as axiosCustom } from "@/services/axios";
const apiReturnSales = {
    async apiListReturnSales(params) {
        const response = await axiosCustom('GET', `/api_web/Api_return_order/return_order/?csrf_protection=true`, params);
        return response.data
    },
    async apiListFilterBar(params) {
        const response = await axiosCustom('GET', `/api_web/Api_return_order/filterBar/?csrf_protection=true`, params);
        return response.data
    },
    async apiHandingStatus(data) {
        const response = await axiosCustom('POST', `/api_web/Api_return_order/ConfirmWarehous?csrf_protection=true`, data);
        return response.data
    },
    async apiSearchReturnOrder(params) {
        const response = await axiosCustom('GET', `/api_web/api_return_order/searchReturnOrder?csrf_protection=true`, params);
        return response.data
    },
    async apiDetailReturnOrder(id) {
        const response = await axiosCustom('GET', `/api_web/Api_return_order/return_order/${id}?csrf_protection=true`);
        return response.data
    },

    async apiPageDetail(id) {
        const response = await axiosCustom('GET', `/api_web/Api_return_order/getDetail/${id}?csrf_protection=true`);
        return response.data
    },
    async apiDeliveriItems(data) {
        const response = await axiosCustom('POST', `/api_web/Api_return_order/getDeliveriItems?csrf_protection=true`, data);
        return response.data
    },
    async apiComboboxLocation(params) {
        const response = await axiosCustom('GET', `/api_web/api_warehouse/GetcomboboxlocationReturn/?csrf_protection=true`, params);
        return response.data
    },
    async apiHandingReturnSales(id, data) {
        const response = await axiosCustom('POST', id ? `/api_web/Api_return_order/return_order/${id}?csrf_protection=true` : "/api_web/Api_return_order/return_order/?csrf_protection=true", data);
        return response.data
    },

}
export default apiReturnSales