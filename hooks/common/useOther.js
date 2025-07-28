
import apiComons from "@/Api/apiComon/apiComon";
import { optionsQuery } from "@/configs/optionsQuery";
import { useQuery } from "@tanstack/react-query";
// ds loại chứng từ trong phiếu thu

export const useVoucherPayTypePaySlip = (params, dataLang) => {
    return useQuery({
        queryKey: ['api_voucher_type_combobox_payslip', { ...params }],
        queryFn: async () => {
            const data = await apiComons.apiVoucherTypePaySlipCombobox({
                params: {
                    type: params?.type,
                }
            });

            return data?.map(({ name, id }) => ({ label: dataLang[name] || name, value: id }))
        },
        ...optionsQuery
    })
}
// ds loại chứng từ trong phiếu chi
export const useVoucherPayTypeVoucher = (params, dataLang) => {
    return useQuery({
        queryKey: ['api_voucher_type_combobox_voucher', { ...params }],
        queryFn: async () => {
            const data = await apiComons.apiVoucherTypeVoucherCombobox({
                params: {
                    type: params?.type,
                }
            });

            return data?.map(({ name, id }) => ({ label: dataLang[name] || name, value: id }))
        },
        ...optionsQuery
    })
}

// ds chứng từ trong phiếu thu
export const useVoucherListPayPaySlip = (params, search) => {
    return useQuery({
        queryKey: ['api_voucher_list_combobox_payslip', { ...params }, search],
        queryFn: async () => {
            const result = await apiComons.apiVoucherListPaySlipCombobox({ params, data: search ?? undefined });
            return result?.map(({ code, id, money }) => ({
                label: code,
                value: id,
                money: money,
            }))
        },
        ...optionsQuery
    })
}

// ds chứng từ trong phiếu chi
export const useVoucherListVoucher = (params, search, isEnabled = true) => {
    return useQuery({
        queryKey: ['api_voucher_list_combobox_voucher', { ...params }, search],
        queryFn: async () => {
            const result = await apiComons.apiVoucherListVoucherCombobox({ params, data: search ?? undefined });

            return result?.map(({ code, id, money }) => ({
                label: code,
                value: id,
                money: money,
            }))
        },
        enabled: isEnabled,
        ...optionsQuery
    })
}

// loại chi phí trong phiếu chi
export const useCostComboboxByBranch = (params) => {
    return useQuery({
        queryKey: ['api_cost_combobox_by_branch', { ...params }],
        queryFn: async () => {
            const { rResult } = await apiComons.apiCostComboboxByBranch({ params });

            if (!params["filter[branch_id]"]) return []

            return rResult.map((x) => ({
                label: `${x.name}`,
                value: x.id,
                level: x.level,
                code: x.code,
                parent_id: x.parent_id,
            }))
        },
        // enabled: !!params["filter[branch_id]"],
        ...optionsQuery
    })
}