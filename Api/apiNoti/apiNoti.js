import { _ServerInstance as axiosCustom } from '@/services/axios';

const apiNoti = {
  async getCheckNotiRead(params) {
    const response = await axiosCustom('GET', `/api_web/Api_Notifications/getCheckNotiRead`, params);
    return response.data;
  },

  async apiListNoti(params) {
    const response = await axiosCustom('POST', `/api_web/Api_Notifications/getNotifications`, params);
    return response.data;
  },

  async apiReadSingleNoti(params) {
    const response = await axiosCustom('POST', `/api_web/Api_Notifications/isReadSingleNoti`, params);
    return response.data;
  },

  async apiReadAllNoti(params) {
    const response = await axiosCustom('POST', `/api_web/Api_Notifications/isReadNoti`, params);
    return response.data;
  },
};
export default apiNoti;
