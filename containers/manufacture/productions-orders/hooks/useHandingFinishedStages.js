import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useFeature from "@/hooks/useConfigFeature";
import useToast from "@/hooks/useToast";
import { formatMoment } from "@/utils/helpers/formatMoment";
import { useMutation } from "@tanstack/react-query";

export const useHandingFinishedStages = () => {
    const isToast = useToast()

    const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature()

    const submitMutation = useMutation({
        mutationFn: (data) => {
            return apiProductionsOrders.apiHandlingFinishedStages(data)
        }
    })

    const onSubmit = async (data) => {
        try {
            const formData = new FormData()

            formData.append("po_id", data?.poId)

            formData.append("warehouse_import_id", data?.objectData?.objectWareHouse?.id)

            const { objectData: { dataTableProducts, dataTableBom } } = data

            // if (!dataTableProducts || !dataTableBom || dataTableProducts?.data?.items?.length == 0 || dataTableBom?.data?.boms?.length == 0) {
            //     isToast('error', 'Vui lòng kiểm tra dữ liệu')
            //     return
            // }

            /// ds nhập thành phẩm
            for (let index = 0; index < dataTableProducts?.data?.items?.length; index++) {
                const element = dataTableProducts?.data?.items[index];

                if (!element.quantityEnterClient && !element.quantityError) {
                    isToast('error', 'Vui lòng kiểm tra dữ liệu')
                    return
                }
                formData.append(`items[${index}][bom_id]`, element?.bom_id ?? "")
                formData.append(`items[${index}][poi_id]`, element?.poi_id ?? "")
                formData.append(`items[${index}][pp_id]`, element?.pp_id ?? "")
                formData.append(`items[${index}][parent_id]`, element?.parent_id ?? "")
                formData.append(`items[${index}][item_id]`, element?.item_id ?? "")
                formData.append(`items[${index}][item_code]`, element?.item_code ?? "")
                formData.append(`items[${index}][item_name]`, element?.item_name ?? "")
                formData.append(`items[${index}][unit_name]`, element?.unit_name ?? "")
                formData.append(`items[${index}][reference_no_detail]`, element?.reference_no_detail ?? "")
                formData.append(`items[${index}][quantity]`, element?.quantityEnterClient ?? 0)
                formData.append(`items[${index}][quantity_error]`, element?.quantityError ?? 0)
                formData.append(`items[${index}][quantity_rest]`, element?.quantity_rest ?? 0)
                formData.append(`items[${index}][product_variation]`, element?.product_variation ?? "")
                formData.append(`items[${index}][pois_id]`, element?.pois_id ?? 0)
                formData.append(`items[${index}][type]`, element?.type ?? "")
                formData.append(`items[${index}][type_products]`, element?.type_products ?? "")
                formData.append(`items[${index}][number]`, element?.number ?? "")
                formData.append(`items[${index}][final_stage]`, element?.final_stage ?? "")
                formData.append(`items[${index}][item_variation_id]`, element?.item_variation_id ?? "")

                // công đoạn cuối
                if (element?.final_stage == 1) {
                    if (dataMaterialExpiry.is_enable === "1" || dataProductExpiry.is_enable === "1") {
                        // if (dataProductExpiry?.is_enable == "0") {
                        formData.append(`items[${index}][lot]`, element?.lot ?? "")
                        formData.append(`items[${index}][date_expiration]`, formatMoment(element?.date, FORMAT_MOMENT.DATE_SLASH_LONG) ?? "")
                        // }
                    }
                    if (dataProductSerial.is_enable === "1") {
                        for (let serialIndex = 0; serialIndex < element?.serial?.length; serialIndex++) {
                            const elementSerial = element?.serial[serialIndex];
                            formData.append(`items[${index}][serial_quantity][${serialIndex}]`, elementSerial?.value ?? "")
                        }
                        for (let serialErrorIndex = 0; serialErrorIndex < element?.serialError?.length; serialErrorIndex++) {
                            const elementSerialError = element?.serialError[serialErrorIndex];
                            formData.append(`items[${index}][serial_quantity_error][${serialErrorIndex}]`, elementSerialError?.value ?? "")
                        }
                    }
                }
            }

            // ds Xuất kho sản xuất
            for (let index = 0; index < dataTableBom?.data?.boms?.length; index++) {
                const element = dataTableBom?.data?.boms[index];

                if (element?.warehouseId?.length == 0) {
                    isToast('error', 'Vui lòng kiểm tra dữ liệu')
                    return
                }

                formData.append(`boms[${index}][type_products]`, element?.type_products ?? "")
                formData.append(`boms[${index}][type_item]`, element?.type_item ?? "")
                formData.append(`boms[${index}][type_bom]`, element?.type_bom ?? "")
                formData.append(`boms[${index}][stage_id]`, element?.stage_id ?? "")
                formData.append(`boms[${index}][stage_name]`, element?.stage_name ?? "")
                formData.append(`boms[${index}][item_id]`, element?.item_id ?? "")
                formData.append(`boms[${index}][item_variation_option_value_id]`, element?.item_variation_option_value_id ?? "")
                formData.append(`boms[${index}][item_code]`, element?.item_code ?? "")
                formData.append(`boms[${index}][item_name]`, element?.item_name ?? "")
                formData.append(`boms[${index}][unit_name]`, element?.unit_name ?? "")
                formData.append(`boms[${index}][unit_name_primary]`, element?.unit_name_primary ?? "")
                formData.append(`boms[${index}][quota]`, element?.quota ?? "")
                formData.append(`boms[${index}][loss]`, element?.loss ?? "")
                formData.append(`boms[${index}][quota_exchange]`, element?.quota_exchange ?? "")
                formData.append(`boms[${index}][quantity_total_quota]`, element?.quantity_total_quota ?? "")
                formData.append(`boms[${index}][quantity_quota_primary]`, element?.quantity_quota_primary ?? "")
                formData.append(`boms[${index}][unit_id]`, element?.unit_id ?? "")
                formData.append(`boms[${index}][unit_parent_id]`, element?.unit_parent_id ?? "")
                formData.append(`boms[${index}][images]`, element?.images ?? "")
                formData.append(`boms[${index}][product_variation]`, element?.product_variation ?? "")
                formData.append(`boms[${index}][quantity_warehouse]`, element?.quantity_warehouse ?? "")
                formData.append(`boms[${index}][quantity_keep]`, element?.quantity_keep ?? "")
                formData.append(`boms[${index}][_id]`, element?._id)
                formData.append(`boms[${index}][pois_id]`, element?.pois_id ?? 0)

                for (let j = 0; j < element?.warehouseId?.length; j++) {
                    const elementJ = element?.warehouseId[j];
                    formData.append(`boms[${index}][list_warehouse_bom][${j}]`, elementJ?.id ?? "")
                }
            }

            // bomItemsPod
            formData.append("bomItemsPod", JSON.stringify(dataTableBom?.data?.bomItemsPod))

            const r = await submitMutation.mutateAsync(formData);
            if (r?.isSuccess == 1) {
                isToast('success', r?.message)
                return r
            }
            isToast('error', r?.message)
            return r
        } catch (error) {
            throw error
        }

    }

    return { onSubmit, isLoading: submitMutation.isPending, }
}