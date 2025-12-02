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
        branch_name: item?.branch_name || '',
        employee_name: item?.employee_name || '',
        item_code: item?.item_code || '',
        item_name: item?.item_name || '',
        variant_name: item?.variant_name || '',
        unit_name: item?.unit_name || '',
        quantity: Number(item?.quantity) || 0,
        price: Number(item?.price) || 0,
        discount_percent_item: item?.discount_percent_item ?? '',
        tax_rate_item: item?.tax_rate_item ?? '',
        total_amount: Number(item?.total_amount) || 0,
        grand_total: Number(group.order?.grand_total) || 0,
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

  // Header khớp giao diện và giữ STT ở cột đầu
  const headers = [
    'STT',
    'Ngày giao hàng',
    'Số giao hàng',
    'Khách hàng',
    'Địa chỉ giao',
    'Mã hàng',
    'Tên hàng',
    'Biến thể',
    'ĐVT',
    'Số lượng',
    'Giá',
    'Chiết khấu',
    'Thuế',
    'Thành tiền',
    'Tổng cộng',
    'Chi nhánh',
    'Nhân viên phụ trách'
  ];

  const wsData = rows.map((item) => [
    item.rowStt,
    item.delivery_date || '',
    item.reference_no || '',
    item.customer_name || '',
    item.address_delivery || '',
    item.item_code || '',
    item.item_name || '',
    item.variant_name || '',
    item.unit_name || '',
    item.quantity,
    item.price,
    item.discount_percent_item ?? '',
    item.tax_rate_item ?? '',
    item.total_amount,
    item.grand_total,
    item.branch_name || '',
    item.employee_name || ''
  ]);

  // Tính tổng cộng
  const totalQuantity = rows.reduce((sum, item) => sum + item.quantity, 0);
  const totalTotalAmount = rows.reduce((sum, item) => sum + item.total_amount, 0);

  const totalRow = [
    '', // STT
    '', // Ngày giao hàng
    '', // Số giao hàng
    'Tổng cộng', // Khách hàng (sticky ở footer UI)
    '', // Địa chỉ giao
    '', // Mã hàng
    '', // Tên hàng
    '', // Biến thể
    '', // ĐVT
    totalQuantity, // Số lượng
    '', // Giá
    '', // Chiết khấu
    '', // Thuế
    '', // Thành tiền
    totalTotalAmount, // Tổng cộng
    '', // Chi nhánh
    ''  // Nhân viên phụ trách
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

  // Merge cells cho các cột header cố định theo từng đơn: STT, Ngày giao hàng, Số giao hàng, Khách hàng, Địa chỉ giao, Tổng cộng đơn, Chi nhánh, Nhân viên phụ trách
  ws['!merges'] = ws['!merges'] || [];
  groups.forEach(g => {
    if (g.end > g.start) {
      const startRow = g.start + 1; // +1 vì có 1 hàng header
      const endRow = g.end + 1;
      // Merge các cột: STT (0), Ngày giao hàng (1), Số giao hàng (2), Khách hàng (3), Địa chỉ giao (4), Tổng cộng đơn (14), Chi nhánh (15), Nhân viên phụ trách (16)
      [0, 1, 2, 3, 4, 14, 15, 16].forEach(colIndex => {
        ws['!merges'].push({ s: { r: startRow, c: colIndex }, e: { r: endRow, c: colIndex } });
      });
    }
  });

  // Format số cho các cột số: STT (0), Số lượng (9), Giá (10), Chiết khấu (11), Thuế (12), Thành tiền (13), Tổng cộng đơn (14)
  const numberCols = [0, 9, 10, 11, 12, 13, 14]; 

  for (let r = 1; r <= rows.length; r++) { // +1 vì có 1 hàng header
    numberCols.forEach(c => {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (ws[ref] && ws[ref].v !== '' && typeof ws[ref].v === 'number') {
        ws[ref].t = 'n';
        // Giữ lại border và style hiện tại
        ws[ref].s = { 
          ...(ws[ref].s || {}),
          border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
          numFmt: c === 0 ? '0' : '#,##0'
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
      
      // Căn giữa cho các cột đầu bảng (0..2) và cột số; còn lại trái + wrap
      const centerCols = new Set([0, 1, 2]);
      const numericCols = new Set([9, 10, 11, 12, 13, 14]);
      const alignment = (centerCols.has(C) || numericCols.has(C))
        ? { horizontal: 'center', vertical: 'middle' }
        : { horizontal: 'left', vertical: 'middle', wrapText: true };
      
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

  // Set độ rộng cột khớp giao diện và STT
  ws['!cols'] = headers.map((title, index) => {
    let width = 15;
    if (index === 0) width = 8; // STT
    else if (index === 1) width = 18; // Ngày giao hàng
    else if (index === 2) width = 18; // Số giao hàng
    else if (index === 3) width = 25; // Khách hàng
    else if (index === 4) width = 30; // Địa chỉ giao
    else if (index === 5) width = 15; // Mã hàng
    else if (index === 6) width = 30; // Tên hàng
    else if (index === 7) width = 20; // Biến thể
    else if (index === 8) width = 10; // ĐVT
    else if (index === 9) width = 12; // Số lượng
    else if (index === 10) width = 15; // Giá
    else if (index === 11) width = 12; // Chiết khấu
    else if (index === 12) width = 10; // Thuế
    else if (index === 13) width = 15; // Thành tiền
    else if (index === 14) width = 18; // Tổng cộng đơn
    else if (index === 15) width = 20; // Chi nhánh
    else if (index === 16) width = 20; // Nhân viên phụ trách
    return { wch: width };
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo giao hàng');
  XLSX.writeFile(wb, filename);
};
