import apiReport from '@/Api/apiReport-Statistical/apiReport';
import apiSalesOrder from '@/Api/apiSalesExportProduct/salesOrder/apiSalesOrder';
import { useQuery } from '@tanstack/react-query';

export const useGetOrderProgress = data => {
  const fetchOrderProgress = async () => {
    const response = await apiReport.apiGetOrderProgress({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_order_progress', data],
    queryFn: fetchOrderProgress,
  });
};

export const useGetSalesOrderCombobox = params => {
  return useQuery({
    queryKey: ['api_get_order_progress_combobox', params],
    queryFn: async () => {
      const response = await apiSalesOrder.apiSearchOrder({ params });
      return response.data;
    },
    keepPreviousData: true,
  });
};

export const useGetItemsWithBranch = params => {
  return useQuery({
    queryKey: ['api_get_items_with_branch', params],
    queryFn: async () => {
      const response = await apiReport.apiItemsWithBranch({ params });
      return response.data?.result?.map((e) => ({
        label: `${e.name + e.code + e.id}`,
        name: e.name,
        value: e.id,
        code: e.code,
        img: e.images,
        type: e.text_type,
    }))
    },
  });
};
