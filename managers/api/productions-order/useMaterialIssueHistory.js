import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { optionsQuery } from "@/configs/optionsQuery";

export const useMaterialIssueHistory = ({
    isSearch = "",
    limit = 10,
    poiId,
    enabled,
    idTabSheet
}) => {
    const fetchMaterialIssueHistory = async ({ pageParam = 1 }) => {
        let formData = new FormData();

        if (isSearch) {
            formData.append("search", isSearch)
        }
        formData.append("pod_id", poiId);

        const {data} = await apiProductionsOrders.apiGetSuggestExporting({ page: pageParam, limit: limit }, formData)

        // const flattenedItemsArray = res?.data?.rResult?.flatMap(entry =>
        //     entry.items.map(item => ({
        //         branch_name: entry.branch_name,
        //         code: entry.code,
        //         created_by: entry.created_by,
        //         date: entry.date,
        //         grand_total: entry.grand_total,
        //         id: entry.id,
        //         note: entry.note,
        //         poi_data: entry.poi_data,
        //         poiId: entry.poiId,
        //         staff_create: entry.staff_create,
        //         total_quantity: entry.total_quantity,
        //         item
        //     }))
        // );

        // console.log('flattenedItemsArray', flattenedItemsArray);
        // return { ...res.data, rResult: flattenedItemsArray } || {}
        return data
    };

    return useInfiniteQuery({
        queryKey: ['apiGetSuggestExporting', poiId, isSearch, idTabSheet, limit],
        queryFn: fetchMaterialIssueHistory,
        enabled: enabled,
        placeholderData: keepPreviousData,
        getNextPageParam: (lastPage, pages) => {
            // Kiểm tra nếu còn trang kế tiếp
            if (lastPage?.output?.next === 1) {
                return pages.length + 1; // Trang tiếp theo
            }
            return undefined;
        },
        initialPageParam: 1,
        ...optionsQuery
    });
};
