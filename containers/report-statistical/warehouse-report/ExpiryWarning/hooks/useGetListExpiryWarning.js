import apiReport from '@/Api/apiReport-Statistical/apiReport'
import { useQuery } from '@tanstack/react-query'

export const useGetListExpiryWarning = (data) => {
    const normalizeRows = (rows = []) => {
        return rows.map(item => ({
            ...item,
            // Map về field dùng ở UI hiện tại
            item_type: item?.type_items || item?.item_type || '',
            quantity: Number(item?.quantity_left || 0),
            warehouse_name: item?.warehouse_name || '',
            location: item?.location_name || '',
            lot: item?.lot || '',
            expiry_date: item?.expiration_date || '',
            days_remaining: item?.days_left !== undefined && item?.days_left !== null ? Number(item.days_left) : null,
            status: item?.expiration_status === 'expiring_soon' ? 'expiring' : (item?.expiration_status || null),
        }))
    }

    const applyClientFilters = (rows = []) => {
        const { filter = {}, search = '' } = data || {}
        let filtered = [...rows]

        if (filter?.type_items) {
            filtered = filtered.filter(item => item.item_type === filter.type_items)
        }

        if (filter?.status) {
            filtered = filtered.filter(item => item.status === filter.status)
        }

        if (search) {
            const keyword = search.toLowerCase()
            filtered = filtered.filter(
                item =>
                    item.item_code?.toLowerCase().includes(keyword) ||
                    item.item_name?.toLowerCase().includes(keyword) ||
                    item.item_variation?.toLowerCase().includes(keyword)
            )
        }

        return filtered
    }

    return useQuery({
        queryKey: ['api_get_list_expiry_warning', data],
        queryFn: async () => {
            const filter = data?.filter || {}

            const params = {
                page: data?.page || 1,
                limit: data?.limit || 15,
                search: data?.search || '',
            }

            if (filter.status) {
                params['filter[status]'] = filter.status
            }

            if (filter.type_items) {
                params['filter[type_items]'] = filter.type_items
            }

            if (Array.isArray(filter.branch_ids) && filter.branch_ids.length > 0) {
                filter.branch_ids.forEach((branchId, index) => {
                    params[`filter[branch_ids][${index}]`] = branchId
                })
            }

            const response = await apiReport.apiGetLimitUserDateReport(params)

            const normalized = normalizeRows(response?.data || [])
            const filtered = applyClientFilters(normalized)

            return {
                ...response,
                data: filtered,
                recordsFiltered: filtered.length,
            }
        },
        enabled: true,
        staleTime: 5 * 60 * 1000, // 5 phút
        cacheTime: 10 * 60 * 1000, // 10 phút
    })
}
