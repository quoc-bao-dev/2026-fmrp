import { _ServerInstance as axiosCustom } from '@/services/axios';

const apiInventory = {
  async apiPrintTemInventory(data) {
    const response = await axiosCustom('POST', `/api_web/api_print/Print_tem_nvlInventoryWeb?csrf_protection=true`, data);
    return response.data;
  },
};
export default apiInventory;
