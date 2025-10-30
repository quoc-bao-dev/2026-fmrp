import * as XLSX from 'xlsx-js-style';

export const exportWithMergeReturns = (rawData = [], filename = 'Bao_cao_tra_lai_hang_ban.xlsx') => {
  // Khớp giao diện: Ngày trả hàng, Số phiếu, Khách hàng, Mã hàng, Tên hàng, ĐVT, Số lượng, Đơn giá, Thành tiền
  const rows = [];
  const groups = [];
  let currentRow = 0;

  // Nhóm theo id phiếu trả để merge 3 cột đầu
  const orderGroups = {};
  rawData.forEach(item => {
    const groupId = item?.id ?? `group_${currentRow}`;
    if (!orderGroups[groupId]) {
      orderGroups[groupId] = { order: item, items: [] };
    }
    orderGroups[groupId].items.push(item);
  });

  let stt = 1;
  Object.values(orderGroups).forEach(group => {
    const start = currentRow;
    let isFirst = true;
    // Tính tổng cộng theo group (phiếu)
    const groupTotalAmount = group.items.reduce((sum, it) => sum + (Number(it?.total_amount) || 0), 0);
    group.items.forEach(it => {
      rows.push({
        stt: isFirst ? stt : '',
        date: it?.date || '',
        reference_no: it?.reference_no || '',
        customer_name: it?.customer_name || '',
        branch_name: it?.branch_name || '',
        item_code: it?.item_code || '',
        item_name: it?.item_name || '',
        unit_name: it?.unit_name || '',
        quantity: Number(it?.quantity) || 0,
        price: Number(it?.price) || 0,
        discount_percent_item: Number(it?.discount_percent_item) || 0,
        tax_rate: Number(it?.tax_rate || it?.tax_rate_item) || 0,
        total_amount: Number(it?.total_amount) || 0,
        grand_total: isFirst ? groupTotalAmount : ''
      });
      currentRow += 1;
      isFirst = false;
    });
    const end = currentRow - 1;
    if (end >= start) groups.push({ start, end });
    stt += 1;
  });

  const headers = [
    'STT',
    'Ngày trả hàng',
    'Số phiếu',
    'Khách hàng',
    'Chi nhánh',
    'Mã hàng',
    'Tên hàng',
    'ĐVT',
    'Số lượng',
    'Đơn giá',
    'Chiết khấu (%)',
    'Thuế (%)',
    'Thành tiền',
    'Tổng cộng',
  ];

  const wsData = rows.map(item => [
    item.stt,
    item.date,
    item.reference_no,
    item.customer_name,
    item.branch_name,
    item.item_code,
    item.item_name,
    item.unit_name,
    item.quantity,
    item.price,
    item.discount_percent_item,
    item.tax_rate,
    item.total_amount,
    item.grand_total,
  ]);

  const totalQuantity = rows.reduce((s, x) => s + (Number(x.quantity) || 0), 0);
  const totalPrice = rows.reduce((s, x) => s + (Number(x.price) || 0), 0);
  const totalAmount = rows.reduce((s, x) => s + (Number(x.total_amount) || 0), 0);
  const totalDiscount = rows.reduce((sum, item) => sum + (Number(item.discount_amount) || 0), 0);
  const totalTax = rows.reduce((sum, item) => sum + (Number(item.tax_amount) || 0), 0);
  const totalGrandTotal = rows.reduce((sum, item) => sum + (Number(item.grand_total) || 0), 0);
  const totalRow = ['', '', '', '', '', '', '', '', totalQuantity, '', '', '', '', totalGrandTotal];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...wsData, totalRow]);

  // Style header
  for (let C = 0; C < headers.length; C++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: '0F4F9E' }, sz: 12 },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
        fill: { fgColor: { rgb: 'F0F8FF' } },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
    }
  }

  // Merge 5 cột đầu theo nhóm phiếu (STT, Ngày, Số phiếu, Khách hàng, Chi nhánh) và cột Tổng cộng
  ws['!merges'] = ws['!merges'] || [];
  groups.forEach(g => {
    if (g.end > g.start) {
      const startRow = g.start + 1; // +1 vì header
      const endRow = g.end + 1;
      // Merge các cột đầu và cột Tổng cộng luôn
      [0, 1, 2, 3, 4, 13].forEach(colIndex => {
        ws['!merges'].push({ s: { r: startRow, c: colIndex }, e: { r: endRow, c: colIndex } });
      });
    }
  });

  // Định dạng số cho STT, Số lượng, Đơn giá, Thành tiền, Tổng cộng
  const numberCols = [0, 8, 9, 12, 13];
  const percentCols = [10, 11];
  for (let r = 1; r <= rows.length; r++) {
    numberCols.forEach(c => {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (ws[ref] && ws[ref].v !== '' && typeof ws[ref].v === 'number') {
        ws[ref].t = 'n';
        ws[ref].s = {
          ...(ws[ref].s || {}),
          border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
          alignment: { horizontal: c === 0 ? 'center' : 'right', vertical: 'middle' },
          numFmt: c === 0 ? '0' : '#,##0'
        };
      }
    });
    // Định dạng phần trăm cho 2 cột %
    percentCols.forEach(c => {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (ws[ref] && typeof ws[ref].v === 'number') {
        ws[ref].t = 'n';
        ws[ref].v = ws[ref].v / 100;
        ws[ref].s = {
          ...(ws[ref].s || {}),
          border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          numFmt: '0.00%'
        };
      }
    });
  }

  // Style dòng tổng
  const totalRowIndex = rows.length + 1;
  for (let c = 0; c < headers.length; c++) {
    const ref = XLSX.utils.encode_cell({ r: totalRowIndex, c });
    if (ws[ref]) {
      ws[ref].s = {
        ...(ws[ref].s || {}),
        font: { bold: true },
        fill: { fgColor: { rgb: 'E6F3FF' } },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      };
      if ([7, 8, 9].includes(c) && typeof ws[ref].v === 'number') {
        ws[ref].t = 'n';
        ws[ref].s.numFmt = '#,##0';
        ws[ref].s.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    }
  }

  // Style cơ bản và căn lề theo cột
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = 0; R <= range.e.r; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      ws[cellRef] = ws[cellRef] || { v: '' };
      if (!ws[cellRef].s) ws[cellRef].s = {};
      if (!ws[cellRef].s.border) ws[cellRef].s.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      if (!ws[cellRef].s.font) ws[cellRef].s.font = { sz: 11 };
      if (!ws[cellRef].s.alignment) {
        ws[cellRef].s.alignment =
          C <= 4 ? { horizontal: 'center', vertical: 'middle' } : C >= 8 ? { horizontal: 'right', vertical: 'middle' } : { horizontal: 'left', vertical: 'middle', wrapText: true };
      }
    }
  }

  // Độ rộng cột giống giao diện
  ws['!cols'] = headers.map((_, index) => {
    let width = 15;
    if (index === 0) width = 8; // STT
    else if (index === 1) width = 16; // Ngày trả hàng
    else if (index === 2) width = 18; // Số phiếu
    else if (index === 3) width = 26; // Khách hàng
    else if (index === 4) width = 20; // Chi nhánh
    else if (index === 5) width = 16; // Mã hàng
    else if (index === 6) width = 32; // Tên hàng
    else if (index === 7) width = 10; // ĐVT
    else if (index === 8) width = 12; // Số lượng
    else if (index === 9) width = 14; // Đơn giá
    else if (index === 10) width = 14; // Chiết khấu
    else if (index === 11) width = 14; // Thuế
    else if (index === 12) width = 16; // Thành tiền
    else if (index === 13) width = 18; // Tổng cộng
    return { wch: width };
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo trả lại hàng bán');
  XLSX.writeFile(wb, filename);
};
