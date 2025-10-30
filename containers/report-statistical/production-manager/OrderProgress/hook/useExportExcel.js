import moment from 'moment';

export const useExportExcel = dataReportOrderProgress => {
  const rows = Array.isArray(dataReportOrderProgress) ? dataReportOrderProgress : [];
  const totalQuantity = rows.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
  const totalProduced = rows.reduce((sum, item) => sum + (Number(item?.quantity_sx) || 0), 0);
  const totalFinished = rows.reduce((sum, item) => sum + (Number(item?.quantity_ht) || 0), 0);
  const totalDelivered = rows.reduce((sum, item) => sum + (Number(item?.quantity_delivery) || 0), 0);
  const totalPending = rows.reduce((sum, item) => sum + (Number(item?.quantity_not_delivery) || 0), 0);

  // Helper tạo ô số có định dạng ngăn cách hàng nghìn trong Excel
  const numberCell = value => ({ value: Number(value) || 0, style: { numFmt: '#,##0' } });

  const multiDataSet = [
    {
      columns: [
        {
          title: 'STT',
          width: { wch: 5 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Ngày đơn hàng',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Số đơn hàng',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Chi nhánh',
          width: { wch: 25 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Tên sản phẩm',
          width: { wch: 25 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Biến thể',
          width: { wch: 25 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Đơn vị tính',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Ghi chú',
          width: { wch: 25 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Số lượng',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Ngày cần hàng',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'SL sản xuất',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'SL đã hoàn thành sản xuất',
          width: { wch: 22 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'SL đã giao',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'SL chưa giao',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Ngày hoàn thành mới nhất',
          width: { wch: 20 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Ngày giao hàng mới nhất',
          width: { wch: 20 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Trạng thái sản xuất',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
      ],
      data: [
        ...(rows.map((item, index) => [
          { value: index + 1 },
          { value: item.date ? moment(item.date).format('DD/MM/YYYY') : '' },
          { value: item.reference_no || '' },
          { value: item.branch_name || '' },
          { value: item.item_name || '' },
          { value: item.item_variant_name || '' },
          { value: item.item_unit_name || '' },
          { value: item.note_item || '' },
          numberCell(item.quantity),
          { value: item.delivery_date ? moment(item.delivery_date).format('DD/MM/YYYY') : '' },
          numberCell(item.quantity_sx),
          numberCell(item.quantity_ht),
          numberCell(item.quantity_delivery),
          numberCell(item.quantity_not_delivery),
          { value: item.max_purchase_date ? moment(item.max_purchase_date).format('DD/MM/YYYY') : '' },
          { value: item.max_delivery_date ? moment(item.max_delivery_date).format('DD/MM/YYYY') : '' },
          { value: item.status_item_po_data?.name || '' },
        ]) || []),
        // Dòng tổng cộng
        [
          { value: '' }, // STT
          { value: '' }, // Ngày đơn hàng
          { value: '' }, // Số đơn hàng
          { value: '' }, // Chi nhánh xưởng
          { value: 'Tổng cộng', style: { font: { bold: true } } }, // Tên sản phẩm (tiêu đề tổng)
          { value: '' }, // Biến thể
          { value: '' }, // Đơn vị tính
          { value: '' }, // Ghi chú
          { value: totalQuantity, style: { font: { bold: true }, numFmt: '#,##0' } }, // Số lượng
          { value: '' }, // Ngày cần hàng
          { value: totalProduced, style: { font: { bold: true }, numFmt: '#,##0' } }, // SL sản xuất
          { value: totalFinished, style: { font: { bold: true }, numFmt: '#,##0' } }, // SL đã hoàn thành sản xuất
          { value: totalDelivered, style: { font: { bold: true }, numFmt: '#,##0' } }, // SL đã giao
          { value: totalPending, style: { font: { bold: true }, numFmt: '#,##0' } }, // SL chưa giao
          { value: '' }, // Ngày hoàn thành mới nhất
          { value: '' }, // Ngày giao hàng mới nhất
          { value: '' }, // Trạng thái sản xuất
        ],
      ],
    },
  ];

  return { multiDataSet };
};
