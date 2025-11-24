import { _ServerInstance as axiosCustom } from '@/services/axios';

const apiWarehouseTransfer = {
  async apiListTransfer(param) {
    const response = await axiosCustom('GET', `/api_web/Api_transfer/transfer/?csrf_protection=true`, param);
    return response.data;
  },
  async apiTransferFilterBar(param) {
    const response = await axiosCustom('GET', `/api_web/Api_transfer/TransferFilterBar/?csrf_protection=true`, param);
    return response.data;
  },
  async apiTransferCombobox(method, data) {
    const response = await axiosCustom(`${method}`, `/api_web/Api_transfer/TransferCombobox/?csrf_protection=true`, data);
    return response.data;
  },
  async apiWarehouseComboboxFindBranch() {
    const response = await axiosCustom('GET', `/api_web/Api_warehouse/warehouseComboboxFindBranch/?csrf_protection=true`);
    return response.data;
  },
  async apiDetailTransfer(id) {
    const response = await axiosCustom('GET', `/api_web/Api_transfer/transfer/${id}?csrf_protection=true`);
    return response.data;
  },
  async apiWarehouseComboboxNotSystem() {
    const response = await axiosCustom('GET', `/api_web/Api_warehouse/warehouseCombobox_not_system/?csrf_protection=true`);
    return response.data;
  },
  async apiGetTransferDetail(id) {
    const response = await axiosCustom('GET', `/api_web/Api_transfer/getTransferDetail/${id}?csrf_protection=true`);
    return response.data;
  },
  async apiGetSemiItems(method, params) {
    const response = await axiosCustom(`${method}`, `/api_web/Api_stock/getSemiItems/?csrf_protection=true`, params);
    return response.data;
  },

  async apiWarehouseCombobox(params) {
    const response = await axiosCustom('GET', `/api_web/Api_warehouse/warehouseCombobox/?csrf_protection=true`, params);
    return response.data;
  },
  async apiwarehouseLocationCombobox(params) {
    const response = await axiosCustom('GET', `/api_web/Api_warehouse/warehouseLocationCombobox/?csrf_protection=true`, params);
    return response.data;
  },
  async apiHandingTransfer(url, data) {
    const response = await axiosCustom('POST', `${url}`, data);
    return response.data;
  },
  async apiHandingStatusTransfer(data) {
    const response = await axiosCustom('POST', `/api_web/Api_transfer/confirmWarehouse?csrf_protection=true`, data);
    return response.data;
  },
  async apiPrintWarehouseTransfer({ id }) {
    const response = await axiosCustom('GET', `/api_web/api_print/Print_TransfersWeb?csrf_protection=true&id=${id}`);
    return response.data;
  },
};
export default apiWarehouseTransfer;
