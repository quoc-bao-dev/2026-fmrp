import * as XLSX from 'xlsx-js-style';

// Xuất Excel theo đúng dữ liệu hiển thị trên giao diện Tổng hợp tồn quỹ
export const exportSyntheticFund = (rawData = [], rTotal = {}, filename = 'Tong_hop_ton_quy.xlsx') => {
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
        { title: 'Tên tài khoản', width: { wch: 30 }, style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } } },
        { title: 'Số dư đầu kỳ - Thu', width: { wch: 18 }, style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } } },
        { title: 'Số dư đầu kỳ - Chi', width: { wch: 18 }, style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } } },
        { title: 'Phát sinh - Thu', width: { wch: 18 }, style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } } },
        { title: 'Phát sinh - Chi', width: { wch: 18 }, style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } } },
        { title: 'Số dư cuối kỳ - Thu', width: { wch: 18 }, style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } } },
        { title: 'Số dư cuối kỳ - Chi', width: { wch: 18 }, style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } } },
      ],
      data:
        rawData.map((item, index) => {
          const opening = Number(item?.opening_total) || 0;
          const closing = Number(item?.closing_total) || 0;
          const phatSinhThu = Number(item?.payslips_opening) || 0; // giữ nguyên logic hiển thị
          const phatSinhChi = Number(item?.payslips_period) || 0;

          return [
            { value: String(index + 1) },
            { value: item?.name || '' },
            {
              value: opening > 0 ? opening : '',
              style: { numFmt: '#,##0' },
            },
            {
              value: opening < 0 ? Math.abs(opening) : '',
              style: { numFmt: '#,##0' },
            },
            {
              value: phatSinhThu !== 0 ? phatSinhThu : '',
              style: { numFmt: '#,##0' },
            },
            {
              value: phatSinhChi !== 0 ? phatSinhChi : '',
              style: { numFmt: '#,##0' },
            },
            {
              value: closing > 0 ? closing : '',
              style: { numFmt: '#,##0' },
            },
            {
              value: closing < 0 ? Math.abs(closing) : '',
              style: { numFmt: '#,##0' },
            },
          ];
        }) || [],
    }
  ];

  // Lấy tổng cộng từ rTotal (theo đúng hiển thị)
  const totalOpening = Number(rTotal?.opening_total) || 0;
  const totalPhatSinhThu = Number(rTotal?.payslips_opening) || 0;
  const totalPhatSinhChi = Number(rTotal?.payslips_period) || 0;
  const totalClosing = Number(rTotal?.closing_total) || 0;

  // Thêm dòng tổng cộng
  if (multiDataSet[0].data.length > 0) {
    multiDataSet[0].data.push([
      { value: '' },
      { value: 'Tổng cộng' },
      {
        value: totalOpening > 0 ? totalOpening : '',
        style: { numFmt: '#,##0', font: { bold: true } },
      },
      {
        // Theo giao diện hiện tại không hiển thị tổng âm, để trống
        value: totalOpening < 0 ? Math.abs(totalOpening) : '',
        style: { numFmt: '#,##0', font: { bold: true } },
      },
      {
        value: totalPhatSinhThu !== 0 ? totalPhatSinhThu : '',
        style: { numFmt: '#,##0', font: { bold: true } },
      },
      {
        value: totalPhatSinhChi !== 0 ? totalPhatSinhChi : '',
        style: { numFmt: '#,##0', font: { bold: true } },
      },
      {
        value: totalClosing > 0 ? totalClosing : '',
        style: { numFmt: '#,##0', font: { bold: true } },
      },
      {
        // Theo giao diện hiện tại không hiển thị tổng âm, để trống
        value: totalClosing < 0 ? Math.abs(totalClosing) : '',
        style: { numFmt: '#,##0', font: { bold: true } },
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

    XLSX.utils.book_append_sheet(wb, ws, 'Tong hop ton quy');
  });

  XLSX.writeFile(wb, filename);
};
