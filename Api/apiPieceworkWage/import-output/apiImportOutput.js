import { _ServerInstance as axiosCustom } from '@/services/axios';

const apiImportOutput = {
  async apiLookupStages(data) {
    const response = await axiosCustom('GET', `/api_web/stages/lookup`, data);
    return response.data;
  },

  async apiListImportOutput(params) {
    const response = await axiosCustom('POST', `/api_web/production-input/list`, params);
    return response.data;
  },

  async apiListImportOutputItems(params) {
    const response = await axiosCustom('POST', `/api_web/production-input/items`, params);
    return response.data;
  },

  async apiSavePomStages(params) {
    const response = await axiosCustom('POST', `/api_web/pom-stages/save`, params);
    return response.data;
  },
};

export default apiImportOutput;
