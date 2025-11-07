import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';

export const useGetDebtSuppliers = data => {
  const supplierId = data?.supplier_id;
  const fetchDebtSuppliers = async () => {
    const response = await apiReport.apiGetDebtSuppliers({ params: data });
    return response.data?.output;
  };
  return useQuery({
    queryKey: ['api_get_debt_suppliers', supplierId, data?.start_date, data?.end_date],
    queryFn: fetchDebtSuppliers,
    enabled: !!supplierId,
  });
};
