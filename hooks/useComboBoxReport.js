import apiReport from '@/Api/apiReport-Statistical/apiReport';
import apiSalesOrder from '@/Api/apiSalesExportProduct/salesOrder/apiSalesOrder';
import apiSuppliers from '@/Api/apiSuppliers/suppliers/apiSuppliers';
import { useQuery } from '@tanstack/react-query';

//Đơn hàng trong báo cáo
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

//Mặt hàng trong báo cáo
export const useGetItemsWithBranch = params => {
  const hasBranch = params?.branch_ids && (Array.isArray(params.branch_ids) ? params.branch_ids.length > 0 : true);
  return useQuery({
    queryKey: ['api_get_items_with_branch', params],
    queryFn: async () => {
      const response = await apiReport.apiItemsWithBranch({ params });
      return response.data?.result?.map(e => ({
        label: `${e.name + e.code + e.id}`,
        name: e.name,
        value: e.id,
        code: e.code,
        img: e.images,
        type: e.text_type,
      }));
    },
    enabled: !!hasBranch,
  });
};

//Nhà cung cấp trong báo cáo
export const useGetSuppliersWithBranch = params => {
  const hasBranch = params?.branch_ids && (Array.isArray(params.branch_ids) ? params.branch_ids.length > 0 : true);
  return useQuery({
    queryKey: ['api_get_suppliers_with_branch', params],
    queryFn: async () => {
      const response = await apiSuppliers.apiListSuppliers({ params });
      return response;
    },
    enabled: !!hasBranch,
  });
};