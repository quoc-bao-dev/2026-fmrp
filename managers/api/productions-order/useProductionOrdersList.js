import { useInfiniteQuery } from "@tanstack/react-query";
import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { useContext } from "react";
import { StateContext } from "@/context/_state/productions-orders/StateContext";

export const useProductionOrdersList = (params) => {
    const { isStateProvider, queryStateProvider } = useContext(StateContext);

    const fetchProductionOrdersList = async ({ pageParam = 1 }) => {
        const limit = isStateProvider?.productionsOrders?.limit || params?.limit || 15;
        const { data } = await apiProductionsOrders.apiProductionOrders(pageParam, limit, { params });

        // if (pageParam === 1) {
        //     queryStateProvider({
        //         productionsOrders: {
        //             ...isStateProvider?.productionsOrders,
        //             countAll: data?.countAll,
        //             productionOrdersList: data?.productionOrders.map((e, index) => ({ ...e })),
        //             next: data?.next == 1,
        //             idDetailProductionOrder: data?.productionOrders[0]?.id ?? null,
        //         }
        //     });
        // } else {
        //     queryStateProvider({
        //         productionsOrders: {
        //             ...isStateProvider?.productionsOrders,
        //             countAll: data?.countAll,
        //             productionOrdersList: merged.map((e) => ({ ...e })),
        //             next: data?.next == 1,
        //         }
        //     });
        // }

        return {
            ...data,
            // nextPage: data?.next == 1 ? pageParam + 1 : undefined,
        };
    };

    // Sử dụng params trực tiếp nếu params được truyền vào (như trong SummaryBtpNvl)
    // Nếu không có params, sử dụng StateContext (như trong ProductionsOrderMain)
    const useParamsDirectly = params && Object.keys(params).length > 0;

    return useInfiniteQuery({
        queryKey: useParamsDirectly
            ? [
                  "apiProductionOrders",
                  params?.search,
                  params?.limit || 15,
                  params?.date_start,
                  params?.date_end,
                  params?._po_id,
                  params?._pod_id,
                  params?.branch_id,
                  params?.orders_id,
                  params?.internal_plans_id,
                  params?.item_variation_id,
                  params?.status,
              ]
            : [
                  "apiProductionOrders",
                  isStateProvider?.productionsOrders?.search,
                  isStateProvider?.productionsOrders?.limit,
                  isStateProvider?.productionsOrders?.date?.dateStart,
                  isStateProvider?.productionsOrders?.date?.dateEnd,
                  isStateProvider?.productionsOrders?.valueProductionOrders,
                  isStateProvider?.productionsOrders?.valueProductionOrdersDetail,
                  isStateProvider?.productionsOrders?.valueBr,
                  isStateProvider?.productionsOrders?.valueOrders,
                  isStateProvider?.productionsOrders?.valuePlan,
                  isStateProvider?.productionsOrders?.valueProducts,
                  isStateProvider?.productionsOrders?.selectStatusFilter,
              ],
        queryFn: fetchProductionOrdersList,
        initialPageParam: 1,
        getNextPageParam: (lastPage, pages) => {
            // Kiểm tra nếu còn trang kế tiếp
            if (lastPage?.next === 1) {
                return pages.length + 1; // Trang tiếp theo
            }
            return undefined;
        },
        enabled: true,
        retry: 3,
        retryDelay: 2000,
    });
};
