import apiOrder from "@/Api/apiPurchaseOrder/apiOrder";
import { optionsQuery } from "@/configs/optionsQuery";
import { useLanguageContext } from "@/context/ui/LanguageContext";
import useToast from "@/hooks/useToast";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useOrderList = (params) => {
    return useQuery({
        queryKey: ["api_list_order", { ...params }],
        queryFn: async () => {
            const { rResult, output, rTotal } = await apiOrder.apiListOrder({ params });

            return { rResult, output, rTotal }
        },
        placeholderData: keepPreviousData,
        ...optionsQuery
    })
}

export const useOrderListCode = () => {
    return useQuery({
        queryKey: ["api_list_order"],
        queryFn: async () => {
            const { rResult, output, rTotal } = await apiOrder.apiListOrder({});

            return rResult?.map((e) => ({ label: e.code, value: e.id }))
        },
        ...optionsQuery
    })
}

export const useOrderConfirm = () => {
    const showToast = useToast()
    const queryClient = useQueryClient();
    const dataLang = useLanguageContext(); 
    return useMutation({
        mutationFn: async ({ id, status }) => {
            const data = { status };
            const response = await apiOrder.apiPurchaseConfirm(id, data);
            return response
        },  
        onSuccess: (data) => {
            if(data.isSuccess){
                showToast('success', dataLang[data.message] || 'Xác nhận đơn hàng thành công');
                queryClient.invalidateQueries({ queryKey: ["api_list_order"] });
            } else {
                showToast('error', dataLang[data.message] || 'Xác nhận đơn hàng thất bại');
            }
        },
        onError: (error) => {
            console.log(error);
        }
    })
}