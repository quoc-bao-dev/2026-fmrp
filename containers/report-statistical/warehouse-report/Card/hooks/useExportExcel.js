export const useExportExcel = (displayedData, options = {}) => {
  const {
    isWarehousePropertiesEnabled = false,
    warehousePropertyLabels: warehousePropertyLabelsInput = [],
  } = options

  const warehousePropertyLabels = Array.isArray(warehousePropertyLabelsInput)
    ? warehousePropertyLabelsInput
    : []

  const multiDataSet = [
    {
      columns: [
        {
          title: 'STT',
          width: { wch: 5 },
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
          title: 'Ngày duyệt kho',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Ngày chứng từ',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Mã chứng từ',
          width: { wch: 20 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Diễn giải',
          width: { wch: 30 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Đơn giá',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Số lượng nhập',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Số lượng xuất',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Số lượng tồn lũy kế',
          width: { wch: 20 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: [
        ...(displayedData?.map((item, index) => {
          // Xác định màu nền dựa trên loại dòng
          const backgroundColor = item._rowType === 'opening' ? 'F3F6FF' : item._rowType === 'closing' ? 'E8FFF3' : '';
          const baseStyle = backgroundColor ? { fill: { fgColor: { rgb: backgroundColor } } } : {}

          // Giá trị cho cột Tên hàng: tên hàng + biến thể + thuộc tính kho (mỗi phần trên 1 dòng)
          const itemNameCellValue = (() => {
            const lines = []

            // Tên hàng (nếu có)
            if (item.item_name) {
              lines.push(item.item_name)
            }

            // Biến thể (nếu có)
            if (item.item_variation) {
              lines.push(item.item_variation)
            }

            // Thuộc tính kho (nếu có cấu hình label)
            if (Array.isArray(warehousePropertyLabels) && warehousePropertyLabels.length > 0) {
              warehousePropertyLabels.forEach(({ key, label }) => {
                if (!label) return
                const rawValue = item?.[key]

                // Nếu tắt thuộc tính kho và không có giá trị thì ẩn
                if (!isWarehousePropertiesEnabled && (rawValue == null || rawValue === '')) return

                const valueString = rawValue == null || rawValue === '' ? '-' : String(rawValue)
                lines.push(`${label}: ${valueString}`)
              })
            }

            return lines.join('\n')
          })()
          
          return [
            { 
              value: item._rowType ? '' : String(index),
              style: baseStyle
            },
            {
              value: itemNameCellValue,
              style: baseStyle,
            },
            {
              value: item._rowType ? (item._rowType === 'opening' ? 'Tồn đầu kỳ' : 'Tồn cuối kỳ') : item.warehouseman_date ? new Date(item.warehouseman_date).toLocaleDateString('vi-VN') : '',
              style: baseStyle,
            },
            {
              value: item.document_date ? new Date(item.document_date).toLocaleDateString('vi-VN') : '',
              style: baseStyle,
            },
            { 
              value: item.document_code || '',
              style: baseStyle,
            },
            {
              value: item._rowType ? '' : item.document_type || '',
              style: baseStyle,
            },
            {
              value: item._rowType === 'opening' ? '' : Number(item.price || 0),
              style: { 
                numFmt: '#,##0',
                ...baseStyle,
              },
            },
            {
              value: item._rowType ? '' : Number(item.in_qty || 0),
              style: { 
                numFmt: '#,##0',
                ...baseStyle,
              },
            },
            {
              value: item._rowType ? '' : Number(item.out_qty || 0),
              style: { 
                numFmt: '#,##0',
                ...baseStyle,
              },
            },
            {
              value: Number(item.closing_qty || 0),
              style: { 
                numFmt: '#,##0',
                ...baseStyle,
              },
            },
          ];
        }) || []),
      ],
    },
  ];

  return { multiDataSet };
};
