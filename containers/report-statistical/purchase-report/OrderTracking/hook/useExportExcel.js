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
