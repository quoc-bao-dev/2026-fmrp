import apiSummary from "@/Api/apiPieceworkWage/sunmary/apiSummary";
import { useQuery } from "@tanstack/react-query";

export const useSummary = (params, options = {}) => {
  const fetchSummary = async () => {
    const response = await apiSummary.apiSummary(params);
    return response.data;
  };
  return useQuery({
    queryKey: ['api_summary', { ...params }],
    queryFn: fetchSummary,
    ...options,
  });
};

export const useSummaryDetail = (params, options = {}) => {
  const fetchSummaryDetail = async () => {
    const response = await apiSummary.apiSummaryDetail(params);
    return response.data;
  };
  return useQuery({
    queryKey: ['api_summary_detail', { ...params }],
    queryFn: fetchSummaryDetail,
    ...options,
  });
};  