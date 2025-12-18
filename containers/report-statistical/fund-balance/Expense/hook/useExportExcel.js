import moment from 'moment';
import * as XLSX from 'xlsx-js-style';

export const exportExpense = (rawData = [], rTotal = {}, filename = 'Bao_cao_chi_phi.xlsx') => {
  if (!Array.isArray(rawData) || rawData.length === 0) return;

  const flatted = [];

  const walk = (items, level = 0, parentIndex = 0, sttRef = { value: 0 }) => {
    items.forEach(item => {
      if (level === 0) {
        sttRef.value += 1;
      }
      flatted.push({
        level,
        stt: level === 0 ? sttRef.value : '',
        code: item.code || '',
        name: item.name || '',
        total: Number(item.total || 0),
      });
      if (Array.isArray(item.children) && item.children.length > 0) {
        walk(item.children, level + 1, sttRef.value, sttRef);
      }
    });
  };

  walk(rawData, 0, 0, { value: 0 });

  const wb = XLSX.utils.book_new();
  const headers = ['STT', 'Tên khoản chi phí', 'Chi phí'];

  const dataRows = flatted.map(row => [
    row.stt,
    `${'-'.repeat(row.level)} ${row.code ? `${row.code} - ` : ''}${row.name}`,
    row.total,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 50 },
    { wch: 18 },
  ];

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

  dataRows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
      if (!ws[cellRef]) return;

      ws[cellRef].s = {
        alignment: {
          horizontal: colIndex === 2 ? 'right' : colIndex === 0 ? 'center' : 'left',
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

      if (colIndex === 2) {
        ws[cellRef].t = 'n';
        ws[cellRef].s.numFmt = '#,##0';
      }
    });
  });

  // dòng tổng cộng nếu có rTotal.grand_total
  const lastRow = flatted.length + 1;
  if (rTotal && rTotal.grand_total !== undefined) {
    const labelRef = XLSX.utils.encode_cell({ r: lastRow, c: 1 });
    const valueRef = XLSX.utils.encode_cell({ r: lastRow, c: 2 });
    ws[labelRef] = { v: 'Tổng cộng', t: 's' };
    ws[valueRef] = { v: Number(rTotal.grand_total || 0), t: 'n' };

    ws[labelRef].s = {
      font: { bold: true },
      alignment: { horizontal: 'left', vertical: 'middle' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };
    ws[valueRef].s = {
      font: { bold: true },
      alignment: { horizontal: 'right', vertical: 'middle' },
      numFmt: '#,##0',
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo chi phí');
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

