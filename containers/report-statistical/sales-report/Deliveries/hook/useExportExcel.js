import * as XLSX from 'xlsx-js-style';

export const exportWithMergeSalesRevenue = (rawData = [], filename = 'Bao_cao_giao_hang.xlsx') => {
  // Chuẩn hóa dữ liệu từ flattenedData 
  const rows = [];
  const groups = [];
  let currentRow = 0;
  let orderStt = 1;

  // Nhóm dữ liệu theo delivery_id để merge cells
  const orderGroups = {};
  rawData.forEach((item) => {
    const orderId = item?.delivery_id || `order_${currentRow}`;
    if (!orderGroups[orderId]) {
      orderGroups[orderId] = {
        order: item,
        items: []
      };
    }
    orderGroups[orderId].items.push(item);
  });

  // Tạo rows và groups
  let groupStt = 1;
  Object.values(orderGroups).forEach((group) => {
    const start = currentRow;
    let isFirstRow = true;
    group.items.forEach((item, itemIndex) => {
      // STT chỉ hiển thị ở dòng đầu tiên của mỗi order, các dòng còn lại là empty
      const displayStt = isFirstRow ? groupStt : '';
      rows.push({
        rowStt: displayStt,
        delivery_date: item?.delivery_date || '',
        reference_no: item?.reference_no || '',
        customer_name: item?.customer_name || '',
        address_delivery: item?.address_delivery || '',
        employee_name: item?.employee_name || '',
        item_code: item?.item_code || '',
        item_name: item?.item_name || '',
        unit_name: item?.unit_name || '',
        quantity: Number(item?.quantity) || 0,
        price: Number(item?.price) || 0,
        amount: Number(item?.amount) || 0,
        isFirstItem: itemIndex === 0,
        totalItems: group.items.length,
        deliveryId: group.order?.delivery_id
      });
      currentRow += 1;
      isFirstRow = false;
    });
    groupStt++;
    const end = currentRow - 1;
    if (end >= start) {
      groups.push({ start, end });
    }
  });

  // Header đơn giản - phù hợp với bảng báo cáo giao hàng
  const headers = [
    'STT',
    'Ngày giao hàng',
    'Số giao hàng',
    'Khách hàng',
    'Địa chỉ giao',
    'Nhân viên phụ trách',
    'Mã hàng',
    'Tên hàng',
    'ĐVT',
    'Số lượng',
    'Giá',
    'Thành tiền'
  ];

  const wsData = rows.map((item) => [
    item.rowStt,
    item.delivery_date || '',
    item.reference_no || '',
    item.customer_name || '',
    item.address_delivery || '',
    item.employee_name || '',
    item.item_code || '',
    item.item_name || '',
    item.unit_name || '',
    item.quantity,
    item.price,
    item.amount
  ]);

  // Tính tổng cộng
  const totalQuantity = rows.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = rows.reduce((sum, item) => sum + item.amount, 0);

  const totalRow = [
    '',
    '',
    '',
    'Tổng cộng',
    '',
    '',
    '',
    '',
    '',
    totalQuantity,
    '',
    totalAmount
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...wsData, totalRow]);

  // Style header
  for (let C = 0; C < headers.length; C++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: '#0284c7' }, sz: 12 },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
        fill: { fgColor: { rgb: 'F0F8FF' } },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
    }
  }

  // Merge cells cho các cột được gộp (STT, Ngày giao hàng, Số giao hàng, Khách hàng, Địa chỉ giao, Nhân viên phụ trách)
  ws['!merges'] = ws['!merges'] || [];
  groups.forEach(g => {
    if (g.end > g.start) {
      const startRow = g.start + 1; // +1 vì có 1 hàng header
      const endRow = g.end + 1;
      // Merge các cột: STT (0), Ngày giao hàng (1), Số giao hàng (2), Khách hàng (3), Địa chỉ giao (4), Nhân viên phụ trách (5)
      [0, 1, 2, 3, 4, 5].forEach(colIndex => {
        ws['!merges'].push({ s: { r: startRow, c: colIndex }, e: { r: endRow, c: colIndex } });
      });
    }
  });

  // Format số cho các cột số: STT (0), Số lượng (9), Giá (10), Thành tiền (11)
  const numberCols = [0, 9, 10, 11]; 
  
  for (let r = 1; r <= rows.length; r++) { // +1 vì có 1 hàng header
    numberCols.forEach(c => {
      const ref = XLSX.utils.encode_cell({ r, c });
      // Cột STT (0): Chỉ format nếu là số và không phải chuỗi rỗng
      if (ws[ref] && ws[ref].v !== '' && typeof ws[ref].v === 'number') {
        ws[ref].t = 'n';
        // Giữ lại border và style hiện tại
        ws[ref].s = { 
          ...(ws[ref].s || {}),
          border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
          numFmt: c === 0 ? '0' : '#,##0' // STT không có dấu phẩy, các cột khác có
        };
      }
    });
  }

  // Style dòng tổng cộng
  const totalRowIndex = rows.length + 1; // +1 vì có 1 hàng header
  for (let c = 0; c < headers.length; c++) {
    const ref = XLSX.utils.encode_cell({ r: totalRowIndex, c });
    if (ws[ref]) {
      ws[ref].s = {
        ...(ws[ref].s || {}),
        font: { bold: true },
        fill: { fgColor: { rgb: 'E6F3FF' } },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      };
      // Format số cho dòng tổng cộng
      if (numberCols.includes(c) && ws[ref].v !== '' && typeof ws[ref].v === 'number') {
        ws[ref].t = 'n';
        ws[ref].s.numFmt = '#,##0';
      }
    }
  }

  // Style cơ bản cho toàn sheet
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = 0; R <= range.e.r; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      ws[cellRef] = ws[cellRef] || { v: '' };
      
      // Cột STT (index 0) căn giữa
      const alignment = C === 0 ? { horizontal: 'center', vertical: 'middle' } : { horizontal: 'left', vertical: 'middle', wrapText: true };
      
      // Nếu ô chưa có style hoặc chưa có border, thêm border
      if (!ws[cellRef].s || !ws[cellRef].s.border) {
        ws[cellRef].s = ws[cellRef].s || {};
        ws[cellRef].s.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      }
      
      // Đảm bảo có font và alignment
      if (!ws[cellRef].s.font) {
        ws[cellRef].s.font = { sz: 11 };
      }
      if (!ws[cellRef].s.alignment) {
        ws[cellRef].s.alignment = alignment;
      }
    }
  }

  // Set độ rộng cột
  ws['!cols'] = headers.map((title, index) => {
    let width = 15;
    if (index === 0) width = 8; // STT
    else if (index === 1) width = 18; // Ngày giao hàng
    else if (index === 2) width = 18; // Số giao hàng
    else if (index === 3) width = 25; // Khách hàng
    else if (index === 4) width = 30; // Địa chỉ giao
    else if (index === 5) width = 20; // Nhân viên phụ trách
    else if (index === 6) width = 15; // Mã hàng
    else if (index === 7) width = 30; // Tên hàng
    else if (index === 8) width = 10; // ĐVT
    else if (index === 9) width = 12; // Số lượng
    else if (index === 10) width = 15; // Giá
    else if (index === 11) width = 15; // Thành tiền
    return { wch: width };
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo giao hàng');
  XLSX.writeFile(wb, filename);
};
