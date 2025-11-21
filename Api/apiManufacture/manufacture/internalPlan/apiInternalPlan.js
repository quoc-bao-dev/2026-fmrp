import { _ServerInstance as axiosCustom } from "@/services/axios";

const apiInternalPlan = {
    async apiListInternalPlan(param) {
        const response = await axiosCustom('GET', `/api_web/api_internal_plan/getInternalPlan?csrf_protection=true`, param);
        return response.data
    },
    async apiPostStatus(id, status) {
        const response = await axiosCustom('GET', `/api_web/api_internal_plan/agree?id=${id}&status=${status}&csrf_protection=true`,);
        return response.data
    },
    async apiDetailInternalPlan(id) {
        const response = await axiosCustom('GET', `/api_web/api_internal_plan/detailInternalPlan/${id}?csrf_protection=true`);
        return response.data
    },
    // api luu
    async apiHandlingInternalPlan(url, data) {
        const response = await axiosCustom('POST', `${url}`, data);
        return response.data
    },

    async apiPrintInternalPlan(id) {
        const response = await axiosCustom('GET', `/api_web/Api_print/Print_InternalPlan?id=${id}&csrf_protection=true`)
        return response.data
    },
}
export default apiInternalPlan