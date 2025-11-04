import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';
import { optionsQuery } from '@/configs/optionsQuery';

export const useGetManufacturingPlanCompletion = (data) => {
  const fetchManufacturingPlanCompletion = async () => {
    const response = await apiReport.apiGetManufacturingPlanCompletion({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_manufacturing_plan_completion', data],
    queryFn: fetchManufacturingPlanCompletion,
    ...optionsQuery
  });
};

export const useGetLateManufacturingOrders = (data) => {
  const fetchLateManufacturingOrders = async () => {
    const response = await apiReport.apiGetLateManufacturingOrders({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_late_manufacturing_orders', data],
    queryFn: fetchLateManufacturingOrders,
    ...optionsQuery
  });
};

export const useGetQcErrorRate = (data) => {
  const fetchQcErrorRate = async () => {
    const response = await apiReport.apiGetQcErrorRate({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_qc_error_rate', data],
    queryFn: fetchQcErrorRate,
    ...optionsQuery
  });
};

export const useGetOee = (data) => {
  const fetchOee = async () => {
    const response = await apiReport.apiGetOee({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_oee', data],
    queryFn: fetchOee,
    ...optionsQuery
  });
};

export const useGetManufacturingOrderStatus = (data) => {
  const fetchManufacturingOrderStatus = async () => {
    const response = await apiReport.apiGetManufacturingOrderStatus({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_manufacturing_order_status', data],
    queryFn: fetchManufacturingOrderStatus,
    ...optionsQuery
  });
};