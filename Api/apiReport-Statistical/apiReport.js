import { _ServerInstance as axiosCustom } from '@/services/axios'
const apiReport = {
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
}

export default apiReport
