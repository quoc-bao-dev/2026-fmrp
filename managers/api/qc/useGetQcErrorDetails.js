import { useMutation } from "@tanstack/react-query";
import apiQcErrorDetails from "@/Api/apiManufacture/qc/qcErrorDetails/apiQcErrorDetails";
import useToast from "@/hooks/useToast";

/**
 * Custom hook for fetching QC error details
 * @description Lấy danh sách lỗi QC theo sản phẩm/biến thể bằng form-data
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Callback khi thành công
 * @param {Function} [options.onError] - Callback khi lỗi
 * @returns {Object} Hook return object
 * @returns {Function} returns.getQcErrorDetails - Hàm trigger lấy dữ liệu
 * @returns {boolean} returns.isLoading - Trạng thái loading
 * @returns {Object} returns.data - Dữ liệu trả về
 * @returns {Error} returns.error - Lỗi nếu có
 */
export const useGetQcErrorDetails = (options = {}) => {
  const showToast = useToast();

  const getQcErrorDetailsMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiQcErrorDetails.apiGetQcErrorDetails(payload);
      return res;
    },
    onSuccess: (data) => {
      if (data?.isSuccess) {
        if (options.onSuccess) options.onSuccess(data);
      } else {
        showToast("error", data?.message || "Lấy chi tiết lỗi QC thất bại");
      }
    },
    onError: (error) => {
      showToast("error", "Có lỗi xảy ra khi lấy chi tiết lỗi QC");
      if (options.onError) options.onError(error);
    },
  });

  const getQcErrorDetails = async (payload) => {
    getQcErrorDetailsMutation.mutate(payload);
  };

  return {
    getQcErrorDetails,
    isLoading: getQcErrorDetailsMutation.isPending,
    data: getQcErrorDetailsMutation.data,
    error: getQcErrorDetailsMutation.error,
  };
};

