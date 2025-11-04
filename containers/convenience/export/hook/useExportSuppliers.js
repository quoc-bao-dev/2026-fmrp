import { useMutation } from '@tanstack/react-query';
import apiExport from '@/Api/apiConvenience/apiExport';

/**
 * Hook để export dữ liệu nhà cung cấp
 * @param {Object} options - Các options và setters
 * @param {Function} options.showToat - Function hiển thị toast notification
 * @param {Object} options.dataLang - Object chứa các text đa ngôn ngữ
 * @param {Function} options.sIsShow - Setter để hiển thị/ẩn button export
 * @param {Function} options.sDataServer - Setter để lưu dữ liệu server trả về
 * @param {Function} options.sMultipleProgress - Setter để cập nhật progress
 * @param {Function} options.sOnSending - Setter để cập nhật trạng thái sending
 * @returns {Object} { exportSuppliers: Function, isPending: boolean }
 */
export const useExportSuppliers = ({ showToat, dataLang, sIsShow, sDataServer, sMultipleProgress, sOnSending }) => {
  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiExport.apiExportSuppliers(data);
      return response;
    },
    onSuccess: (response) => {
      if (response.isSuccess == 1) {
        sIsShow(true);
        sDataServer(response.data || []);
        sMultipleProgress(100);
        showToat('success', 'Export dữ liệu thành công');
      } else {
        setTimeout(() => sMultipleProgress(0), 3000);
        showToat('error', dataLang[response.message] || response.message || 'Export dữ liệu thất bại');
      }
      sOnSending(false);
    },
    onError: () => {
      setTimeout(() => sMultipleProgress(0), 3000);
      showToat('error', 'Export dữ liệu thất bại');
      sOnSending(false);
    },
  });

  /**
   * Hàm export với logic tính toán requestData tự động
   * @param {Object} params - Tham số export
   * @param {Object} params.pageLimit - { page, limit }
   * @param {Array} params.suppliers - Mảng suppliers đã chọn
   * @param {Array} params.contacts - Mảng contacts đã chọn
   */
  const exportSuppliers = ({ pageLimit, suppliers = [], contacts = [] }) => {
    const { page = 1, limit } = pageLimit;
    let exportFrom = 1;
    let exportTo = null;

    if (limit == -1) {
      exportFrom = 1;
      exportTo = null;
    } else {
      exportFrom = (page - 1) * limit + 1;
      exportTo = page * limit;
    }

    const requestData = {
      export_from: exportFrom,
      ...(exportTo !== null && { export_to: exportTo }),
      fields: suppliers.map(e => e?.value),
      field_contacts: contacts.map(e => e?.value),
    };

    mutation.mutate(requestData);
  };

  return {
    exportSuppliers,
    isPending: mutation.isPending,
  };
};

