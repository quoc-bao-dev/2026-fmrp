export const useExportExcel = (dataExpiryWarning, options = {}) => {
    const {
        isWarehousePropertiesEnabled = false,
        warehousePropertyLabels: warehousePropertyLabelsInput = [],
    } = options

    const warehousePropertyLabels = Array.isArray(warehousePropertyLabelsInput)
        ? warehousePropertyLabelsInput
        : []

    const baseColumns = [
        {
            title: 'STT',
            width: { wch: 5 },
            style: {
                fill: { fgColor: { rgb: 'C7DFFB' } },
                font: { bold: true },
            },
        },
        {
            title: 'Mã hàng',
            width: { wch: 15 },
            style: {
                fill: { fgColor: { rgb: 'C7DFFB' } },
                font: { bold: true },
            },
        },
        {
            title: 'Tên hàng',
            width: { wch: 40 },
            style: {
                fill: { fgColor: { rgb: 'C7DFFB' } },
                font: { bold: true },
            },
        },
        {
            title: 'Loại',
            width: { wch: 10 },
            style: {
                fill: { fgColor: { rgb: 'C7DFFB' } },
                font: { bold: true },
            },
        },
        {
            title: 'Đơn vị tính',
            width: { wch: 12 },
            style: {
                fill: { fgColor: { rgb: 'C7DFFB' } },
                font: { bold: true },
            },
        },
        {
            title: 'Kho hàng',
            width: { wch: 20 },
            style: {
                fill: { fgColor: { rgb: 'C7DFFB' } },
                font: { bold: true },
            },
        },
        {
            title: 'Vị trí',
            width: { wch: 15 },
            style: {
                fill: { fgColor: { rgb: 'C7DFFB' } },
                font: { bold: true },
            },
        },
        {
            title: 'Lot',
            width: { wch: 15 },
            style: {
                fill: { fgColor: { rgb: 'C7DFFB' } },
                font: { bold: true },
            },
        },
        {
            title: 'Hạn sử dụng',
            width: { wch: 15 },
            style: {
                fill: { fgColor: { rgb: 'C7DFFB' } },
                font: { bold: true },
            },
        },
        {
            title: 'Ngày còn lại',
            width: { wch: 12 },
            style: {
                fill: { fgColor: { rgb: 'C7DFFB' } },
                font: { bold: true },
            },
        },
        {
            title: 'Số lượng',
            width: { wch: 12 },
            style: {
                fill: { fgColor: { rgb: 'C7DFFB' } },
                font: { bold: true },
            },
        },
        {
            title: 'Tình trạng',
            width: { wch: 15 },
            style: {
                fill: { fgColor: { rgb: 'C7DFFB' } },
                font: { bold: true },
            },
        },
    ]

    const multiDataSet = [
        {
            columns: [
                ...baseColumns,
            ],
            data: [
                ...(dataExpiryWarning?.data?.map((item, index) => [
                    ...[
                        // STT
                        { value: String(index + 1) },
                        // Mã hàng
                        { value: item.item_code || '' },
                        // Tên hàng + biến thể + thuộc tính kho (nằm trong cùng một ô)
                        {
                            value: (() => {
                                const lines = []

                                // Tên hàng
                                if (item.item_name) {
                                    lines.push(item.item_name)
                                }

                                // Biến thể
                                if (item.item_variation) {
                                    lines.push(item.item_variation)
                                }

                                // Thuộc tính kho – chỉ cho nguyên vật liệu
                                if (
                                    item.item_type === 'material' &&
                                    Array.isArray(warehousePropertyLabels) &&
                                    warehousePropertyLabels.length > 0
                                ) {
                                    warehousePropertyLabels.forEach(({ key, label }) => {
                                        if (!label) return
                                        const rawValue = item?.[key]

                                        // Logic giống UI:
                                        // - Bật thuộc tính kho: luôn hiển thị, không có giá trị thì '-'
                                        // - Tắt: chỉ hiển thị nếu có giá trị
                                        if (!isWarehousePropertiesEnabled && (rawValue == null || rawValue === '')) {
                                            return
                                        }

                                        const valueString =
                                            rawValue == null || rawValue === '' ? '-' : String(rawValue)

                                        lines.push(`${label}: ${valueString}`)
                                    })
                                }

                                return lines.join('\n')
                            })(),
                        },
                        // Loại
                        { value: item.item_type === 'material' ? 'NVL' : item.item_type === 'product' ? 'TP' : '' },
                        // Đơn vị tính
                        { value: item.unit_name || '' },
                        // Kho hàng
                        { value: item.warehouse_name || '' },
                        // Vị trí
                        { value: item.location || '' },
                        // Lot
                        { value: item.lot || '' },
                        // Hạn sử dụng
                        { value: item.expiry_date || '' },
                        // Ngày còn lại
                        {
                            value: item.days_remaining && item.days_remaining > 0 ? item.days_remaining : '-',
                            style: item.days_remaining && item.days_remaining > 0 ? { numFmt: '#,##0' } : {}
                        },
                        // Số lượng
                        {
                            value: Number(item.quantity || 0),
                            style: { numFmt: '#,##0' }
                        },
                        // Tình trạng
                        { value: item.status === 'expired' ? 'Hết hạn' : (item.status === 'expiring_soon' || item.status === 'expiring') ? 'Sắp hết hạn' : '' },
                    ],
                ]) || []),
            ]
        }
    ]

    return { multiDataSet }
}
