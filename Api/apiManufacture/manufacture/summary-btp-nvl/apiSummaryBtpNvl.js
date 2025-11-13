import { _ServerInstance as axiosCustom } from '@/services/axios';

const apiSummaryBtpNvl = {
  async apiSummaryBtpNvl(data) {
    const response = await axiosCustom('POST', `/api_web/production-orders/summary-planning`, data);
    return response.data;
  },
};

export default apiSummaryBtpNvl;
