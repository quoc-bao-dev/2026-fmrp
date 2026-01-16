import { _ServerInstance as axiosCustom } from '@/services/axios';

const apiImportOutput = {
  async apiLookupStages(data) {
    const response = await axiosCustom('GET', `/api_web/stages/lookup`, data);
    return response.data;
  },

  async apiListImportOutput(params) {
    const response = await axiosCustom('POST', `/api_web/production-input/list`, {data: params});
    return response.data;
  },

  async apiListImportOutputItems(params) {
    const response = await axiosCustom('POST', `/api_web/production-input/items`, { data: params });
    return response.data;
  },

  async apiSavePomStages(params) {
    const response = await axiosCustom('POST', `/api_web/pom-stages/save`, { data: params });
    return response.data;
  },

  async apiListPomStages(params) {
    const response = await axiosCustom('GET', `/api_web/pom-stages/list`, params);
    return response.data;
  },

  async apiSavePomStagesDetail(params) {
    const response = await axiosCustom('POST', `/api_web/pom-stages/save-detail`, { data: params });
    return response.data;
  },

  async apiLookupGroupMembers(params) {
    const response = await axiosCustom('GET', `/api_web/group-members/lookup`, params);
    return response.data;
  },
};

export default apiImportOutput;
