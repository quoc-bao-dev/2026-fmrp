import moment from 'moment';
import * as XLSX from 'xlsx-js-style';

export const exportOrderTracking = (rawData = [], rTotal = {}, filename = 'Theo_dõi_đơn_đặt_hàng.xlsx') => {
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
          width: { wch: 18 },
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
          width: { wch: 30 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Biến thể',
          width: { wch: 20 },
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
          title: 'Số lượng',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Số lượng đã nhập',
          width: { wch: 18 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Số lượng còn lại',
          width: { wch: 18 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: rawData.map((item, index) => [
        { value: String(index + 1) },
        { value: item.date ? moment(item.date).format('DD/MM/YYYY HH:mm:ss') : '' },
        { value: item.code_purchase_order || '' },
        { value: item.item_code || '' },
        { value: item.item_name || '' },
        { value: item.item_variation || '' },
        { value: item.unit_name || '' },
        { 
          value: item.quantity ? Number(item.quantity) : 0,
          style: { numFmt: '#,##0' }
        },
        { 
          value: item.quantity_import ? Number(item.quantity_import) : 0,
          style: { numFmt: '#,##0' }
        },
        { 
          value: item.quantity_left ? Number(item.quantity_left) : 0,
          style: { numFmt: '#,##0' }
        },
      ]) || []
    }
  ];

  // Lấy tổng cộng từ rTotal
  const totalQuantity = Number(rTotal?.total_quantity) || 0;
  const totalQuantityImport = Number(rTotal?.total_quantity_import) || 0;
  const totalQuantityLeft = Number(rTotal?.total_quantity_left) || 0;

  // Thêm dòng tổng cộng
  if (multiDataSet[0].data.length > 0) {
    multiDataSet[0].data.push([
      { value: '' },
      { value: 'Tổng cộng' },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: '' },
      { 
        value: totalQuantity,
        style: { numFmt: '#,##0', font: { bold: true } }
      },
      { 
        value: totalQuantityImport,
        style: { numFmt: '#,##0', font: { bold: true } }
      },
      { 
        value: totalQuantityLeft,
        style: { numFmt: '#,##0', font: { bold: true } }
      },
    ]);
  }

  // Export Excel
  const wb = XLSX.utils.book_new();
  
  multiDataSet.forEach((dataSet, sheetIndex) => {
    const ws = XLSX.utils.aoa_to_sheet([
      dataSet.columns.map(col => col.title),
      ...dataSet.data.map(row => row.map(cell => cell.value))
    ]);

    // Set độ rộng cột
    ws['!cols'] = dataSet.columns.map(col => col.width);

    // Style header
    dataSet.columns.forEach((col, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      ws[cellRef].s = col.style;
    });

    // Style dữ liệu
    dataSet.data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
        if (cell.style) {
          ws[cellRef].s = cell.style;
        }
        if (cell.style?.numFmt) {
          ws[cellRef].t = 'n';
        }
      });
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Theo dõi đơn đặt hàng');
  });

  XLSX.writeFile(wb, filename);
};

export const exportExpenseDetailExcel = (rawData = [], filename = 'Chi_tiet_chi_phi.xlsx') => {
  if (!Array.isArray(rawData) || rawData.length === 0) return;

  const wb = XLSX.utils.book_new();

  const headers = [
    'STT',
    'Ngày chứng từ',
    'Danh sách chứng từ',
    'Chi nhánh',
    'Nhân viên lập phiếu',
    'Nội dung',
    'Giá trị',
  ];

  const dataRows = rawData.map((row, index) => [
    index + 1,
    row?.date ? moment(row.date).format('DD/MM/YYYY HH:mm:ss') : '',
    row?.code || '',
    row?.branch_name || '',
    row?.staff_name || '',
    row?.note || '',
    Number(row?.total || 0),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
    { wch: 22 },
    { wch: 40 },
    { wch: 16 },
  ];

  // Style header
  headers.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    if (!ws[cellRef]) return;
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      fill: { fgColor: { rgb: '0F4F9E' } },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };
  });

  // Style body
  dataRows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
      if (!ws[cellRef]) return;

      ws[cellRef].s = {
        alignment: {
          horizontal: colIndex === 6 ? 'right' : colIndex === 0 ? 'center' : 'left',
          vertical: 'middle',
          wrapText: true,
        },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
      };

      if (colIndex === 6) {
        ws[cellRef].t = 'n';
        ws[cellRef].s.numFmt = '#,##0';
      }
    });
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Chi tiết chi phí');
  XLSX.writeFile(wb, filename);
};

