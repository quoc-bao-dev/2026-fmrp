import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';
import { optionsQuery } from '@/configs/optionsQuery';

export const useGetSalesSummary = (data) => {
  const fetchSalesSummary = async () => {
    const response = await apiReport.apiGetSalesSummary({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_sales_summary', data],
    queryFn: fetchSalesSummary,
    ...optionsQuery
  });
};

export const useGetDebtTrend = (data) => {
  const fetchDebtTrend = async () => {
    const response = await apiReport.apiGetDebtTrend({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_debt_trend', data],
    queryFn: fetchDebtTrend,
    ...optionsQuery
  });
};

export const useGetProductGroupRevenue = (data) => {
  const fetchProductGroupRevenue = async () => {
    const response = await apiReport.apiGetProductGroupRevenue({ params: data });
    return response.data.output;
  };
  return useQuery({
    queryKey: ['api_get_product_group_revenue', data],
    queryFn: fetchProductGroupRevenue,
    ...optionsQuery
  });
};

export const useGetOrderCompletionRate = (data) => {
  const fetchOrderCompletionRate = async () => {
    const response = await apiReport.apiGetOrderCompletionRate({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_order_completion_rate', data],
    queryFn: fetchOrderCompletionRate,
    ...optionsQuery
  });
};

export const useGetCustomerTypeSales = (data) => {
  const fetchCustomerTypeSales = async () => {
    const response = await apiReport.apiGetCustomerTypeSales({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_customer_type_sales', data],
    queryFn: fetchCustomerTypeSales,
    ...optionsQuery
  });
};

export const useGetMonthlyReorderRate = (data) => {
  const fetchMonthlyReorderRate = async () => {
    const response = await apiReport.apiGetMonthlyReorderRate({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_monthly_reorder_rate', data],
    queryFn: fetchMonthlyReorderRate,
    ...optionsQuery
  });
};