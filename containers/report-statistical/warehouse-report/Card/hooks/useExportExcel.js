
export const useExportExcel = (dataReportStock) => {
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
          title: 'Mã mặt hàng',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Mặt hàng',
          width: { wch: 40 },
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
          title: 'SL Tồn đầu kỳ',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'GT Tồn đầu kỳ',
          width: { wch: 18 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'SL Nhập kho',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'GT Nhập kho',
          width: { wch: 18 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'SL Xuất kho',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'GT Xuất kho',
          width: { wch: 18 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'SL Tồn cuối kỳ',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'GT Tồn cuối kỳ',
          width: { wch: 18 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: [
        ...(dataReportStock?.data?.map((item, index) => [
          { value: String(index + 1) },
          { value: item.item_code || '' },
          { value: item.item_name + (item.item_variation ? '\n' + item.item_variation : '') || '' },
          { value: item.unit_name || '' },
          { 
            value: Number(item.opening_qty) === 0 ? 0 : Number(Math.abs(item.opening_qty || 0)),
            style: { numFmt: '#,##0' }
          },
          { 
            value: Number(item.opening_value || 0),
            style: { numFmt: '#,##0' }
          },
          { 
            value: Number(item.in_qty || 0),
            style: { numFmt: '#,##0' }
          },
          { 
            value: Number(item.in_value || 0),
            style: { numFmt: '#,##0' }
          },
          { 
            value: Number(item.out_qty || 0),
            style: { numFmt: '#,##0' }
          },
          { 
            value: Number(item.out_value || 0),
            style: { numFmt: '#,##0' }
          },
          { 
            value: Number(item.closing_qty || 0),
            style: { numFmt: '#,##0' }
          },
          { 
            value: Number(item.closing_value || 0),
            style: { numFmt: '#,##0' }
          },
        ]) || []),
        // Dòng tổng cộng
        [
          { value: '' },
          { value: '' },
          { value: '' },
          { value: 'Tổng cộng', style: { font: { bold: true } } },
          { 
            value: Number(dataReportStock?.rTotal?.opening_qty || 0),
            style: { numFmt: '#,##0', font: { bold: true } }
          },
          { 
            value: Number(dataReportStock?.rTotal?.opening_value || 0),
            style: { numFmt: '#,##0', font: { bold: true } }
          },
          { 
            value: Number(dataReportStock?.rTotal?.in_qty || 0),
            style: { numFmt: '#,##0', font: { bold: true } }
          },
          { 
            value: Number(dataReportStock?.rTotal?.in_value || 0),
            style: { numFmt: '#,##0', font: { bold: true } }
          },
          { 
            value: Number(dataReportStock?.rTotal?.out_qty || 0),
            style: { numFmt: '#,##0', font: { bold: true } }
          },
          { 
            value: Number(dataReportStock?.rTotal?.out_value || 0),
            style: { numFmt: '#,##0', font: { bold: true } }
          },
          { 
            value: Number(dataReportStock?.rTotal?.closing_qty || 0),
            style: { numFmt: '#,##0', font: { bold: true } }
          },
          { 
            value: Number(dataReportStock?.rTotal?.closing_value || 0),
            style: { numFmt: '#,##0', font: { bold: true } }
          },
        ]
      ]
    }
  ]

  return { multiDataSet }
} 