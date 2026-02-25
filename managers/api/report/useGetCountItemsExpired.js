import { useQuery } from '@tanstack/react-query';
import apiReport from '@/Api/apiReport-Statistical/apiReport';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} GetCountItemsExpiredFilter
 * @property {Array<number|string>} [branch_ids] - Danh sách chi nhánh lọc
 * @property {string} [type_items] - Loại hàng: 'product' | 'material'
 * @property {string} [status] - Trạng thái: 'expired' | 'expiring'
 */

/**
 * @typedef {Object} GetCountItemsExpiredData
 * @property {number} [page] - Trang hiện tại (không bắt buộc với API này, để đồng bộ filter)
 * @property {number} [limit] - Số bản ghi mỗi trang (không bắt buộc, để đồng bộ filter)
 * @property {string} [search] - Từ khóa tìm kiếm
 * @property {GetCountItemsExpiredFilter} [filter] - Bộ lọc giống với useGetListExpiryWarning
 */

/**
 * Custom hook for getting expired items count
 * @description Lấy tổng số lượng mặt hàng sắp hết hạn / đã hết hạn, với bộ lọc giống hệt `useGetListExpiryWarning`
 * @param {GetCountItemsExpiredData} data - Đối tượng filter (page, limit, search, filter{ branch_ids, type_items, status })
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - Response data (ví dụ: { count_product, count_material })
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isFetching - Fetching state
 * @returns {Error} returns.error - Error object
 * @returns {Function} returns.refetch - Hàm gọi lại query
 *
 * @example
 * const { data, isLoading } = useGetCountItemsExpired({
 *   page: 1,
 *   limit: 15,
 *   search: '',
 *   filter: {
 *     branch_ids: [1],
 *     type_items: 'product',
 *     status: 'expired',
 *   },
 * });
 */
export const useGetCountItemsExpired = (data) => {
    const showToast = useToast();

    const { data: queryData, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['apiGetCountItemsExpired', data],
        queryFn: async () => {
            const filter = data?.filter || {};

            const params = {
                page: data?.page || 1,
                limit: data?.limit || 15,
                search: data?.search || '',
            };

            if (filter.status) {
                params['filter[status]'] = filter.status;
            }

            if (filter.type_items) {
                params['filter[type_items]'] = filter.type_items;
            }

            if (Array.isArray(filter.branch_ids) && filter.branch_ids.length > 0) {
                filter.branch_ids.forEach((branchId, index) => {
                    params[`filter[branch_ids][${index}]`] = branchId;
                });
            }

            const res = await apiReport.apiGetCountItemsExpired(params);
            return res;
        },
        enabled: true,
        onError: error => {
            showToast('error', 'Có lỗi xảy ra khi lấy thống kê hàng hết hạn');
            // Không cần bubble thêm nếu không truyền callback
        },
        retry: 3,
        retryDelay: 2000,
    });

    return {
        data: queryData,
        isLoading,
        isFetching,
        error,
        refetch,
    };
};


