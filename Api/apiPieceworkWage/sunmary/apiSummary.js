import { _ServerInstance as axiosCustom } from '@/services/axios';

const apiSummary = {
  // Chi tiết tổng hợp
  async apiSummaryDetail(params) {
    const response = await axiosCustom('POST', `/api_web/production-input-timesheets/detail-aggregate-production-input`, { data: params });
    return response.data;
  },

};

export default apiSummary;
