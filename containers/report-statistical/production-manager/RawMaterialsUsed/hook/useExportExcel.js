import formatNumber from '@/utils/helpers/formatnumber';
import moment from 'moment';

export const useExportExcel = dataReportMaterialUsed => {
  const totalOutput = Array.isArray(dataReportMaterialUsed)
    ? dataReportMaterialUsed.reduce((sum, item) => sum + (Number(item?.output_quantity) || 0), 0)
    : 0;
  const totalReturn = Array.isArray(dataReportMaterialUsed)
    ? dataReportMaterialUsed.reduce((sum, item) => sum + (Number(item?.return_quantity) || 0), 0)
    : 0;
  const totalUsed = Array.isArray(dataReportMaterialUsed)
    ? dataReportMaterialUsed.reduce((sum, item) => sum + (Number(item?.used_quantity) || 0), 0)
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
          title: 'Đơn hàng bán/ Kế hoạch nội bộ',
          width: { wch: 25 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Ghi chú đơn hàng',
          width: { wch: 25 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Số lệnh SX chi tiết',
          width: { wch: 20 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Ngày',
          width: { wch: 30 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Mã NVL',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Tên NVL',
          width: { wch: 20 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Loại',
          width: { wch: 20 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Đơn vị',
          width: { wch: 20 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'SL đầu ra',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'SL nhập lại',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'SL đã sử dụng',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
      ],
      data: [
        ...(dataReportMaterialUsed?.map((item, index) => [
          { value: index + 1 },
          { value: item.order_number },
          { value: item.order_note },
          { value: item.production_order },
          { value: item.date ? moment(item.date).format('DD/MM/YYYY') : '' },
          { value: item.material_code },
          { value: item.material_name },
          { value: item.material_type || '' },
          { value: item.unit_name || '' },
          { value: item.output_quantity ? String(formatNumber(Number(item.output_quantity))) : '0' },
          { value: item.return_quantity ? String(formatNumber(Number(item.return_quantity))) : '0' },
          { value: item.used_quantity ? String(formatNumber(Number(item.used_quantity))) : '0' },
        ]) || []),
        // Dòng tổng cộng
        [
          { value: '' }, // STT
          { value: '' }, // Đơn hàng bán/ Kế hoạch nội bộ
          { value: '' }, // Ghi chú đơn hàng
          { value: '' }, // Số lệnh SX chi tiết
          { value: '' }, // Ngày
          { value: '' }, // Mã NVL
          { value: 'Tổng cộng', style: { font: { bold: true } } }, // Tên NVL
          { value: '' }, // Loại
          { value: '' }, // Đơn vị
          { value: String(formatNumber(totalOutput)), style: { font: { bold: true } } }, // SL đầu ra
          { value: String(formatNumber(totalReturn)), style: { font: { bold: true } } }, // SL nhập lại
          { value: String(formatNumber(totalUsed)), style: { font: { bold: true } } }, // SL đã sử dụng
        ],
      ],
    },
  ];

  return { multiDataSet };
};
