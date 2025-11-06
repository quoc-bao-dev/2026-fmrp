import { _ServerInstance as axiosCustom } from '@/services/axios';
const apiReport = {
  //Báo cáo tồn kho
  async apiGetWarehouse(data) {
    const response = await axiosCustom('GET', `/api_web/api_warehouse/warehouse?csrf_protection=true`, data);
    return response.data;
  },
  async apiGetListReportImport(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getListReportImport`, data);
    return response.data;
  },

  async apiGetListReportImportFinishedGoods(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getListReportImportProducts`, data);
    return response.data;
  },

  async apiGetListReportExportManufacture(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getListReportExportManufacture`, data);
    return response.data;
  },

  async apiGetListReportExportDelivery(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getListReportExportDelivery`, data);
    return response.data;
  },

  async apiGetListReportStock(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getListReportStock`, data);
    return response.data;
  },
  async apiGetDetailInItems(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getDetailInItems`, data);
    return response.data;
  },
  async apiGetDetailOutItems(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getDetailOutItems`, data);
    return response.data;
  },

  async apiGetCardStock(data) {
    const response = await axiosCustom('GET', `/api_web/Api_reports/getCardStock`, data);
    return response.data;
  },

  //Quản lý sản xuất
  async apiGetBOMs(data) {
    const response = await axiosCustom('GET', `/api_web/reports/boms`, data);
    return response.data;
  },

  async apiGetOrderProgress(data) {
    const response = await axiosCustom('GET', `/api_web/reports/order-progress`, data);
    return response.data;
  },

  async apiGetRawMaterialsUsed(data) {
    const response = await axiosCustom('GET', `/api_web/reports/material-usage`, data);
    return response.data;
  },

  async apiGetMaterialsLookup(param) {
    const response = await axiosCustom('GET', `/api_web/materials/lookup`, param);
    return response.data;
  },

  async apiItemsWithBranch(param) {
    const response = await axiosCustom('POST', `/api_web/api_product/searchItemsNoneVariant?csrf_protection=true`, param);
    return response.data;
  },

  //Dashboard sản xuất
  async apiGetManufacturingPlanCompletion(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/manufacturing-plan-completion`, data);
    return response.data;
  },

  async apiGetLateManufacturingOrders(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/late-manufacturing-orders`, data);
    return response.data;
  },

  async apiGetQcErrorRate(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/qc-error-rate`, data);
    return response.data;
  },

  async apiGetOee(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/oee`, data);
    return response.data;
  },

  async apiGetManufacturingOrderStatus(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/manufacturing-order-status`, data);
    return response.data;
  },

  async apiGetTrackProduction(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/track-production`, data);
    return response.data;
  },

  async apiGetManufacturingOrderCompletionClassification(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/manufacturing-order-completion-classification`, data);
    return response.data;
  },

  async apiGetMainMaterialStock(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/main-material-stock`, data);
    return response.data;
  },

  //Báo cáo bán hàng
  async apiGetSalesRevenue(data) {
    const response = await axiosCustom('GET', `/api_web/reports/sales-revenue`, data);
    return response.data;
  },

  async apiGetDeliveries(data) {
    const response = await axiosCustom('GET', `/api_web/reports/deliveries`, data);
    return response.data;
  },

  async apiGetReturns(data) {
    const response = await axiosCustom('GET', `/api_web/reports/returns`, data);
    return response.data;
  },

  async apiGetCustomerDebt(data) {
    const response = await axiosCustom('GET', `/api_web/reports/customer-debt`, data);
    return response.data;
  },

  //dashboard bán hàng
  async apiGetSalesSummary(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/summary`, data);
    return response.data;
  },

  async apiGetDebtTrend(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/debt-trend`, data);
    return response.data;
  },

  async apiGetProductGroupRevenue(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/product-group-revenue`, data);
    return response.data;
  },

  async apiGetOrderCompletionRate(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/order-completion-rate`, data);
    return response.data;
  },

  async apiGetCustomerTypeSales(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/customer-type-sales`, data);
    return response.data;
  },

  async apiGetMonthlyReorderRate(data) {
    const response = await axiosCustom('GET', `/api_web/dashboard/reports/monthly-reorder-rate`, data);
    return response.data;
  },
};

export default apiReport;
