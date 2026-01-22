import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { optionsQuery } from "@/configs/optionsQuery";
import { useQuery } from "@tanstack/react-query";

export const useProductionOutput = (data) => {
  const fetchProductionOutput = async () => {
    const response = await apiProductionsOrders.apiGetProductionOutputByPo(data);
    return response.data;
  };
  return useQuery({
    queryKey: ['apiGetProductionOutputByPo', data],
    queryFn: fetchProductionOutput,
    ...optionsQuery,
  });
};

export const useDetailStaffByPo = (data, options = {}) => {
  const fetchDetailStaffByPo = async () => {
    const response = await apiProductionsOrders.apiGetDetailStaffByPo(data);
    return response.data;
  };
  return useQuery({
    queryKey: ['apiGetDetailStaffByPo', data],
    queryFn: fetchDetailStaffByPo,
    ...optionsQuery,
    ...options,
  });
};

export const useHistoryPurchaseProduct = (data, options = {}) => {
  const fetchHistoryPurchaseProduct = async () => {
    const response = await apiProductionsOrders.apiGetHistoryPurchaseProduct(data);
    return response.data;
  };
  return useQuery({
    queryKey: ['apiGetHistoryPurchaseProduct', data],
    queryFn: fetchHistoryPurchaseProduct,
    ...optionsQuery,
    ...options,
  });
};

export const useHistoryTimers = (data, options = {}) => {
  const fetchHistoryTimers = async () => {
    const response = await apiProductionsOrders.apiGetHistoryTimers(data);
    return response.data;
  };
  return useQuery({
    queryKey: ['apiGetHistoryTimers', data],
    queryFn: fetchHistoryTimers,
    ...optionsQuery,
    ...options,
  });
};