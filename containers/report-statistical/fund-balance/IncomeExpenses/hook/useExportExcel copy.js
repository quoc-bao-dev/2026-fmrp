import moment from 'moment';
import * as XLSX from 'xlsx-js-style';

export const exportWithMergeSalesRevenue = (rawData = [], filename = 'Theo_dõi_đơn_đặt_hàng.xlsx') => {
  // Chuẩn hóa dữ liệu
  const rows = [];
  const groups = [];
  let currentRow = 0;

  // Nhóm dữ liệu theo đơn đặt hàng để merge cells
  const orderGroups = {};
  rawData.forEach((item, index) => {
    const orderId = item?.purchase_order_id || item?.code_purchase_order || `order_${index}`;
    if (!orderGroups[orderId]) {
      orderGroups[orderId] = {
        order: item,
        items: []
      };
    }
    orderGroups[orderId].items.push(item);
  });

  // Tạo rows và groups
  Object.values(orderGroups).forEach((group, groupIndex) => {
    const start = currentRow;
    group.items.forEach((item, itemIndex) => {
      rows.push({
        stt: groupIndex + 1,
        date: item?.date || '',
        code_purchase_order: item?.code_purchase_order || '',
        item_code: item?.item_code || '',
        item_name: item?.item_name || '',
        item_variation: item?.item_variation || '',
        unit_name: item?.unit_name || '',
        quantity: Number(item?.quantity) || 0,
        quantity_import: Number(item?.quantity_import) || 0,
        quantity_left: Number(item?.quantity_left) || 0,
        isFirstItem: itemIndex === 0,
        totalItems: group.items.length
      });
      currentRow += 1;
    });
    const end = currentRow - 1;
    if (end >= start) {
      groups.push({ start, end });
    }
  });

  // Header
  const headerRow = [
    'STT',
    'Ngày chứng từ',
    'Mã chứng từ',
    'Mã hàng',
    'Tên hàng',
    'Biến thể',
    'ĐVT',
    'Số lượng',
    'Số lượng đã nhập',
    'Số lượng còn lại'
  ];

  // Tạo dữ liệu cho worksheet
  const wsData = rows.map((item) => [
    item.stt,
    item.date ? moment(item.date).format('DD/MM/YYYY HH:mm:ss') : '',
    item.code_purchase_order,
    item.item_code,
    item.item_name,
    item.item_variation,
    item.unit_name,
    item.quantity,
    item.quantity_import,
    item.quantity_left
  ]);

  // Tính tổng cộng
  const totalQuantity = rows.reduce((sum, item) => sum + item.quantity, 0);
  const totalQuantityImport = rows.reduce((sum, item) => sum + item.quantity_import, 0);
  const totalQuantityLeft = rows.reduce((sum, item) => sum + item.quantity_left, 0);

  const totalRow = [
    '',
    'Tổng cộng',
    '',
    '',
    '',
    '',
    '',
    totalQuantity,
    totalQuantityImport,
    totalQuantityLeft
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headerRow, ...wsData, totalRow]);

  // Style cơ bản cho toàn sheet
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = 0; R <= range.e.r; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      ws[cellRef] = ws[cellRef] || { v: '' };
      ws[cellRef].s = ws[cellRef].s || { 
        font: { sz: 11 }, 
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
        alignment: { horizontal: 'left', vertical: 'middle' }
      };
    }
  }

  // Style header
  for (let C = 0; C < headerRow.length; C++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: '#0284c7' }, sz: 12 },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
      fill: { fgColor: { rgb: 'F0F8FF' } },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
    };
  }

  // Merge cells cho các cột được gộp (STT, Ngày chứng từ, Mã chứng từ)
  ws['!merges'] = ws['!merges'] || [];
  groups.forEach(g => {
    if (g.end > g.start) {
      const startRow = g.start + 1; // +1 vì có 1 hàng header
      const endRow = g.end + 1;
      [0, 1, 2].forEach(colIndex => { // STT, Ngày chứng từ, Mã chứng từ
        ws['!merges'].push({ s: { r: startRow, c: colIndex }, e: { r: endRow, c: colIndex } });
      });
    }
  });

  // Format số cho các cột số lượng
  const numberCols = [7, 8, 9]; // Số lượng, Số lượng đã nhập, Số lượng còn lại
  
  for (let r = 1; r <= rows.length; r++) { // +1 vì có 1 hàng header
    numberCols.forEach(c => {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (ws[ref] && ws[ref].v !== '') {
        ws[ref].t = 'n';
        ws[ref].s = { ...(ws[ref].s || {}), numFmt: '#,##0', alignment: { horizontal: 'right', vertical: 'middle' } };
      }
    });
  }

  // Style dòng tổng cộng
  const totalRowIndex = rows.length + 1; // +1 vì có 1 hàng header
  for (let c = 0; c < headerRow.length; c++) {
    const ref = XLSX.utils.encode_cell({ r: totalRowIndex, c });
    if (ws[ref]) {
      ws[ref].s = {
        ...(ws[ref].s || {}),
        font: { bold: true },
        fill: { fgColor: { rgb: 'E6F3FF' } },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
        alignment: { horizontal: c === 1 ? 'left' : c >= 7 ? 'right' : 'center', vertical: 'middle' }
      };
      if (numberCols.includes(c) && ws[ref].v !== '') {
        ws[ref].t = 'n';
        ws[ref].s.numFmt = '#,##0';
      }
    }
  }

  // Set độ rộng cột
  ws['!cols'] = headerRow.map((title, index) => {
    let width = 15;
    if (index === 0) width = 8; // STT
    else if (index === 1) width = 20; // Ngày chứng từ
    else if (index === 2) width = 18; // Mã chứng từ
    else if (index === 3) width = 15; // Mã hàng
    else if (index === 4) width = 30; // Tên hàng
    else if (index === 5) width = 20; // Biến thể
    else if (index === 6) width = 10; // ĐVT
    else width = 18; // Các cột số lượng
    return { wch: width };
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Theo dõi đơn đặt hàng');
  XLSX.writeFile(wb, filename);
};
