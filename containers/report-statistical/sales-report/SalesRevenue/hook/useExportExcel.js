import moment from 'moment';
import * as XLSX from 'xlsx-js-style';

export const exportWithMergeSalesRevenue = (rawData = [], filename = 'Bao_cao_doanh_so_theo_ban_hang.xlsx') => {
  // Chuẩn hóa dữ liệu từ flattenedData (mỗi item đã chứa thông tin order)
  const rows = [];
  const groups = [];
  let currentRow = 0;

  // Nhóm dữ liệu theo order để merge cells
  const orderGroups = {};
  rawData.forEach((item, index) => {
    const orderId = item.id || `order_${index}`;
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
        customer_code: item?.customer_code || '',
        customer_name: item?.customer_name || '',
        date: item?.date || '',
        reference_no: item?.reference_no || '',
        branch_name: item?.branch_name || '',
        employee_name: item?.employee_name || '',
        delivery_date: item?.delivery_date || '',
        item_code: item?.item_code || '',
        item_name: item?.item_name || '',
        variant_name: item?.variant_name || '',
        unit_name: item?.unit_name || '',
        quantity: Number(item?.quantity) || 0,
        quantity_delivery: Number(item?.quantity_delivery) || 0,
        quantity_not_delivery: Number(item?.quantity_not_delivery) || 0,
        price: Number(item?.price) || 0,
        discount_percent_item: Number(item?.discount_percent_item) || 0,
        discount_percent_amount_item: Number(item?.discount_percent_amount_item) || 0,
        tax_rate_item: Number(item?.tax_rate_item) || 0,
        tax_amount_item: Number(item?.tax_amount_item) || 0,
        grand_total: Number(item?.grand_total) || 0,
        total_payment: Number(item?.total_payment) || 0,
        total_rest: Number(item?.total_rest) || 0,
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

  // Header hàng 1 - các cột chính
  const headerRow1 = [
    'STT',
    'Mã khách hàng', 
    'Khách hàng',
    'Ngày',
    'Phiếu bán hàng',
    'Ngày giao hàng (dự kiến)',
    'Mã sản phẩm',
    'Tên sản phẩm',
    'Biến thể',
    'Đơn vị',
    'Số lượng', // Merge 3 cột
    '', // Đơn hàng
    '', // Đã giao  
    '', // Còn lại
    'Giá trị', // Merge 8 cột
    '', // Đơn giá
    '', // % chiết khấu
    '', // Tiền chiết khấu
    '', // % thuế
    '', // Tiền thuế
    '', // Tổng cộng
    'Chi nhánh', // Cột 21 - khớp với wsData[21] = branch_name
    'Nhân viên'  // Cột 22 - khớp với wsData[22] = employee_name
  ];

  // Header hàng 2 - các cột chi tiết (chỉ hiển thị cho Số lượng và Giá trị)
  const headerRow2 = [
    '', // STT - merge với hàng 1
    '', // Mã khách hàng - merge với hàng 1
    '', // Khách hàng - merge với hàng 1
    '', // Ngày - merge với hàng 1
    '', // Phiếu bán hàng - merge với hàng 1
    '', // Ngày giao hàng (dự kiến) - merge với hàng 1
    '', // Mã sản phẩm - merge với hàng 1
    '', // Tên sản phẩm - merge với hàng 1
    '', // Biến thể - merge với hàng 1
    '', // Đơn vị - merge với hàng 1
    'Đơn hàng',
    'Đã giao',
    'Còn lại',
    'Đơn giá',
    '% chiết khấu',
    'Tiền chiết khấu',
    '% thuế',
    'Tiền thuế',
    'Tổng cộng',
    'Đã thu',
    'Còn lại',
    '', // Chi nhánh - merge với hàng 1
    ''  // Nhân viên - merge với hàng 1
  ];

  const headerRow1Styled = headerRow1.map(title => ({
    v: title,
    s: { 
      font: { bold: true, color: { rgb: '#0284c7' }, sz: 12 }, 
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
      fill: { fgColor: { rgb: 'F0F8FF' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    },
  }));

  const headerRow2Styled = headerRow2.map(title => ({
    v: title,
    s: { 
      font: { bold: true, color: { rgb: '#0284c7' }, sz: 12 }, 
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
      fill: { fgColor: { rgb: 'F0F8FF' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    },
  }));

  const wsData = rows.map((item, rowIndex) => [
    item.stt,
    item.customer_code,
    item.customer_name,
    item.date ? moment(item.date).format('DD/MM/YYYY') : '',
    item.reference_no,
    item.delivery_date ? moment(item.delivery_date).format('DD/MM/YYYY') : '',
    item.item_code,
    item.item_name,
    item.variant_name,
    item.unit_name,
    item.quantity,
    item.quantity_delivery,
    item.quantity_not_delivery,
    item.price,
    item.discount_percent_item, // % chiết khấu - giữ nguyên giá trị
    item.discount_percent_amount_item, // Tiền chiết khấu - không chia 100
    item.tax_rate_item, // % thuế - giữ nguyên giá trị
    item.tax_amount_item, // Tiền thuế - không chia 100
    item.isFirstItem ? item.grand_total : '',
    item.isFirstItem ? item.total_payment : '',
    item.isFirstItem ? item.total_rest : '',
    item.branch_name,  // Cột 21
    item.employee_name // Cột 22
  ]);

  // Tính tổng cộng
  const totalQuantity = rows.reduce((sum, item) => sum + item.quantity, 0);
  const totalDelivery = rows.reduce((sum, item) => sum + item.quantity_delivery, 0);
  const totalNotDelivery = rows.reduce((sum, item) => sum + item.quantity_not_delivery, 0);
  const totalPrice = rows.reduce((sum, item) => sum + item.price, 0);
  const totalDiscountAmount = rows.reduce((sum, item) => sum + item.discount_percent_amount_item, 0);
  const totalTaxAmount = rows.reduce((sum, item) => sum + item.tax_amount_item, 0);
  const totalGrandTotal = Object.values(orderGroups).reduce((sum, group) => sum + (Number(group.order?.grand_total) || 0), 0);
  const totalPayment = Object.values(orderGroups).reduce((sum, group) => sum + (Number(group.order?.total_payment) || 0), 0);
  const totalRest = Object.values(orderGroups).reduce((sum, group) => sum + (Number(group.order?.total_rest) || 0), 0);

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
    '',
    totalQuantity,
    totalDelivery,
    totalNotDelivery,
    '', // Không tính tổng cho cột Đơn giá
    '', // Không hiển thị tổng phần trăm chiết khấu
    totalDiscountAmount,
    '', // Không hiển thị tổng phần trăm thuế
    totalTaxAmount,
    totalGrandTotal,
    totalPayment,
    totalRest,
    '', // Chi nhánh - cột 21
    ''  // Nhân viên - cột 22
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headerRow1, headerRow2, ...wsData, totalRow]);

  // Style cơ bản cho toàn sheet
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = 0; R <= range.e.r; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      ws[cellRef] = ws[cellRef] || { v: '' };
      ws[cellRef].s = ws[cellRef].s || { 
        font: { sz: 11 }, 
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
    }
  }

  // Style header hàng 1
  for (let C = 0; C < headerRow1.length; C++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: '#0284c7' }, sz: 12 },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
      fill: { fgColor: { rgb: 'F0F8FF' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
  }

  // Style header hàng 2
  for (let C = 0; C < headerRow2.length; C++) {
    const cellRef = XLSX.utils.encode_cell({ r: 1, c: C });
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: '#0284c7' }, sz: 12 },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
      fill: { fgColor: { rgb: 'F0F8FF' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
  }

  // Merge cells cho header "Số lượng" và "Giá trị"
  ws['!merges'] = ws['!merges'] || [];
  
  // Merge các cột từ STT đến Đơn vị (cột 0-9) thành 2 hàng
  for (let c = 0; c <= 9; c++) {
    ws['!merges'].push({ s: { r: 0, c: c }, e: { r: 1, c: c } });
  }
  
  // Merge "Số lượng" (cột 10-12: Đơn hàng, Đã giao, Còn lại)
  ws['!merges'].push({ s: { r: 0, c: 10 }, e: { r: 0, c: 12 } });
  
  // Merge "Giá trị" (cột 13-20: Đơn giá, % chiết khấu, Tiền chiết khấu, % thuế, Tiền thuế, Tổng cộng, Đã thu, Còn lại)
  ws['!merges'].push({ s: { r: 0, c: 13 }, e: { r: 0, c: 20 } });
  
  // Merge Chi nhánh và Nhân viên (cột 21-22) thành 2 hàng
  for (let c = 21; c <= 22; c++) {
    ws['!merges'].push({ s: { r: 0, c: c }, e: { r: 1, c: c } });
  }
  
  // Đảm bảo text "Giá trị" hiển thị ở ô đầu tiên của vùng merge
  const valueCellRef = XLSX.utils.encode_cell({ r: 0, c: 13 });
  if (ws[valueCellRef]) {
    ws[valueCellRef].v = 'Giá trị';
  }

  // Merge cells cho các cột được gộp (STT, Mã khách hàng, Khách hàng, Ngày, Phiếu bán hàng)
  groups.forEach(g => {
    if (g.end > g.start) {
      const startRow = g.start + 2; // +2 vì có 2 hàng header
      const endRow = g.end + 2;
      [0, 1, 2, 3, 4].forEach(colIndex => { // STT, Mã khách hàng, Khách hàng, Ngày, Phiếu bán hàng
        ws['!merges'].push({ s: { r: startRow, c: colIndex }, e: { r: endRow, c: colIndex } });
      });
      // Merge Chi nhánh và Nhân viên (cột 21-22)
      [21, 22].forEach(colIndex => {
        ws['!merges'].push({ s: { r: startRow, c: colIndex }, e: { r: endRow, c: colIndex } });
      });
    }
  });

  // Merge cells cho Tổng cộng, Đã thu, Còn lại (chỉ hiển thị ở item đầu tiên)
  groups.forEach(g => {
    if (g.end > g.start) {
      const startRow = g.start + 2; // +2 vì có 2 hàng header
      const endRow = g.end + 2;
      [18, 19, 20].forEach(colIndex => { // Tổng cộng, Đã thu, Còn lại
        ws['!merges'].push({ s: { r: startRow, c: colIndex }, e: { r: endRow, c: colIndex } });
      });
    }
  });

  // Format số cho các cột số
  const numberCols = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; // Các cột số lượng và tiền
  const percentCols = [14, 16]; // Các cột phần trăm (% chiết khấu, % thuế) - format thành phần trăm
  const moneyCols = [13, 15, 17]; // Các cột tiền (Đơn giá, Tiền chiết khấu, Tiền thuế) - format thành số tiền
  
  for (let r = 2; r <= rows.length + 1; r++) { // +2 vì có 2 hàng header
    numberCols.forEach(c => {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (ws[ref] && ws[ref].v !== '') {
        ws[ref].t = 'n';
        if (percentCols.includes(c)) {
          // Chia cho 100 để hiển thị đúng phần trăm trong Excel
          ws[ref].v = ws[ref].v/100;
          ws[ref].s = { ...(ws[ref].s || {}), numFmt: '0.00%' };
        } else if (moneyCols.includes(c)) {
          // Các cột tiền - format thành số tiền, không chia cho 100
          ws[ref].s = { ...(ws[ref].s || {}), numFmt: '#,##0' };
        } else {
          ws[ref].s = { ...(ws[ref].s || {}), numFmt: '#,##0' };
        }
      }
    });
  }

  // Style dòng tổng cộng
  const totalRowIndex = rows.length + 2; // +2 vì có 2 hàng header
  for (let c = 0; c < headerRow2.length; c++) {
    const ref = XLSX.utils.encode_cell({ r: totalRowIndex, c });
    if (ws[ref]) {
      ws[ref].s = {
        ...(ws[ref].s || {}),
        font: { bold: true },
        fill: { fgColor: { rgb: 'E6F3FF' } },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      };
      if (numberCols.includes(c) && ws[ref].v !== '') {
        ws[ref].t = 'n';
        if (percentCols.includes(c)) {
          // Không chia cho 100 ở dòng tổng cộng vì không có ý nghĩa
          ws[ref].s.numFmt = '#,##0';
        } else if (moneyCols.includes(c)) {
          // Các cột tiền - format thành số tiền
          ws[ref].s.numFmt = '#,##0';
        } else {
          ws[ref].s.numFmt = '#,##0';
        }
      }
    }
  }

  // Set độ rộng cột
  ws['!cols'] = headerRow2.map((title, index) => {
    let width = 12;
    if (index === 0) width = 8; // STT
    else if (index === 1) width = 15; // Mã khách hàng
    else if (index === 2) width = 25; // Khách hàng
    else if (index === 3) width = 12; // Ngày
    else if (index === 4) width = 20; // Phiếu bán hàng
    else if (index === 5) width = 20; // Ngày giao hàng
    else if (index === 6) width = 15; // Mã sản phẩm
    else if (index === 7) width = 30; // Tên sản phẩm
    else if (index === 8) width = 20; // Biến thể
    else if (index === 9) width = 10; // Đơn vị
    else if (index === 21) width = 20; // Chi nhánh
    else if (index === 22) width = 20; // Nhân viên
    else width = 15; // Các cột số
    return { wch: width };
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Doanh số theo bán hàng');
  XLSX.writeFile(wb, filename);
};
