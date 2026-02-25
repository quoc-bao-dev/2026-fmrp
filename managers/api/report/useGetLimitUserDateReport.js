import { useQuery } from '@tanstack/react-query';
import apiReport from '@/Api/apiReport-Statistical/apiReport';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} GetLimitUserDateReportParams
 * @property {number} [page] - Trang hiện tại (mặc định 1)
 * @property {number} [limit] - Số lượng bản ghi mỗi trang (mặc định 15)
 */

/**
 * Custom hook for getting limit user date report
 * @description Lấy dữ liệu giới hạn ngày xem báo cáo theo page/limit
 * @param {Object} [options] - Hook options
 * @param {GetLimitUserDateReportParams} [options.params] - Query params
 * @param {boolean} [options.enabled=true] - Có cho phép gọi query hay không
 * @param {Function} [options.onSuccess] - Callback khi gọi thành công
 * @param {Function} [options.onError] - Callback khi gọi thất bại
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - Response data
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isFetching - Fetching state
 * @returns {Error} returns.error - Error object
 * @returns {Function} returns.refetch - Hàm gọi lại query
 */
export const useGetLimitUserDateReport = (options = {}) => {
    const showToast = useToast();
    const { params = { page: 1, limit: 15 }, enabled = true, onSuccess, onError } = options;

    const { data, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['apiGetLimitUserDateReport', params],
        queryFn: async () => {
            const res = await apiReport.apiGetLimitUserDateReport(params);
            return res;
        },
        enabled,
        onSuccess: data => {
            if (onSuccess) onSuccess(data);
        },
        onError: error => {
            showToast('error', 'Có lỗi xảy ra khi lấy giới hạn ngày báo cáo');
            if (onError) onError(error);
        },
        retry: 3,
        retryDelay: 2000,
    });

    return {
        data,
        isLoading,
        isFetching,
        error,
        refetch,
    };
};
