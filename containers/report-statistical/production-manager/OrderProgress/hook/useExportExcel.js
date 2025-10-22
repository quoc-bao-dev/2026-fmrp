import formatNumber from '@/utils/helpers/formatnumber';
import moment from 'moment';

export const useExportExcel = dataReportOrderProgress => {
  const totalQuantity = Array.isArray(dataReportOrderProgress)
    ? dataReportOrderProgress.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0)
    : 0;
  const totalProduced = Array.isArray(dataReportOrderProgress)
    ? dataReportOrderProgress.reduce((sum, item) => sum + (Number(item?.produced_quantity) || 0), 0)
    : 0;
  const totalDelivered = Array.isArray(dataReportOrderProgress)
    ? dataReportOrderProgress.reduce((sum, item) => sum + (Number(item?.delivered_quantity) || 0), 0)
    : 0;
  const totalPending = Array.isArray(dataReportOrderProgress)
    ? dataReportOrderProgress.reduce((sum, item) => sum + (Number(item?.pending_quantity) || 0), 0)
    : 0;

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
          title: 'Chi nhánh xưởng',
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
          title: 'Ngày hoàn thành sx',
          width: { wch: 20 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Ngày giao hàng đủ',
          width: { wch: 20 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Trạng thái',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
      ],
      data: [
        ...(dataReportOrderProgress?.map((item, index) => [
          { value: index + 1 },
          { value: item.order_date ? moment(item.order_date).format('DD/MM/YYYY') : '' },
          { value: item.order_number || '' },
          { value: item.branch_name || '' },
          { value: item.product_name || '' },
          { value: item.note || '' },
          { value: formatNumber(item.quantity) || '' },
          { value: item.required_date ? moment(item.required_date).format('DD/MM/YYYY') : '' },
          { value: formatNumber(item.produced_quantity) || '' },
          { value: formatNumber(item.delivered_quantity) || '' },
          { value: formatNumber(item.pending_quantity) || '' },
          { value: item.completion_date ? moment(item.completion_date).format('DD/MM/YYYY') : '' },
          { value: item.delivery_date ? moment(item.delivery_date).format('DD/MM/YYYY') : '' },
          { value: item.status || '' },
        ]) || []),
        // Dòng tổng cộng
        [
          { value: '' }, // STT
          { value: '' }, // Ngày đơn hàng
          { value: '' }, // Số đơn hàng
          { value: '' }, // Chi nhánh xưởng
          { value: 'Tổng cộng', style: { font: { bold: true } } }, // Tên sản phẩm (tiêu đề tổng)
          { value: '' }, // Ghi chú
          { value: formatNumber(totalQuantity), style: { font: { bold: true } } }, // Số lượng
          { value: '' }, // Ngày cần hàng
          { value: formatNumber(totalProduced), style: { font: { bold: true } } }, // SL sản xuất
          { value: formatNumber(totalDelivered), style: { font: { bold: true } } }, // SL đã giao
          { value: formatNumber(totalPending), style: { font: { bold: true } } }, // SL chưa giao
          { value: '' }, // Ngày hoàn thành sx
          { value: '' }, // Ngày giao hàng đủ
          { value: '' }, // Trạng thái
        ],
      ],
    },
  ];

  return { multiDataSet };
};
