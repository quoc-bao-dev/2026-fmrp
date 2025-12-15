import { _ServerInstance as axiosCustom } from "@/services/axios";
const apiProducts = {
    async apiProductsCounts(params) {
        const response = await axiosCustom('GET', `/api_web/products/counts`, params);
        return response.data
    },
    async apiListProducts(params) {
        const response = await axiosCustom('GET', `/api_web/api_product/product/?csrf_protection=true`, params);
        return response.data
    },
    async apiProductTypeProducts() {
        const response = await axiosCustom('GET', `/api_web/api_product/productType/?csrf_protection=true`);
        return response.data
    },

    async apiStageProducts() {
        const response = await axiosCustom('GET', `/api_web/api_product/stage/?csrf_protection=true`);
        return response.data
    },
    async apiDetailProducts(id) {
        const response = await axiosCustom('GET', `/api_web/api_product/product/${id}?csrf_protection=true`);
        return response.data
    },
    async apiDetailStageProducts(id) {
        const response = await axiosCustom('GET', `/api_web/api_product/getDesignStages/${id}?csrf_protection=true`);
        return response.data
    },
    async apiDetailBomProducts(params) {
        const response = await axiosCustom('GET', `/api_web/Api_product/getDesignBOM?csrf_protection=true`, params);
        return response.data
    },
    async apiHandingProducts(id, data) {
        const response = await axiosCustom('POST', id ? `/api_web/api_product/product/${id}?csrf_protection=true` : "/api_web/api_product/product/?csrf_protection=true", data);
        return response.data
    },
    async apiDataDesignBomProducts(params) {
        const response = await axiosCustom('GET', `/api_web/api_product/getDataDesignBom?csrf_protection=true`, params);
        return response.data
    },
    async apiProductVariationOption(id) {
        const response = await axiosCustom('GET', `/api_web/api_product/productVariationOption/${id}?csrf_protection=true`);
        return response.data
    },
    async apiSearchItemsVariants(data) {
        const response = await axiosCustom('POST', `/api_web/api_product/searchItemsVariants?csrf_protection=true`, data);
        return response.data
    },
    async apiRowItem(data) {
        const response = await axiosCustom('POST', `/api_web/api_product/rowItem?csrf_protection=true`, data);
        return response.data
    },
    async apiHandingBom(data) {
        const response = await axiosCustom('POST', `/api_web/api_product/designBOM?csrf_protection=true`, data);
        return response.data
    },
    async apiDataDesignStage(id) {
        const response = await axiosCustom('GET', `/api_web/api_product/getDesignStages/${id}?csrf_protection=true`);
        return response.data
    },
    async apiHandingStage(data) {
        const response = await axiosCustom('POST', `/api_web/api_product/designStages?csrf_protection=true`, data);
        return response.data
    },

    async apiGetQRProductCompleted(id) {
        const response = await axiosCustom('GET', `/api_web/Api_Production_orders/printQRProductCompleted/${id}`);
        return response.data
    },

    async apiPostLinkPDFManufactures(data) {
        const response = await axiosCustom('POST', `/api_web/api_print/Print_manufacturesWeb?csrf_protection=true`, data)
        return response.data
    },


    async apiPostLinkPDFPlanManufactures(data) {
        const response = await axiosCustom('POST', `/api_web/api_print/Print_plan_manufactures_web?csrf_protection=true`, data)
        return response.data
    },

    async apiGetItemsManufactures(data) {
        const response = await axiosCustom('POST', `/api_web/api_print/GetItemsManufactures?csrf_protection=true`, data)
        return response.data
    },

    async apiPrintItemsManufactures(data) {
        const response = await axiosCustom('POST', `/api_web/api_print/Print_tem_manufacturesWeb?csrf_protection=true`, data)
        return response.data
    },

    async apiPrintItemsImport(data) {
        const response = await axiosCustom('POST', `/api_web/api_print/Print_tem_nvlWeb?csrf_protection=true`, data)
        return response.data
    }
}

export default apiProducts