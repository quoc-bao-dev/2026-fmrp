import { _ServerInstance as axiosCustom } from "@/services/axios";

const apiServiceVoucher = {
    async apiListServiceVoucher(param) {
        const response = await axiosCustom('GET', `/api_web/Api_service/service/?csrf_protection=true`, param ? param : undefined);
        return response.data
    },
    async apiServiceCombobox(method, param) {
        const response = await axiosCustom(method, `/api_web/Api_service/serviceCombobox/?csrf_protection=true`, param ? param : undefined);
        return response.data
    },
    async apiFilterBar(param) {
        const response = await axiosCustom('GET', `/api_web/Api_service/filterBar/?csrf_protection=true`, param ? param : undefined);
        return response.data
    },
    async apiDetailService(id) {
        const response = await axiosCustom('GET', `/api_web/Api_service/service/${id}?csrf_protection=true`);
        return response.data
    },
    async apiHandingService(id, data) {
        const response = await axiosCustom('POST', id ? `/api_web/Api_service/service/${id}?csrf_protection=true` : "/api_web/Api_service/service/?csrf_protection=true", data);
        return response.data
    },
    async apiPrintServiceVoucher(data) {
        const response = await axiosCustom('POST', `/api_web/Api_print/Print_ServicesWeb`, data);
        return response.data
    },
}
export default apiServiceVoucher