import formatNumber from '@/utils/helpers/formatnumber'
import moment from 'moment'

export const useExportExcelDetail = (detailItems, type = 'import') => {
  const isImport = type === 'import'
  const quantityLabel = isImport ? 'Số lượng nhập' : 'Số lượng xuất'

  // Kiểm tra an toàn cho detailItems
  if (!detailItems) {
    return { multiDataSet: [] }
  }

  const multiDataSet = [
    // Sheet thông tin sản phẩm (không có columns)
    {
      columns: [
        {
          title: '',
          width: { wch: 5 },
        },
        {
          title: '',
          width: { wch: 5 },
        },
        {
          title: '',
          width: { wch: 5 },
        },
        {
          title: '',
          width: { wch: 5 },
        },
        {
          title: '',
          width: { wch: 5 },
        },
      ],
      data: [
        // Thông tin sản phẩm
        [
          { value: 'Mã mặt hàng:', style: { font: { bold: true } } },
          { value: detailItems?.summary?.code || '' },
          { value: '' },
          { value: '' },
          { value: '' },
          { value: '' },
        ],
        [
          { value: 'Tên mặt hàng:', style: { font: { bold: true } } },
          { value: detailItems?.summary?.name || '' },
          { value: '' },
          { value: '' },
          { value: '' },
          { value: '' },
        ],
        [
          { value: 'Phân loại:', style: { font: { bold: true } } },
          { value: detailItems?.summary?.item_variation || '' },
          { value: '' },
          { value: '' },
          { value: '' },
          { value: '' },
        ],
        [
          { value: 'Đơn vị tính:', style: { font: { bold: true } } },
          { value: detailItems?.summary?.unit || '' },
          { value: '' },
          { value: '' },
          { value: '' },
          { value: '' },
        ],
        [
          { value: 'Tổng số lượng:', style: { font: { bold: true } } },
          {
            value:
              detailItems?.summary?.total_quantity && !isNaN(detailItems.summary.total_quantity)
                ? formatNumber(Number(detailItems.summary.total_quantity))
                : '0',
          },
          { value: '' },
          { value: '' },
          { value: '' },
          { value: '' },
        ],
        [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }],
      ],
    },
    // Sheet dữ liệu chi tiết (có columns)
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
          title: 'Ngày duyệt kho',
          width: { wch: 18 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Ngày chứng từ',
          width: { wch: 18 },
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
          title: 'Diễn giải',
          width: { wch: 25 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: quantityLabel,
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: [
        // Dữ liệu chi tiết
        ...(detailItems?.data && Array.isArray(detailItems.data) && detailItems.data.length > 0
          ? detailItems.data.map((item, index) => {
              if (!item)
                return [
                  { value: String(index + 1) },
                  { value: '' },
                  { value: '' },
                  { value: '' },
                  { value: '' },
                  { value: '0' },
                ]

              return [
                { value: String(index + 1) },
                {
                  value: item.document_date_warehouse
                    ? moment(item.document_date_warehouse).format('DD/MM/YYYY HH:mm:ss')
                    : '',
                },
                { value: item.document_date ? moment(item.document_date).format('DD/MM/YYYY HH:mm:ss') : '' },
                { value: item.document_code || '' },
                { value: item.document_type || '' },
                { value: item.quantity && !isNaN(item.quantity) ? formatNumber(Number(item.quantity)) : '0' },
              ]
            })
          : []),
        // Dòng tổng cộng
        [
          { value: '' },
          { value: '' },
          { value: '' },
          { value: '' },
          { value: 'Tổng cộng', style: { font: { bold: true } } },
          {
            value:
              detailItems?.summary?.total_quantity && !isNaN(detailItems.summary.total_quantity)
                ? formatNumber(Number(detailItems.summary.total_quantity))
                : '0',
            style: { font: { bold: true } },
          },
        ],
      ],
    },
  ]

  return { multiDataSet }
}
