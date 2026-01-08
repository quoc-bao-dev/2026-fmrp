import apiProducts from "@/Api/apiProducts/products/apiProducts";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

export const useStageList = (dataLang) => {
    const dispatch = useDispatch()
    return useQuery({
        queryKey: ["api_stage_list"],
        queryFn: async () => {

            const { rResult: stage } = await apiProducts.apiStageProducts();
            dispatch({
                type: "stage_finishedProduct/update",
                payload: stage?.map((e) => ({
                    label: e.name,
                    value: e.id,
                })),
            });

            return data
        }
    })
}