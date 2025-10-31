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
    group.items.forEach(it => {
      rows.push({
        stt: isFirst ? stt : '',
        date: it?.date || '',
        reference_no: it?.reference_no || '',
        customer_name: it?.customer_name || '',
        item_code: it?.item_code || '',
        item_name: it?.item_name || '',
        unit_name: it?.unit_name || '',
        quantity: Number(it?.quantity) || 0,
        price: Number(it?.price) || 0,
        amount: Number(it?.amount) || 0,
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
    'Mã hàng',
    'Tên hàng',
    'ĐVT',
    'Số lượng',
    'Đơn giá',
    'Thành tiền',
  ];

  const wsData = rows.map(item => [
    item.stt,
    item.date,
    item.reference_no,
    item.customer_name,
    item.item_code,
    item.item_name,
    item.unit_name,
    item.quantity,
    item.price,
    item.amount,
  ]);

  const totalQuantity = rows.reduce((s, x) => s + (Number(x.quantity) || 0), 0);
  const totalPrice = rows.reduce((s, x) => s + (Number(x.price) || 0), 0);
  const totalAmount = rows.reduce((s, x) => s + (Number(x.amount) || 0), 0);

  const totalRow = ['', '', '', '', '', '', '', totalQuantity, totalPrice, totalAmount];

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

  // Merge 4 cột đầu theo nhóm phiếu (STT, Ngày, Số phiếu, Khách hàng)
  ws['!merges'] = ws['!merges'] || [];
  groups.forEach(g => {
    if (g.end > g.start) {
      const startRow = g.start + 1; // +1 vì header
      const endRow = g.end + 1;
      [0, 1, 2, 3].forEach(colIndex => {
        ws['!merges'].push({ s: { r: startRow, c: colIndex }, e: { r: endRow, c: colIndex } });
      });
    }
  });

  // Định dạng số cho STT, Số lượng, Đơn giá, Thành tiền
  const numberCols = [0, 7, 8, 9];
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
          C <= 3 ? { horizontal: 'center', vertical: 'middle' } : C >= 7 ? { horizontal: 'right', vertical: 'middle' } : { horizontal: 'left', vertical: 'middle', wrapText: true };
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
    else if (index === 4) width = 16; // Mã hàng
    else if (index === 5) width = 32; // Tên hàng
    else if (index === 6) width = 10; // ĐVT
    else if (index === 7) width = 12; // Số lượng
    else if (index === 8) width = 14; // Đơn giá
    else if (index === 9) width = 16; // Thành tiền
    return { wch: width };
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo trả lại hàng bán');
  XLSX.writeFile(wb, filename);
};

export const exportCustomerDebtExcel = (dataCustomerDebt, filename = 'Bao_cao_cong_no_khach_hang.xlsx', settings, period) => {
  if (!dataCustomerDebt) return;

  const wb = XLSX.utils.book_new();
  const bodyRows = [];
  const COLS = 11;

  // Columns giữ nguyên dữ liệu theo UI hiện tại
  const headers = [
    'Ngày đơn hàng',
    'Số đơn hàng',
    'Sản phẩm',
    'Biến thể',
    'Đơn vị',
    'Số lượng',
    'Đơn giá',
    'Tổng tiền',
    'Chiết khấu',
    'Thuế',
    'Thành tiền sau thuế',
  ];

  // 1) Phần thông tin tiêu đề + khách hàng (giống bố cục mẫu)
  const clientName = dataCustomerDebt?.debt?.client_name || '';
  const clientAddress = dataCustomerDebt?.debt?.address || '';
  const clientPhone = dataCustomerDebt?.debt?.phone_number || '';
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  const startPeriod = period?.start_date || '';
  const endPeriod = period?.end_date || dateStr;

  // Thông tin công ty từ settings
  const companyName = settings?.company_name || '';
  const companyAddress = settings?.company_address || settings?.representative_address || '';
  const companyPhone = settings?.company_phone_number || settings?.representative_phone_number || '';

  // Khối header công ty (để cột A trống làm vùng logo, text bắt đầu từ cột B)
  const companyRows = [
    [companyName || '', ...Array(COLS - 1).fill('')],
    [`Địa chỉ: ${companyAddress}`.trim(), ...Array(COLS - 1).fill('')],
    [`Điện thoại: ${companyPhone}`.trim(), ...Array(COLS - 1).fill('')],
  ];

  const headerRows = [
    // Dòng trống dẫn
    Array(COLS).fill(''),
    // Tiêu đề lớn
    ['BẢNG ĐỐI CHIẾU CÔNG NỢ', ...Array(COLS - 1).fill('')],
    // Thông tin khách hàng
    ['Tên khách hàng:', clientName, ...Array(COLS - 2).fill('')],
    ['Địa chỉ:', clientAddress, ...Array(COLS - 2).fill('')],
    ['Số điện thoại:', clientPhone, ...Array(COLS - 2).fill('')],
    [
      `${(settings?.company_name || '').toString()} gửi đến công ty ${clientName} bảng đối chiếu công nợ từ ngày ${startPeriod} đến ngày ${endPeriod} , chi tiết như sau:`,
      ...Array(COLS - 1).fill('')
    ],
    // khoảng trống trước header bảng
    Array(COLS).fill(''),
  ];

  // 2) Phần dữ liệu bảng (giữ nguyên logic hiện tại)
  // Công nợ đầu kỳ
  bodyRows.push([
    'Công nợ đầu kỳ',
    ...Array(COLS - 2).fill(''),
    Number(dataCustomerDebt?.raw_balance) || 0
  ]);

  // Phiếu giao hàng
  if (Array.isArray(dataCustomerDebt?.deliveries) && dataCustomerDebt.deliveries.length > 0) {
    bodyRows.push(['Phiếu giao hàng', '', '', '', '', '', '', '', '', '', '']);
    dataCustomerDebt.deliveries.forEach(delivery => {
      // Dòng tổng theo phiếu
      bodyRows.push([
        delivery?.delivery_date ? delivery.delivery_date : '',
        delivery?.reference_no || '',
        '', '', '', '','',
        Number(delivery?.total_amount_items) || 0,
        Number(delivery?.total_discount_percent_items) || 0,
        Number(delivery?.total_tax_items) || 0,
        Number(delivery?.grand_total_items) || 0,
      ]);
      // Chi tiết mặt hàng
      (delivery.items || []).forEach(it => {
        bodyRows.push([
          '', '',
          it?.item_name || it?.item_code || '',
          it?.variant_name || '-',
          it?.unit_name || '',
          Number(it?.quantity) || 0,
          Number(it?.price) || 0,
          Number(it?.amount) || 0,
          Number(it?.discount_percent_amount_item) || 0,
          Number(it?.tax_amount_item) || 0,
          Number(it?.total_amount) || 0,
        ]);
      });
    });
    bodyRows.push(['Tổng cộng (giao hàng)', '', '', '', '', '', Number(dataCustomerDebt?.total_deliveries) || 0, '', '', '', Number(dataCustomerDebt?.total_deliveries) || 0]);
  }

  // Trả lại hàng bán
  if (Array.isArray(dataCustomerDebt?.returns) && dataCustomerDebt.returns.length > 0) {
    bodyRows.push(['Trả lại hàng bán', '', '', '', '', '', '', '', '', '', '']);
    dataCustomerDebt.returns.forEach(ret => {
      bodyRows.push([
        ret?.date || '',
        ret?.reference_no || '',
        '', '', '', '', '',
        Number(ret?.total_amount_items) || 0,
        Number(ret?.total_discount_percent_items) || 0,
        Number(ret?.total_tax_items) || 0,
        Number(ret?.grand_total_items) || 0,
      ]);
      (ret.items || []).forEach(it => {
        bodyRows.push([
          '', '',
          it?.item_name || it?.item_code || '',
          it?.variant_name || '-',
          it?.unit_name || '',
          Number(it?.quantity) || 0,
          Number(it?.price) || 0,
          Number(it?.amount) || 0,
          Number(it?.discount_percent_amount_item) || 0,
          Number(it?.tax_price) || 0,
          Number(it?.total_amount) || 0,
        ]);
      });
    });
    bodyRows.push(['Tổng cộng (trả lại)', '', '', '', '', '', Number(dataCustomerDebt?.total_returns) || 0, '', '', '', Number(dataCustomerDebt?.total_returns) || 0]);
  }
  const tongPhatSinh = (Number(dataCustomerDebt?.total_deliveries) || 0) - (Number(dataCustomerDebt?.total_returns) || 0);
  bodyRows.push([
    'Tổng cộng phát sinh trong kỳ', ...Array(COLS - 2).fill(''), tongPhatSinh
  ]);
  // Phiếu thu trong kỳ (header & data đúng giao diện)
  if (Array.isArray(dataCustomerDebt?.other_payslips_coupon) && dataCustomerDebt.other_payslips_coupon.length > 0) {
    // Header group title
    bodyRows.push(['Phiếu thu trong kỳ', '', '', '', '', '', '', '', '', '', '']);
    // Header phiếu thu trong kỳ
    bodyRows.push([
      'Ngày chứng từ', // col 0
      'Mã phiếu',      // col 1
      'Ghi chú',       // col 2
      '', '', '', '', '', '', '',
      'Số tiền'        // col 10
    ]);
    dataCustomerDebt.other_payslips_coupon.forEach(cp => {
      bodyRows.push([
        cp?.date || '', // Ngày chứng từ
        cp?.code || '', // Mã phiếu
        cp?.note || '', // Ghi chú
        '', '', '', '', '', '', '',
        Number(cp?.total) || 0 // Số tiền
      ]);
    });
    bodyRows.push(['Tổng cộng (phiếu thu)', '', '', '', '', '', '', '', '', '', Number(dataCustomerDebt?.total_other_payslips_coupon) || 0]);
  }

  // SỐ DƯ CUỐI KỲ
  bodyRows.push([
    'Số dư cuối kỳ', ...Array(COLS - 2).fill(''), Number(dataCustomerDebt?.final_debt) || 0
  ]);

  // 3) Footer: xác nhận + ghi chú
  const footerRows = [
    // Cách bảng: 1 dòng trống
    Array(COLS).fill(''),
    // Dòng thời gian bên phải
    ['', '', '', '', '', `Tp.HCM, ngày ${dateStr}`, '', '', '', '', ''],
    // Dòng xác nhận
    ['Khách hàng xác nhận', '', '', '', '', 'Người Lập', '', '', '', '', ''],
    // Ghi chú cách xác nhận 4 hàng trống
    Array(COLS).fill(''),
    Array(COLS).fill(''),
    Array(COLS).fill(''),
    Array(COLS).fill(''),
    // Dòng ghi chú
    ['Ghi chú: Biên bản trên được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị giống nhau.', ...Array(COLS - 1).fill('')],
  ];

  // Ghép sheet: companyRows + headerRows + headers + body + footer
  const headerRowIndex = companyRows.length + headerRows.length; // vị trí hàng chứa tiêu đề cột
  const ws = XLSX.utils.aoa_to_sheet([...companyRows, ...headerRows, headers, ...bodyRows, ...footerRows]);

  // 3) Styling
  ws['!merges'] = ws['!merges'] || [];

  // Hàm kiểm tra vùng merge đã tồn tại chưa
  function isMerged(rangeArr, sRow, sCol, eRow, eCol) {
    return rangeArr.some(m => m.s.r === sRow && m.s.c === sCol && m.e.r === eRow && m.e.c === eCol);
  }

  // Merge cho khối công ty: merge cột A→J cho tên công ty + 2 dòng thông tin
  const companyBase = 0; // bắt đầu sheet
  [companyBase + 0, companyBase + 1, companyBase + 2].forEach(r => {
    if (!isMerged(ws['!merges'], r, 0, r, COLS - 1))
      ws['!merges'].push({ s: { r, c: 0 }, e: { r, c: COLS - 1 } });
  });

  // Merge cho tiêu đề lớn và các dòng thông tin KH
  const titleRowAbs = companyRows.length + 1; // headerRows[1]
  if (!isMerged(ws['!merges'], titleRowAbs, 0, titleRowAbs, COLS - 1))
    ws['!merges'].push({ s: { r: titleRowAbs, c: 0 }, e: { r: titleRowAbs, c: COLS - 1 } });
  // Các dòng thông tin KH (relative 3,4,5) => absolute + companyRows.length
  [companyRows.length + 2, companyRows.length + 3, companyRows.length + 4].forEach(r => {
    if (!isMerged(ws['!merges'], r, 1, r, COLS - 1))
      ws['!merges'].push({ s: { r, c: 1 }, e: { r, c: COLS - 1 } });
  });
  // Merge dòng mô tả gửi bảng đối chiếu (relative 6)
  const narrativeRowAbs = companyRows.length + 5;
  if (!isMerged(ws['!merges'], narrativeRowAbs, 0, narrativeRowAbs, COLS - 1))
    ws['!merges'].push({ s: { r: narrativeRowAbs, c: 0 }, e: { r: narrativeRowAbs, c: COLS - 1 } });

  // Style tiêu đề lớn
  const titleRef = XLSX.utils.encode_cell({ r: titleRowAbs, c: 0 });
  if (ws[titleRef]) {
    ws[titleRef].s = {
      font: { bold: true, sz: 14, color: { rgb: '0F4F9E' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
    };
  }

  // Nhãn thông tin KH (cột A)
  [companyRows.length + 2, companyRows.length + 3, companyRows.length + 4].forEach(r => {
    const refA = XLSX.utils.encode_cell({ r, c: 0 });
    if (ws[refA]) ws[refA].s = { font: { bold: true }, alignment: { horizontal: 'left', vertical: 'middle' } };
  });

  // Style dòng mô tả gửi bảng đối chiếu
  const narrativeRef = XLSX.utils.encode_cell({ r: narrativeRowAbs, c: 0 });
  if (ws[narrativeRef]) ws[narrativeRef].s = { alignment: { horizontal: 'left', vertical: 'middle' }, font: { color: { rgb: '111827' } } };

  // Style khối công ty (cột B hợp nhất)
  // Dòng tên công ty: font lớn hơn, không ép viết hoa
  const companyNameRef = XLSX.utils.encode_cell({ r: companyBase + 0, c: 0 });
  if (ws[companyNameRef]) ws[companyNameRef].s = { alignment: { horizontal: 'left', vertical: 'middle' }, font: { sz: 13, color: { rgb: '111827' } } };

  // Địa chỉ & điện thoại
  [companyBase + 1, companyBase + 2].forEach(r => {
    const refB = XLSX.utils.encode_cell({ r, c: 0 });
    if (ws[refB]) ws[refB].s = { alignment: { horizontal: 'left', vertical: 'middle' } };
  });

  // Nới rộng cột A để dành vùng logo bên trái
  ws['!cols'] = ws['!cols'] || headers.map(() => ({ wch: 14 }));
  ws['!cols'][0] = { wch: 18 };

  // Header bảng
  for (let C = 0; C < headers.length; C++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: '111827' } },
        fill: { fgColor: { rgb: 'F3F4F6' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
      };
    }
  }

  // Áp border + căn lề cho dữ liệu (chỉ trong vùng bảng, không áp dụng cho footer)
  const range = XLSX.utils.decode_range(ws['!ref']);
  const lastBodyRow = headerRowIndex + bodyRows.length; // kết thúc phần dữ liệu
  for (let R = headerRowIndex + 1; R <= lastBodyRow; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const ref = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[ref]) continue;
      ws[ref].s = {
        ...(ws[ref].s || {}),
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
        alignment: { horizontal: C >= 6 ? 'right' : C <= 1 ? 'center' : C === 9 ? 'right' : 'left', vertical: 'middle' },
      };
      if (typeof ws[ref].v === 'number') {
        ws[ref].t = 'n';
        ws[ref].s.numFmt = '#,##0';
      }
    }
  }

  // Tô màu/merge các dòng tiêu đề từng mục trong phần thân
  const colorRow = (rowIndex, colorRgb) => {
    for (let C = 0; C < headers.length; C++) {
      const ref = XLSX.utils.encode_cell({ r: rowIndex, c: C });
      if (ws[ref]) ws[ref].s = { ...(ws[ref].s || {}), fill: { fgColor: { rgb: colorRgb } }, font: { bold: true } };
    }
    if (!isMerged(ws['!merges'], rowIndex, 0, rowIndex, headers.length - 1))
      ws['!merges'].push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: headers.length - 1 } });
  };

  for (let R = headerRowIndex + 1; R <= range.e.r; R++) {
    const firstRef = XLSX.utils.encode_cell({ r: R, c: 0 });
    const val = ws[firstRef]?.v;
    if (val === 'Phiếu giao hàng') colorRow(R, 'DBEAFE');
    if (val === 'Trả lại hàng bán') colorRow(R, 'FEF3C7');
    if (val === 'Phiếu thu trong kỳ') colorRow(R, 'D1FAE5');
  }

  // Làm đậm các dòng tổng
  const boldRowIfStartsWith = (text, color) => {
    for (let R = headerRowIndex + 1; R <= range.e.r; R++) {
      const ref = XLSX.utils.encode_cell({ r: R, c: 0 });
      const v = ws[ref]?.v || '';
      if (typeof v === 'string' && v.startsWith(text)) {
        for (let C = 0; C < headers.length; C++) {
          const cRef = XLSX.utils.encode_cell({ r: R, c: C });
          if (ws[cRef]) ws[cRef].s = { ...(ws[cRef].s || {}), font: { bold: true, color: { rgb: color } } };
        }
      }
    }
  };
  boldRowIfStartsWith('Tổng cộng (giao hàng)', '1E3A8A');
  boldRowIfStartsWith('Tổng cộng (trả lại)', '92400E');
  boldRowIfStartsWith('Tổng cộng (phiếu thu)', '065F46');
  boldRowIfStartsWith('Tổng cộng phát sinh trong kỳ', '0F4F9E');
  boldRowIfStartsWith('Số dư cuối kỳ', '0F4F9E');

  // Merge + style phần Footer
  const footerBase = headerRowIndex + 1 + bodyRows.length; // hàng bắt đầu của footer (dòng trống đầu tiên)
  const dateRow = footerBase + 1; // ngay sau dòng trống
  const signRow = footerBase + 2;
  const noteRow = footerBase + 7; // sau 4 dòng trống kể từ dòng xác nhận

  // Merge ngày tháng phía phải (cột 5..9)
  if (!isMerged(ws['!merges'], dateRow, 5, dateRow, COLS - 1))
    ws['!merges'].push({ s: { r: dateRow, c: 5 }, e: { r: dateRow, c: COLS - 1 } });
  // Merge 2 ô ký tên: trái 0..4, phải 5..9
  if (!isMerged(ws['!merges'], signRow, 0, signRow, 4))
    ws['!merges'].push({ s: { r: signRow, c: 0 }, e: { r: signRow, c: 4 } });
  if (!isMerged(ws['!merges'], signRow, 5, signRow, COLS - 1))
    ws['!merges'].push({ s: { r: signRow, c: 5 }, e: { r: signRow, c: COLS - 1 } });
  // Merge ghi chú toàn hàng
  if (!isMerged(ws['!merges'], noteRow, 0, noteRow, COLS - 1))
    ws['!merges'].push({ s: { r: noteRow, c: 0 }, e: { r: noteRow, c: COLS - 1 } });

  // Style footer
  const dateRef = XLSX.utils.encode_cell({ r: dateRow, c: 5 });
  if (ws[dateRef]) ws[dateRef].s = { font: { italic: true, color: { rgb: '374151' } }, alignment: { horizontal: 'center', vertical: 'middle' } };
  const leftSignRef = XLSX.utils.encode_cell({ r: signRow, c: 0 });
  const rightSignRef = XLSX.utils.encode_cell({ r: signRow, c: 5 });
  if (ws[leftSignRef]) ws[leftSignRef].s = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'middle' } };
  if (ws[rightSignRef]) ws[rightSignRef].s = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'middle' } };
  const noteRef = XLSX.utils.encode_cell({ r: noteRow, c: 0 });
  if (ws[noteRef]) ws[noteRef].s = { font: { italic: true, color: { rgb: '6B7280' } }, alignment: { horizontal: 'left', vertical: 'middle' } };

  // Độ rộng cột
  ws['!cols'] = headers.map((_, idx) => ({ wch: [16, 18, 34, 26, 12, 12, 14, 16, 14, 12, 18][idx] || 14 }));

  // merge các dòng đặc biệt này ở dưới
  // Merge cho dòng tổng cộng phát sinh trong kỳ
  const tongPhatSinhRow = headerRowIndex + bodyRows.findIndex(row => row[0] === 'Tổng cộng phát sinh trong kỳ') + 1;
  if (!isMerged(ws['!merges'], tongPhatSinhRow, 0, tongPhatSinhRow, COLS - 2))
    ws['!merges'].push({ s: { r: tongPhatSinhRow, c: 0 }, e: { r: tongPhatSinhRow, c: COLS - 2 } });
  // Merge cho dòng số dư cuối kỳ
  const soDuCuoiKyRow = headerRowIndex + bodyRows.findIndex(row => row[0] === 'Số dư cuối kỳ') + 1;
  if (!isMerged(ws['!merges'], soDuCuoiKyRow, 0, soDuCuoiKyRow, COLS - 2))
    ws['!merges'].push({ s: { r: soDuCuoiKyRow, c: 0 }, e: { r: soDuCuoiKyRow, c: COLS - 2 } });

  // Style font đậm cho các dòng này
  const tongPhatSinhRef = XLSX.utils.encode_cell({ r: tongPhatSinhRow, c: 0 });
  const tongPhatSinhMoneyRef = XLSX.utils.encode_cell({ r: tongPhatSinhRow, c: COLS - 1 });
  if (ws[tongPhatSinhRef]) ws[tongPhatSinhRef].s = { font: { bold: true, color: { rgb: '0F4F9E' } }, alignment: { horizontal: 'left', vertical: 'middle' } };
  if (ws[tongPhatSinhMoneyRef]) ws[tongPhatSinhMoneyRef].s = { font: { bold: true, color: { rgb: '0F4F9E' } }, alignment: { horizontal: 'right', vertical: 'middle' }, numFmt: '#,##0' };
  const soDuCuoiKyRef = XLSX.utils.encode_cell({ r: soDuCuoiKyRow, c: 0 });
  const soDuCuoiKyMoneyRef = XLSX.utils.encode_cell({ r: soDuCuoiKyRow, c: COLS - 1 });
  if (ws[soDuCuoiKyRef]) ws[soDuCuoiKyRef].s = { font: { bold: true, color: { rgb: '0F4F9E' } }, alignment: { horizontal: 'left', vertical: 'middle' } };
  if (ws[soDuCuoiKyMoneyRef]) ws[soDuCuoiKyMoneyRef].s = { font: { bold: true, color: { rgb: '0F4F9E' } }, alignment: { horizontal: 'right', vertical: 'middle' }, numFmt: '#,##0', border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } };

  // Merge từ cột 0 đến 9 cho dòng Công nợ đầu kỳ
  const congNoDauKyRow = companyRows.length + headerRows.length + 1;
  if (!isMerged(ws['!merges'], congNoDauKyRow, 0, congNoDauKyRow, COLS - 2))
    ws['!merges'].push({ s: { r: congNoDauKyRow, c: 0 }, e: { r: congNoDauKyRow, c: COLS - 2 } });

  // Sau phần merge cho dòng Công nợ đầu kỳ
  const congNoDauKyRef = XLSX.utils.encode_cell({ r: congNoDauKyRow, c: 0 });
  if (ws[congNoDauKyRef]) {
    ws[congNoDauKyRef].s = {
      ...(ws[congNoDauKyRef].s || {}),
      alignment: { horizontal: 'left', vertical: 'middle' },
      font: { bold: true },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };
  }

  // Merge từ cột 0 đến 9 cho dòng Tổng cộng phát sinh trong kỳ
  const tongPhatSinhBodyRow = headerRowIndex + bodyRows.findIndex(row => row[0] === 'Tổng cộng phát sinh trong kỳ') + 1;
  if (!isMerged(ws['!merges'], tongPhatSinhBodyRow, 0, tongPhatSinhBodyRow, COLS - 2))
    ws['!merges'].push({ s: { r: tongPhatSinhBodyRow, c: 0 }, e: { r: tongPhatSinhBodyRow, c: COLS - 2 } });
  const tongPhatSinhBodyRef = XLSX.utils.encode_cell({ r: tongPhatSinhBodyRow, c: 0 });
  if (ws[tongPhatSinhBodyRef]) {
    ws[tongPhatSinhBodyRef].s = {
      ...(ws[tongPhatSinhBodyRef].s || {}),
      alignment: { horizontal: 'left', vertical: 'middle' },
      font: { bold: true, color: { rgb: '0F4F9E' } },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };
  }
  // Merge từ cột 0 đến 9 cho dòng Số dư cuối kỳ
  const soDuCuoiKyBodyRow = headerRowIndex + bodyRows.findIndex(row => row[0] === 'Số dư cuối kỳ') + 1;
  if (!isMerged(ws['!merges'], soDuCuoiKyBodyRow, 0, soDuCuoiKyBodyRow, COLS - 2))
    ws['!merges'].push({ s: { r: soDuCuoiKyBodyRow, c: 0 }, e: { r: soDuCuoiKyBodyRow, c: COLS - 2 } });
  const soDuCuoiKyBodyRef = XLSX.utils.encode_cell({ r: soDuCuoiKyBodyRow, c: 0 });
  if (ws[soDuCuoiKyBodyRef]) {
    ws[soDuCuoiKyBodyRef].s = {
      ...(ws[soDuCuoiKyBodyRef].s || {}),
      alignment: { horizontal: 'left', vertical: 'middle' },
      font: { bold: true, color: '0F4F9E' },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo công nợ');
  XLSX.writeFile(wb, filename);
};
