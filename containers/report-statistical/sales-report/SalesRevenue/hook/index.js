import apiReport from '@/Api/apiReport-Statistical/apiReport';
import apiSalesOrder from '@/Api/apiSalesExportProduct/salesOrder/apiSalesOrder';
import { useQuery } from '@tanstack/react-query';

export const useGetSalesRevenue = data => {
  const fetchSalesRevenue = async () => {
    const response = await apiReport.apiGetSalesRevenue({ params: data });
    return response.data.output;
  };
  return useQuery({
    queryKey: ['api_get_sales_revenue', data],
    queryFn: fetchSalesRevenue,
  });
};

export const useSalesOrderComboboxWithBranch = (search, branch_id) => {
  return useQuery({
    queryKey: ['api_search_orders_with_branch', search, branch_id],
    queryFn: async () => {
      const { data } = await apiSalesOrder.apiSearchOrderWithBranch({ params: { search: search, branch_ids: branch_id } });
      return data?.orders?.map(({ reference_no, id }) => ({ label: reference_no, value: id }));
    },
    enabled: !!branch_id,
  });
};
