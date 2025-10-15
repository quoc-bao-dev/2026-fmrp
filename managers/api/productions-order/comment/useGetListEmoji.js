import { keepPreviousData, useQuery } from "@tanstack/react-query";
import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { optionsQuery } from "@/configs/optionsQuery";

export const useGetListEmoji = ({
    enabled,
}) => {
    const fetchListEmoji = async () => {
        const { data } = await apiProductionsOrders.apiGetListEmoji()

        return data?.emoji
    };

    return useQuery({
        queryKey: ['apiGetListEmoji'],
        queryFn: fetchListEmoji,
        enabled: enabled,
        placeholderData: keepPreviousData,
        staleTime: 2 * 60 * 1000, // ← không refetch trong vòng 5 phút (tuỳ chọn)
        ...optionsQuery
    });
};
