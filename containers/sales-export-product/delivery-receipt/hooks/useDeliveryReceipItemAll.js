import apiDeliveryReceipt from "@/Api/apiSalesExportProduct/deliveryReceipt/apiDeliveryReceipt"
import { useQuery } from "@tanstack/react-query"

export const useDeliveryReceipItemAll = (params) => {
    const hasOrderId = params?.['filter[order_id]'] != null && params?.['filter[order_id]'] !== ''
    
    return useQuery({
        queryKey: ["api_delivery_receipt_item_all", { ...params }],
        queryFn: async () => {
            const { data: { result } } = await apiDeliveryReceipt.apiPageItems({ params: params })
            return result
        },
        enabled: hasOrderId
    })
}