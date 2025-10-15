import apiReport from '@/Api/apiReport-Statistical/apiReport'
import { useQuery } from '@tanstack/react-query'

export const useGetDetailInItems = (data) => {
  return useQuery({
    queryKey: ['api_get_detail_in_items', data],
    queryFn: () => apiReport.apiGetDetailInItems({ params: data }),
    enabled: !!data,
  })
}

export const useGetDetailOutItems = (data) => {
  return useQuery({
    queryKey: ['api_get_detail_out_items', data],
    queryFn: () => apiReport.apiGetDetailOutItems({ params: data }),
    enabled: !!data,
  })
}

// Hook để lấy tất cả dữ liệu chi tiết nhập kho (không phân trang) - dùng cho xuất Excel
export const useGetAllDetailInItems = (data, enabled = false) => {
  return useQuery({
    queryKey: ['api_get_all_detail_in_items', data],
    queryFn: () => {
      // Loại bỏ page và limit để lấy tất cả dữ liệu
      const { page, limit, ...paramsWithoutPagination } = data || {}
      return apiReport.apiGetDetailInItems({ params: paramsWithoutPagination })
    },
    enabled: enabled && !!data,
  })
}

// Hook để lấy tất cả dữ liệu chi tiết xuất kho (không phân trang) - dùng cho xuất Excel
export const useGetAllDetailOutItems = (data, enabled = false) => {
  return useQuery({
    queryKey: ['api_get_all_detail_out_items', data],
    queryFn: () => {
      // Loại bỏ page và limit để lấy tất cả dữ liệu
      const { page, limit, ...paramsWithoutPagination } = data || {}
      return apiReport.apiGetDetailOutItems({ params: paramsWithoutPagination })
    },
    enabled: enabled && !!data,
  })
}