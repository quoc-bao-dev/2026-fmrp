import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
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

export const useGetTrackProduction = (data) => {
  const fetchTrackProduction = async () => {
    const response = await apiReport.apiGetTrackProduction({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_track_production', data],
    queryFn: fetchTrackProduction,
    ...optionsQuery
  });
};

export const useGetManufacturingOrderCompletionClassification = (data) => {
  const fetchManufacturingOrderCompletionClassification = async () => {
    const response = await apiReport.apiGetManufacturingOrderCompletionClassification({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_manufacturing_order_completion_classification', data],
    queryFn: fetchManufacturingOrderCompletionClassification,
    ...optionsQuery
  });
};

export const useGetMainMaterialStock = (data) => {
  const fetchMainMaterialStock = async () => {
    const response = await apiReport.apiGetMainMaterialStock({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_main_material_stock', data],
    queryFn: fetchMainMaterialStock,
    ...optionsQuery
  });
};

// Phân trang cursor theo id_last: dùng id cuối của danh sách; nếu không có thì dùng 0
export const useGetMainMaterialStockInfinite = (baseParams, enabled = false, initialPageParam = 0) => {
  const fetchPage = async ({ pageParam = 0 }) => {
    const params = { ...baseParams, id_last: pageParam || 0 };
    const response = await apiReport.apiGetMainMaterialStock({ params });
    return response.data;
  };

  return useInfiniteQuery({
    queryKey: ['api_get_main_material_stock_infinite', baseParams, initialPageParam],
    queryFn: fetchPage,
    initialPageParam,
    getNextPageParam: (lastPage) => {
      const materials = lastPage?.materials || [];
      if (!materials.length) return undefined;
      const last = materials[materials.length - 1];
      return last?.id ?? undefined;
    },
    enabled,
    ...optionsQuery,
  });
};