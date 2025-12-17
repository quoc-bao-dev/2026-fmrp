import moment from 'moment';
import * as XLSX from 'xlsx-js-style';

// Xuất Excel cho Nhật ký thu - chi
export const exportIncomeExpenses = (rawData = [], rTotal = {}, filename = 'Nhat_ky_thu_chi.xlsx', dataLang = {}) => {
  // Cột hiển thị
  const columns = [
    { title: 'STT', width: { wch: 6 } },
    { title: 'Ngày', width: { wch: 20 } },
    { title: 'Số chứng từ', width: { wch: 20 } },
    { title: 'PTTT', width: { wch: 18 } },
    { title: 'Loại đối tượng', width: { wch: 18 } },
    { title: 'Mã đối tượng', width: { wch: 20 } },
    { title: 'Đối tượng', width: { wch: 28 } },
    { title: 'Danh sách chứng từ', width: { wch: 30 } },
    { title: 'Nhân viên', width: { wch: 22 } },
    { title: 'Chi nhánh', width: { wch: 22 } },
    { title: 'Nội dung', width: { wch: 28 } },
    { title: 'Thu', width: { wch: 18 } },
    { title: 'Chi', width: { wch: 18 } },
  ];

  // Header style
  const headerStyle = {
    fill: { fgColor: { rgb: 'C7DFFB' } },
    font: { bold: true },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  // Helper parse total (rTotal có thể trả string kèm dấu phẩy)
  const parseNumber = val => {
    if (val === null || val === undefined) return 0;
    const num = Number(String(val).replace(/,/g, ''));
    return Number.isNaN(num) ? 0 : num;
  };

  const dataset = rawData?.map((item, index) => {
    const voucherList = item?.voucher?.map(v => v.code).join(', ') || '';
    const objectType = dataLang?.[item?.objects] || item?.objects || '';
    const thu = Number(item?.thu) || 0;
    const chi = Number(item?.chi) || 0;

    return [
      { value: index + 1 },
      { value: item?.date ? moment(item.date).format('DD/MM/YYYY HH:mm:ss') : '' },
      { value: item?.code || '' },
      { value: item?.payment_mode_name || '' },
      { value: objectType },
      { value: item?.object_code || '' },
      { value: item?.object_text || '' },
      { value: voucherList },
      { value: item?.staff_name || '' },
      { value: item?.branch_name || '' },
      { value: item?.note || '' },
      { value: thu, style: { numFmt: '#,##0' } },
      { value: chi, style: { numFmt: '#,##0' } },
    ];
  }) || [];

  // Tổng cộng
  const totalThu = parseNumber(rTotal?.thu);
  const totalChi = parseNumber(rTotal?.chi);

  if (dataset.length > 0) {
    dataset.push([
      { value: '' },
      { value: 'Tổng cộng', style: { font: { bold: true } } },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: totalThu, style: { numFmt: '#,##0', font: { bold: true } } },
      { value: totalChi, style: { numFmt: '#,##0', font: { bold: true } } },
    ]);
  }

  // Tạo workbook / worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    columns.map(col => col.title),
    ...dataset.map(row => row.map(cell => cell.value)),
  ]);

  // Set chiều rộng cột
  ws['!cols'] = columns.map(col => col.width);

  // Style header
  columns.forEach((_col, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    if (ws[cellRef]) {
      ws[cellRef].s = headerStyle;
    }
  });

  // Style dữ liệu
  dataset.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
      if (!ws[cellRef]) return;
      if (cell.style) ws[cellRef].s = cell.style;
      if (cell.style?.numFmt) ws[cellRef].t = 'n';
    });
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Nhat_ky_thu_chi');
  XLSX.writeFile(wb, filename);
};
