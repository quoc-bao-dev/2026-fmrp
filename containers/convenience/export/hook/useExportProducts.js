import { useMutation } from '@tanstack/react-query';
import apiExport from '@/Api/apiConvenience/apiExport';

/**
 * Hook để export dữ liệu thành phẩm
 */
export const useExportProducts = ({ showToat, dataLang, sIsShow, sDataServer, sMultipleProgress, sOnSending }) => {
  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiExport.apiExportProducts(data);
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
   * @param {Object} params
   * @param {{page:number, limit:number}} params.pageLimit
   * @param {Array} params.products - mảng field products đã chọn (obj có field value)
   */
  const exportProducts = ({ pageLimit, products = [] }) => {
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
      fields: products.map((e) => e?.value),
    };

    mutation.mutate(requestData);
  };

  return { exportProducts, isPending: mutation.isPending };
};


