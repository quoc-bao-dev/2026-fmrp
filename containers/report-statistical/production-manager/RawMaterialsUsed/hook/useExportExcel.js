import moment from 'moment';
import * as XLSX from 'xlsx-js-style';

// Xuất Excel có gộp ô theo nhóm BOM của từng đơn hàng
export const exportWithMergeRawMaterialsUsed = (rawData = [], filename = 'Bao_cao_nguyen_lieu_su_dung.xlsx') => {
  // Chuẩn hóa và nhóm theo đơn hàng (mỗi phần tử rawData là 1 order có field boms)
  const rows = [];
  const groups = [];
  let currentRow = 0; // chỉ tính cho phần data (sau dòng tiêu đề)

  rawData.forEach(orderItem => {
    const boms = Array.isArray(orderItem?.boms) ? orderItem.boms : [];
    const start = currentRow; // vị trí bắt đầu nhóm này trong phần data
    boms.forEach(bom => {
      rows.push({
        order_number: orderItem?.object_data?.reference_no || '',
        order_note: orderItem?.object_data?.note || '',
        production_order: orderItem?.reference_no_detail || '',
        branch_name: orderItem?.branch_name || '', // Thêm dòng này
        date: orderItem?.po_date || '',
        material_code: bom?.item_code || '',
        material_name: bom?.item_name || '',
        variant_name: bom?.variant_name || '',
        material_type:
          bom?.type_products === 'materials'
            ? 'Nguyên vật liệu'
            : bom?.type_products === 'semi_products'
            ? 'Bán thành phẩm'
            : bom?.type_products === 'semi_products_outside'
            ? 'Bán thành phẩm ngoài'
            : bom?.type_products || '',
        unit_name: bom?.unit_name || '',
        plan_quantity: Number(bom?.quota_primary) || 0,
        output_quantity: Number(bom?.quantity_export) || 0,
        return_quantity: Number(bom?.quantity_purchase_internal) || 0,
        used_quantity: Number(bom?.quantity_used) || 0,
      });
      currentRow += 1;
    });
    const end = currentRow - 1; // vị trí kết thúc nhóm trong phần data
    if (end >= start) {
      groups.push({ start, end });
    }
  });

  const columns = [
    'STT',
    'Đơn hàng bán/ Kế hoạch nội bộ',
    'Ghi chú đơn hàng',
    'Số lệnh SX chi tiết',
    'Chi nhánh', // Thêm dòng này
    'Ngày',
    'Mã NVL',
    'Tên NVL',
    'Biến thể',
    'Loại',
    'Đơn vị',
    'SL kế hoạch',
    'SL đầu ra',
    'SL nhập lại',
    'SL đã sử dụng',
  ];

  const headerRow = columns.map(title => ({
    v: title,
    s: { font: { bold: true, color: { rgb: '#0284c7' }, sz: 12 }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } },
  }));

  // Tạo map nhóm để STT theo thứ tự nhóm (đơn hàng), không theo dòng
  const rowGroupIndex = new Array(rows.length).fill(0);
  groups.forEach((g, gi) => {
    for (let r = g.start; r <= g.end; r++) rowGroupIndex[r] = gi;
  });

  const wsData = rows.map((item, rowIndex) => [
    rowGroupIndex[rowIndex] + 1, // STT theo nhóm
    item.order_number,
    item.order_note,
    item.production_order,
    item.branch_name, // Thêm dòng này
    item.date ? moment(item.date).format('DD/MM/YYYY') : '',
    item.material_code,
    item.material_name,
    item.variant_name,
    item.material_type,
    item.unit_name,
    Number(item.plan_quantity) || 0,
    Number(item.output_quantity) || 0,
    Number(item.return_quantity) || 0,
    Number(item.used_quantity) || 0,
  ]);

  const totalPlan = rows.reduce((s, r) => s + (Number(r.plan_quantity) || 0), 0);
  const totalOutput = rows.reduce((s, r) => s + (Number(r.output_quantity) || 0), 0);
  const totalReturn = rows.reduce((s, r) => s + (Number(r.return_quantity) || 0), 0);
  const totalUsed = rows.reduce((s, r) => s + (Number(r.used_quantity) || 0), 0);

  const totalRow = [
    '', '', '', '', '', '', '', 'Tổng cộng', '', '', '', '', '', '', ''
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headerRow.map(c => c.v), ...wsData, totalRow]);

  // Style cơ bản cho toàn sheet
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = 0; R <= range.e.r; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      ws[cellRef] = ws[cellRef] || { v: '' };
      ws[cellRef].s = ws[cellRef].s || { font: { sz: 11 }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } };
    }
  }

  // In đậm hàng header
  for (let C = 0; C < columns.length; C++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: '#0284c7' }, sz: 12 },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
    };
  }

  // Gộp ô theo nhóm cho các cột: STT (0), Đơn hàng bán (1), Ghi chú (2), Số lệnh (3), Chi nhánh (4), Ngày (5)
  // Lưu ý: Trong sheet, dữ liệu bắt đầu từ hàng 1 (0 là header). Chuyển start/end của nhóm +1.
  ws['!merges'] = ws['!merges'] || [];
  groups.forEach(g => {
    if (g.end > g.start) {
      const startRow = g.start + 1; // +1 vì header ở hàng 0
      const endRow = g.end + 1;
      [0, 1, 2, 3, 4, 5].forEach(colIndex => { // Thêm cột 4 (Chi nhánh)
        ws['!merges'].push({ s: { r: startRow, c: colIndex }, e: { r: endRow, c: colIndex } });
      });
    }
  });

  // Áp numFmt '#,##0' cho các cột số (vị trí mới là 11,12,13,14 do thêm cột)
  const numberCols = [11, 12, 13, 14];
  // Data rows (bắt đầu tại r = 1 đến r = rows.length)
  for (let r = 1; r <= rows.length; r++) {
    numberCols.forEach(c => {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (ws[ref]) {
        ws[ref].t = 'n';
        ws[ref].s = { ...(ws[ref].s || {}), numFmt: '#,##0' };
      }
    });
  }
  // Total row
  const totalRowIndex = rows.length + 1; // sau header và data
  numberCols.forEach(col => {
    const ref = XLSX.utils.encode_cell({ r: totalRowIndex, c: col });
    if (ws[ref]) {
      ws[ref].t = 'n';
      ws[ref].s = { ...(ws[ref].s || {}), numFmt: '#,##0', font: { ...(ws[ref].s?.font || {}), bold: true } };
    }
  });

  // Set độ rộng cột tham chiếu theo tiêu đề
  ws['!cols'] = columns.map(t => ({ wch: Math.max(12, Math.min(40, String(t).length * 1.6)) }));

  XLSX.utils.book_append_sheet(wb, ws, 'BCNLSD');
  XLSX.writeFile(wb, filename);
};
