import apiSummaryBtpNvl from "@/Api/apiManufacture/manufacture/summary-btp-nvl/apiSummaryBtpNvl";
import { useQuery } from "@tanstack/react-query";

export const useSummaryBtpNvl = (data) => {
  const fetchSummaryBtpNvl = async () => {
    const response = await apiSummaryBtpNvl.apiSummaryBtpNvl({ params: data });
    return response.data;
  };
  return useQuery({ 
    queryKey: ['summaryBtpNvl', data],
    queryFn: fetchSummaryBtpNvl,
    enabled: !!(data?.po_ids?.length),
  });
};
