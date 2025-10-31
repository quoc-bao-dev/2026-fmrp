import { _ServerInstance as axiosCustom } from '@/services/axios'
const apiReport = {
  //Báo cáo tồn kho
  async apiGetWarehouse() {
    const response = await axiosCustom('GET', `/api_web/api_warehouse/warehouse?csrf_protection=true`)
    return response.data
  },
  async apiGetListReportImport(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getListReportImport`, data)
    return response.data
  },

  async apiGetListReportImportFinishedGoods(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getListReportImportProducts`, data)
    return response.data
  },

  async apiGetListReportExportManufacture(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getListReportExportManufacture`, data)
    return response.data
  },

  async apiGetListReportExportDelivery(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getListReportExportDelivery`, data)
    return response.data
  },

  async apiGetListReportStock(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getListReportStock`, data)
    return response.data
  },
  async apiGetDetailInItems(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getDetailInItems`, data)
    return response.data
  },
  async apiGetDetailOutItems(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getDetailOutItems`, data)
    return response.data
  },

  async apiGetCardStock(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getCardStock`, data)
    return response.data
  },

  //Quản lý sản xuất
  async apiGetBOMs(data) {
    const response = await axiosCustom('GET', `/api_web/reports/boms`, data)
    return response.data
  },

  async apiGetOrderProgress(data) {
    const response = await axiosCustom('GET', `/api_web/reports/order-progress`, data)
    return response.data
  },

  async apiGetRawMaterialsUsed(data) {
    const response = await axiosCustom('GET', `/api_web/reports/material-usage`, data)
    return response.data
  },

  async apiGetMaterialsLookup(param) {
    const response = await axiosCustom('GET', `/api_web/materials/lookup`, param)
    return response.data
  },

  async apiItemsWithBranch(param) {
    const response = await axiosCustom('POST', `/api_web/api_product/searchItemsNoneVariant?csrf_protection=true`, param);
    return response.data
},
  
  //Báo cáo bán hàng
  async apiGetSalesRevenue(data) {
    const response = await axiosCustom('GET', `/api_web/reports/sales-revenue`, data)
    return response.data
  },

  async apiGetDeliveries(data) {
    const response = await axiosCustom('GET', `/api_web/reports/deliveries`, data)
    return response.data
  },

  async apiGetReturns(data) {
    const response = await axiosCustom('GET', `/api_web/reports/returns`, data)
    return response.data
  },

  async apiGetCustomerDebt(data) {
    const response = await axiosCustom('GET', `/api_web/reports/customer-debt`, data)
    return response.data
  },
  async apiGetSalesSummary(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/summary`, data)
    return response.data
  },
  
}

export default apiReport
