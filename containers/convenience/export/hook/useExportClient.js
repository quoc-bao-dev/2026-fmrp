import { useMutation } from '@tanstack/react-query';
import { _ServerInstance as Axios } from '/services/axios';

/**
 * Hook để export dữ liệu khách hàng (tab 1)
 * @param {Object} options - Các options và setters
 * @param {Function} options.showToat - Function hiển thị toast notification
 * @param {Object} options.dataLang - Object chứa các text đa ngôn ngữ
 * @param {Function} options.sIsShow - Setter để hiển thị/ẩn button export
 * @param {Function} options.sDataServer - Setter để lưu dữ liệu server trả về
 * @param {Function} options.sMultipleProgress - Setter để cập nhật progress
 * @param {Function} options.sOnSending - Setter để cập nhật trạng thái sending
 * @returns {Object} { exportClient: Function, isPending: boolean }
 */
export const useExportClient = ({ showToat, dataLang, sIsShow, sDataServer, sMultipleProgress, sOnSending }) => {
  const mutation = useMutation({
    mutationFn: async ({ pageLimit, clients = [], contacts = [], address = [] }) => {
      return new Promise((resolve, reject) => {
        const apiUrl = `/api_web/api_export_data/export_data_client/${pageLimit.page}/${pageLimit.limit}?csrf_protection=true`;
        
        const formData = new FormData();
        clients.forEach((e, index) => {
          formData.append(`field[${index}]`, e?.value);
        });
        
        if (address.length > 0) {
          address.forEach((a, aIndex) => {
            formData.append(`field_arrAddress[${aIndex}]`, a?.value);
          });
        }
        
        if (contacts.length > 0) {
          contacts.forEach((c, cIndex) => {
            formData.append(`field_contacts[${cIndex}]`, c?.value);
          });
        }

        Axios(
          'POST',
          apiUrl,
          {
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: progressEvent => {
              const { loaded, total } = progressEvent;
              const percentage = Math.floor((loaded * 100) / total);
              sMultipleProgress(percentage);
            },
          },
          (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(response.data);
            }
          }
        );
      });
    },
    onSuccess: (responseData) => {
      const { success, data, message } = responseData;
      if (success) {
        sIsShow(true);
        sDataServer(data);
        sMultipleProgress(100);
        showToat('success', 'Export dữ liệu thành công');
      } else {
        setTimeout(() => {
          sMultipleProgress(0);
        }, 3000);
        showToat('error', dataLang[message] || message);
      }
      sOnSending(false);
    },
    onError: () => {
      setTimeout(() => {
        sMultipleProgress(0);
      }, 3000);
      showToat('error', 'Export dữ liệu thất bại');
      sOnSending(false);
    },
  });

  /**
   * Hàm export client với logic tự động
   * @param {Object} params - Tham số export
   * @param {Object} params.pageLimit - { page, limit }
   * @param {Array} params.clients - Mảng clients đã chọn
   * @param {Array} params.contacts - Mảng contacts đã chọn
   * @param {Array} params.address - Mảng address đã chọn
   */
  const exportClient = ({ pageLimit, clients = [], contacts = [], address = [] }) => {
    mutation.mutate({ pageLimit, clients, contacts, address });
  };

  return {
    exportClient,
    isPending: mutation.isPending,
  };
};

