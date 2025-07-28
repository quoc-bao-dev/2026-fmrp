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
}

export default apiReport
