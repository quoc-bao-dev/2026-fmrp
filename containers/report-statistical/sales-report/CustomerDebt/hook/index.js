import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';

export const useGetCustomerDebt = data => {
  const fetchCustomerDebt = async () => {
    const response = await apiReport.apiGetCustomerDebt({ params: data });
    return response.data?.output;
  };
  return useQuery({
    queryKey: ['api_get_customer_debt', data],
    queryFn: fetchCustomerDebt,
    enabled: !!data?.branch_ids && !!data?.client_id,
  });
};

// export const useGetReturnsComboboxWithBranch = (search, branch_ids) => {
//   const fetChListCode = async search => {
//     const { data } = await apiReturnSales.apiSearchReturnOrder({ params: { term: search, branch_ids: branch_ids } });
//     return data?.return_order.map(e => ({ label: e.reference_no, value: e.id }));
//   };
//   return useQuery({
//     queryKey: ['api_search_return_order', search, branch_ids],
//     queryFn: () => fetChListCode(search),
//     enabled: !!branch_ids,
//   });
// };
