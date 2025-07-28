import { _ServerInstance as axiosCustom } from '@/services/axios'

const apiComons = {
  async apiBranchCombobox(param) {
    const response = await axiosCustom('GET', `/api_web/Api_Branch/branchCombobox/?csrf_protection=true`, param)
    return response.data
  },
  async apiSearchProductsVariant(params) {
    const response = await axiosCustom(
      'POST',
      `/api_web/api_internal_plan/searchProductsVariant?csrf_protection=true`,
      params
    )
    return response.data
  },
  // dnah sách mặt hàng
  async apiListItemsVariant(params) {
    const response = await axiosCustom('POST', `/api_web/api_product/searchProductsVariant`, params)
    return response.data
  },
  // thành phố
  async apiListProvince() {
    const response = await axiosCustom('GET', `/api_web/Api_address/province?limit=0`)
    return response.data
  },
  // quận huyện
  async apiDistric(param) {
    const response = await axiosCustom('GET', `/api_web/Api_address/district?limit=0`, param)
    return response.data
  },
  // tinh thanh
  async apiWWard(prams) {
    const response = await axiosCustom('GET', `/api_web/Api_address/ward?limit=0`, prams)
    return response.data
  },
  // đơn vị tính
  async apiUnit(params) {
    const response = await axiosCustom('GET', `/api_web/Api_unit/unit/?csrf_protection=true`, params)
    return response.data
  },

  // khách hàng
  async apiSearchClient(params) {
    const response = await axiosCustom('GET', `/api_web/api_client/searchClients?csrf_protection=true`, params)
    return response.data
  },
  async apiSearcClientFilterByBranch(params) {
    const response = await axiosCustom('GET', `/api_web/api_client/client_option/?csrf_protection=true`, params)
    return response.data
  },

  async apiClientContact(params) {
    const response = await axiosCustom('GET', `/api_web/api_client/client_option/?csrf_protection=true`, params)
    return response.data
  },

  async apiListTax(params) {
    const response = await axiosCustom('GET', `/api_web/Api_tax/tax?csrf_protection=true`, params)
    return response.data
  },
  // phương thức xử lý
  async apiListTreatment(params) {
    const response = await axiosCustom(
      'GET',
      `/api_web/Api_return_supplier/treatment_methods/?csrf_protection=true`,
      params
    )
    return response.data
  },
  async apiSearchContact(params) {
    const response = await axiosCustom('GET', `/api_web/api_client/searchContact?csrf_protection=true`, params)
    return response.data
  },
  async apiStaffBranch(params) {
    const response = await axiosCustom('GET', `/api_web/api_client/getStaffBranch?csrf_protection=true`, params)
    return response.data
  },
  // phuong thuc xu ly
  async apiSolution() {
    const response = await axiosCustom(
      'GET',
      `/api_web/Api_return_order/comboboxHandlingSolution/?csrf_protection=true`
    )
    return response.data
  },
  /// ng đề nghị
  async apiStaffOption(params) {
    const response = await axiosCustom('GET', `/api_web/Api_staff/staffOption?csrf_protection=true`, params)
    return response.data
  },
  // vị trí nhạn kho,
  async apiLocationWarehouseTo(params) {
    const response = await axiosCustom(
      'GET',
      `/api_web/Api_warehouse/warehouseLocationCombobox/?csrf_protection=true`,
      params
    )
    return response.data
  },

  // kho nhập
  async apiComboboxWarehouseManufacture(params) {
    const response = await axiosCustom('GET', `/api_web/Api_warehouse/warehouseCombobox/?csrf_protection=true`, params)
    return response.data
  },
  // đối tượng
  async apiListObject() {
    const response = await axiosCustom('GET', `/api_web/Api_export_other/object/?csrf_protection=true`)
    return response.data
  },
  //ds đối tượng
  async apiObjectList(param) {
    const response = await axiosCustom('GET', `/api_web/Api_export_other/objectList/?csrf_protection=true`, param)
    return response.data
  },
  // kho kiểm kê
  async apiWarehouseInventory(id) {
    const response = await axiosCustom(
      'GET',
      `api_web/api_warehouse/warehouse?csrf_protection=true&filter[is_system]=2&filter[branch_id]=${id}`
    )
    return response.data
  },
  /// vị tri kho kiểm kê
  async apiLocationInWarehouseInventory(id) {
    const response = await axiosCustom('GET', `/api_web/api_warehouse/LocationInWarehouse/${id}?csrf_protection=true`)
    return response.data
  },
  // phương thức tt
  async apiPaymentList() {
    const response = await axiosCustom('GET', `/api_web/Api_payment_method/payment_method/?csrf_protection=true`)
    return response.data
  },
  // danh sách đối tượng combobox
  async apiObjectCombobox() {
    const response = await axiosCustom('GET', `/api_web/Api_expense_voucher/object/?csrf_protection=true`)
    return response.data
  },
  //  đối tượng combobox trong phiếu thu
  async apiObjectPaySlipCombobox() {
    const response = await axiosCustom('GET', `/api_web/Api_expense_payslips/object?csrf_protection=true`)
    return response.data
  },
  // ds đối tượng
  async apiObjectListPaySlipCombobox(params) {
    const response = await axiosCustom('GET', `/api_web/Api_expense_payslips/objectList?csrf_protection=true`, params)
    return response.data
  },

  // ds loại chứng từ trong phiếu thu
  async apiVoucherTypePaySlipCombobox(params) {
    const response = await axiosCustom('GET', `/api_web/Api_expense_payslips/voucher_type?csrf_protection=true`, params)
    return response.data
  },
  // ds loại chứng từ trong phiếu chi
  async apiVoucherTypeVoucherCombobox(params) {
    const response = await axiosCustom('GET', `/api_web/Api_expense_voucher/voucher_type/?csrf_protection=true`, params)
    return response.data
  },

  // danh sách chứng từ trong phiếu thu
  async apiVoucherListPaySlipCombobox(params, search) {
    const response = await axiosCustom(
      search ? 'POST' : 'GET',
      `/api_web/Api_expense_payslips/voucher_list?csrf_protection=true`,
      params
    )
    return response.data
  },
  // danh sách chứng từ trong phiếu chi
  async apiVoucherListVoucherCombobox(params, search) {
    const response = await axiosCustom(
      search ? 'POST' : 'GET',
      `/api_web/Api_expense_voucher/voucher_list/?csrf_protection=true`,
      params
    )
    return response.data
  },

  /// loại chi phí trong phiếu chi
  async apiCostComboboxByBranch(params) {
    const response = await axiosCustom('GET', `/api_web/Api_cost/costCombobox/?csrf_protection=true`, params)
    return response.data
  },
}
export default apiComons
