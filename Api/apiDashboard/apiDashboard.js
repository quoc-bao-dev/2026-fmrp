import { _ServerInstance as axiosCustom } from "@/services/axios";
const apiDashboard = {
    // lấy thông tin bước sử dụng
    async apiGetInfoStepUse() {
        const response = await axiosCustom('GET', `/api_web/api_setting/getInfoStepUse`);
        return response.data
    },
    // api 5 ô nhưng hiện tại chỉ có data 3 ô
    async apiGetDashboardStatusManufactures() {
        const response = await axiosCustom('GET', `/api_web/Api_Dashboard/dashboardStatusManufactures`);
        return response.data
    },
    // top sản phẩm sx nhiều nhất
    async apiGetDashboardTopProducedProducts(params) {
        const response = await axiosCustom('GET', `/api_web/Api_Dashboard/dashboardTopProducedProducts`, params);
        return response.data
    },
    // tiến độ sx theo nhóm
    async apiGetDashboardProductionProgressByGroup(params) {
        const response = await axiosCustom('GET', `/api_web/Api_Dashboard/dashboardProductionProgressByGroup`, params);
        return response.data
    },
    // nvl cần mua
    async apiGetDashboardMaterialsToPurchase(params) {
        const response = await axiosCustom('GET', `/api_web/Api_Dashboard/dashboardMaterialsToPurchase`, params);
        return response.data
    },

    // tỉ lệ sp lỗi hàng
    async apiGetDashboardDefectiveProductRate(params) {
        const response = await axiosCustom('GET', `/api_web/Api_Dashboard/dashboardDefectiveProductRate`, params);
        return response.data
    },
    // kế hoạch sản xuất
    async apiGetDashboardProductionPlan(params) {
        const response = await axiosCustom('GET', `/api_web/Api_Dashboard/dashboardProductionPlan`, params);
        return response.data
    },
    // top 5 khách hàng có sản lượng nhiều nhất
    async apiGetDashboardTop5Customers(params) {
        const response = await axiosCustom('GET', `/api_web/Api_Dashboard/dashboardTop5Customers`, params);
        return response.data
    },
    // Tình hình sản xuất
    async apiGetDashboardStatusProduct(params) {
        const response = await axiosCustom('GET', `/api_web/Api_Dashboard/dashboardProductionStatus`, params);
        return response.data
    },

    async apiLang(langDefault) {
        const response = await axiosCustom('GET', `/api_web/Api_Lang/language/${langDefault}`);
        return response.data
    },

    async apiSettings() {
        const response = await axiosCustom('GET', `/api_web/api_setting/getSettings?csrf_protection=true`);
        return response.data
    },
    async apiFeature() {
        const response = await axiosCustom('GET', `/api_web/api_setting/feature/?csrf_protection=true`);
        return response.data
    },
    async apiAuthentication() {
        const response = await axiosCustom('GET', `/api_web/Api_Authentication/authentication?csrf_protection=true`);
        return response.data
    },
    async apiLogOut() {
        const response = await axiosCustom('POST', `/api_web/Api_Login/logout?csrf_protection=true`);
        return response.data
    },
    // thông tin user
    async apiGetInfo() {
        const response = await axiosCustom('GET', `/api_web/api_staff/info`,);
        return response.data
    },
    // đổi avatar
    async apiUpdateAvatarInfo(data) {
        const response = await axiosCustom('POST', `/api_web/api_staff/uploadProfileImage`, data);
        return response.data
    },
    // đổi mật khẩu
    async apiChangePassword(data) {
        const response = await axiosCustom('POST', `/api_web/api_staff/changePassword`, data);
        return response.data
    }

}
export default apiDashboard