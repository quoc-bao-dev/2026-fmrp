import moment from 'moment'
import formatNumber from '@/utils/helpers/formatnumber'

export const useExportExcel = (dataReportImport) => {
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
          title: 'Ngày chứng từ',
          width: { wch: 20 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Mã chứng từ',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Nhà cung cấp',
          width: { wch: 30 },
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
          title: 'ĐVT',
          width: { wch: 10 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Vị trí',
          width: { wch: 20 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'SL',
          width: { wch: 10 },
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
          title: '%CK',
          width: { wch: 10 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Đơn giá SCK',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Thuế',
          width: { wch: 10 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Thành tiền',
          width: { wch: 20 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Ghi chú',
          width: { wch: 30 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: dataReportImport?.rResult?.map((item, index) => [
        { value: String(index + 1) },
        { value: item.date ? moment(item.date).format('DD/MM/YYYY HH:mm:ss') : '' },
        { value: item.code_import || '' },
        { value: item.name_supplier || '' },
        { value: item.item_code || '' },
        { value: item.item_name + (item.item_variation ? '\n' + item.item_variation : '') || '' },
        { value: item.unit_name || '' },
        { value: item.warehouse_name || '' },
        { value: item.quantity ? String(formatNumber(Number(item.quantity))) : '0' },
        { 
          value: item.price ? Number(item.price) : 0,
          style: { numFmt: '#,##0' }
        },
        { value: item.discount_percent ? String(item.discount_percent) + '%' : '0%' },
        { 
          value: item.price_after_discount ? Number(item.price_after_discount) : 0,
          style: { numFmt: '#,##0' }
        },
        { value: item.tax_rate ? String(item.tax_rate) + '%' : '0%' },
        { 
          value: item.amount ? Number(item.amount) : 0,
          style: { numFmt: '#,##0' }
        },
        { value: item.note || '' }
      ]) || []
    }
  ]

  return { multiDataSet }
} 