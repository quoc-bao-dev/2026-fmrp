import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

/**
 * Tạo workbook Excel từ mảng dữ liệu
 * @param {Array} data - Mảng dữ liệu cần export
 * @param {Object} options - Các tùy chọn
 * @param {Array} options.headers - Tên các cột header
 * @param {Array} options.columns - Tên các key trong object để map vào cột
 * @param {String} options.sheetName - Tên sheet (default: "Sheet1")
 * @param {String} options.title - Tiêu đề của file (optional)
 * @param {Object} options.styles - Custom styles cho cells (optional)
 * @returns {XLSX.WorkBook} Workbook object
 */
export const createExcelFromArray = (data = [], options = {}) => {
  const { headers = [], columns = [], sheetName = 'Sheet1', title = null, styles = {} } = options;

  // Validate input
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }

  if (headers.length !== columns.length) {
    throw new Error('Headers and columns must have the same length');
  }

  // Tạo worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  let currentRow = 0;

  // Thêm title nếu có
  if (title) {
    worksheet['A1'] = { v: title, t: 's' };
    worksheet['!merges'] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: headers.length - 1 },
      },
    ];
    // Style cho title
    worksheet['A1'].s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { fgColor: { rgb: 'E7E6E6' } },
    };
    currentRow = 1;
  }

  // Thêm headers
  const headerRow = currentRow;
  headers.forEach((header, index) => {
    const cellAddress = XLSX.utils.encode_cell({ r: currentRow, c: index });
    worksheet[cellAddress] = { v: header, t: 's' };

    // Style cho header
    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      fill: { fgColor: { rgb: '4472C4' } },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };
  });
  currentRow++;

  // Thêm data rows
  data.forEach((item, rowIndex) => {
    columns.forEach((column, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: currentRow, c: colIndex });
      const value = item[column] !== undefined ? item[column] : '';

      // Xác định kiểu dữ liệu
      let cellType = 's'; // string
      if (typeof value === 'number') {
        cellType = 'n';
      } else if (value instanceof Date) {
        cellType = 'd';
      }

      worksheet[cellAddress] = { v: value, t: cellType };

      // Apply custom style nếu có
      if (styles[column]) {
        worksheet[cellAddress].s = styles[column];
      } else {
        // Default style
        worksheet[cellAddress].s = {
          alignment: { vertical: 'center', wrapText: true },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }
    });
    currentRow++;
  });

  // Set column widths (cap at 300px, wrap handles overflow)
  const MAX_WPX = 300;
  const AVG_CHAR_PX = 7; // approximate width per character
  const colWidths = headers.map((header, colIdx) => {
    // Find max content length in this column
    const maxLen = Math.max(String(header || '').length, ...data.map(row => String(row[columns[colIdx]] ?? '').length));
    // Convert to pixels and cap
    const wpx = Math.min(Math.max((maxLen + 2) * AVG_CHAR_PX, 80), MAX_WPX);
    return { wpx };
  });
  worksheet['!cols'] = colWidths;

  // Set row heights
  if (title) {
    worksheet['!rows'] = [{ hpt: 30 }, { hpt: 25 }];
  } else {
    worksheet['!rows'] = [{ hpt: 25 }];
  }

  // Tạo workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return workbook;
};

/**
 * Xử lý tạo và download file Excel
 * @param {Array} data - Mảng dữ liệu
 * @param {Object} options - Options cho createExcelFromArray
 * @param {String} filename - Tên file khi download (default: "export.xlsx")
 */
export const handleDownloadExcel = (data, options = {}, filename = 'export.xlsx') => {
  try {
    // Tạo workbook
    const workbook = createExcelFromArray(data, options);

    // Convert workbook to binary string
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    // Tạo blob
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Download file
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error creating Excel file:', error);
    throw error;
  }
};

/**
 * Tạo Excel template với cấu trúc đặc biệt: mỗi item trong data là một cột
 * Mỗi cột có 5 hàng: code, name, note (màu đỏ), items1, items2
 * @param {Array} data - Mảng dữ liệu, mỗi item có cấu trúc: { code, name, note, items1, items2 }
 * @param {Object} options - Các tùy chọn
 * @param {String} options.title - Tiêu đề của file (default: "File mẫu nhập Excel kiểm kê")
 * @param {String} options.sheetName - Tên sheet (default: "Template")
 * @param {Number} options.columnWidth - Độ rộng cột (default: 20)
 * @param {Boolean} options.showHeader - Hiển thị header row hay không (default: true)
 * @returns {XLSX.WorkBook} Workbook object
 */
export const createExcelTemplateFromColumns = (data = [], options = {}) => {
  const { title = 'File mẫu nhập Excel kiểm kê', sheetName = 'Template', columnWidth = 20, showHeader = false } = options;

  // Validate input
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }

  // Tạo dữ liệu dạng array of arrays để đảm bảo range được set đúng
  const rows = [];

  // Hàng 1: Title (sẽ merge sau)
  const titleRow = new Array(data.length).fill('');
  titleRow[0] = title;
  rows.push(titleRow);

  // Hàng 2: Headers (chỉ thêm nếu showHeader = true)
  if (showHeader) {
    const headerRow = data.map(item => item.name || '');
    rows.push(headerRow);
  }

  // Hàng dữ liệu: 5 hàng (code, name, note, items1, items2)
  const rowLabels = ['code', 'name', 'note', 'items1', 'items2'];
  rowLabels.forEach(label => {
    const dataRow = data.map(item => (item[label] !== undefined ? item[label] : ''));
    rows.push(dataRow);
  });

  // Tạo worksheet từ array of arrays
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Set merge cho title row
  worksheet['!merges'] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: data.length - 1 },
    },
  ];

  // Apply styles
  let currentRow = 0;

  // Style cho title row - sang trọng hơn
  data.forEach((item, index) => {
    const cellAddress = XLSX.utils.encode_cell({ r: currentRow, c: index });
    if (!worksheet[cellAddress]) {
      worksheet[cellAddress] = { v: '', t: 's' };
    }
    worksheet[cellAddress].s = {
      font: { bold: true, sz: 18, color: { rgb: '1F4E78' }, name: 'Arial' },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      fill: { fgColor: { rgb: 'E8EDF5' } }, // Màu xanh nhạt tinh tế hơn
      border: {
        top: { style: 'medium', color: { rgb: '000000' } },
        bottom: { style: 'medium', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };
  });
  currentRow++;

  // Style cho headers (chỉ nếu showHeader = true) - sang trọng hơn
  if (showHeader) {
    data.forEach((item, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: currentRow, c: index });
      if (!worksheet[cellAddress]) {
        worksheet[cellAddress] = { v: '', t: 's' };
      }
      worksheet[cellAddress].s = {
        font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' }, name: 'Arial' },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        fill: { fgColor: { rgb: '4A86C7' } }, // Màu xanh đậm tinh tế hơn
        border: {
          top: { style: 'medium', color: { rgb: '000000' } },
          bottom: { style: 'medium', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
      };
    });
    currentRow++;
  }

  // Style cho 5 hàng dữ liệu - sang trọng với alternating colors
  rowLabels.forEach((label, rowIndex) => {
    data.forEach((item, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: currentRow, c: colIndex });
      if (!worksheet[cellAddress]) {
        worksheet[cellAddress] = { v: '', t: 's' };
      }

      // Style cho hàng note (màu đỏ) - rowIndex === 2
      if (rowIndex === 2) {
        // Hàng note - màu đỏ với background nhạt tinh tế
        worksheet[cellAddress].s = {
          font: { sz: 10, color: { rgb: 'B71C1C' }, bold: true, name: 'Arial' },
          alignment: { horizontal: 'left', vertical: 'center', wrapText: true, indent: 1 },
          fill: { fgColor: { rgb: 'FFF5F5' } }, // Màu đỏ nhạt tinh tế hơn
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      } else {
        // Các hàng khác - phối màu nhạt, dễ đọc hơn
        // Hàng 2 & 3 (code, name) dùng màu nền nhạt (xanh nhẹ) cho đẹp và nổi khối
        // rowIndex: 0 => code, 1 => name, 3 => items1, 4 => items2
        let bgColor = 'FFFFFF';
        if (rowIndex === 0) bgColor = 'F3F8FF'; // xanh rất nhạt
        else if (rowIndex === 1) bgColor = 'F7FBFF'; // xanh rất nhạt (khác nhẹ)
        else bgColor = rowIndex % 2 === 0 ? 'FFFFFF' : 'FAFAFA';

        worksheet[cellAddress].s = {
          font: { sz: 10, color: { rgb: '2C2C2C' }, name: 'Arial' },
          alignment: { horizontal: 'left', vertical: 'center', wrapText: true, indent: 1 },
          fill: { fgColor: { rgb: bgColor } },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }
    });
    currentRow++;
  });

  // Set column widths - tự động điều chỉnh theo nội dung
  const MAX_WPX_TEMPLATE = 200;
  const AVG_CHAR_PX_TEMPLATE = 7;
  const colWidths = data.map(item => {
    const nameLength = (item.name || '').length;
    const sampleLength = Math.max((item.code || '').length, (item.name || '').length, (item.note || '').length, 15);
    const ch = Math.max(nameLength + 5, sampleLength + 3, columnWidth);
    const wpx = Math.min(Math.max(ch * AVG_CHAR_PX_TEMPLATE, 80), MAX_WPX_TEMPLATE);
    return { wpx };
  });
  worksheet['!cols'] = colWidths;

  // Set row heights: title, header (nếu có), và 5 hàng dữ liệu - cao hơn cho dễ đọc
  const rowHeights = [{ hpt: 35 }]; // title - cao hơn
  if (showHeader) {
    rowHeights.push({ hpt: 28 }); // header - cao hơn
  }
  // 5 hàng dữ liệu: code, name, note, items1, items2
  for (let i = 0; i < 5; i++) {
    // Hàng thứ 4 của sheet (khi không có header) tương ứng rowIndex=2 (note) => tăng chiều cao
    // Nếu có header, vẫn muốn note cao hơn để chứa hướng dẫn
    if (i === 2) rowHeights.push({ hpt: 44 });
    else rowHeights.push({ hpt: 22 });
  }
  worksheet['!rows'] = rowHeights;

  // Worksheet range (!ref) đã được set tự động bởi aoa_to_sheet
  // Không cần set lại vì aoa_to_sheet đã tính toán đúng range

  // Tạo workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return workbook;
};

/**
 * Xử lý tạo và download Excel template với cấu trúc đặc biệt
 * @param {Array} data - Mảng dữ liệu, mỗi item có cấu trúc: { code, name, note, items1, items2 }
 * @param {Object} options - Options cho createExcelTemplateFromColumns
 * @param {String} filename - Tên file khi download (default: "template_kiem_ke.xlsx")
 */
export const handleDownloadExcelTemplate = (data = [], options = {}, filename = 'template_kiem_ke.xlsx') => {
  try {
    // Tạo workbook
    const workbook = createExcelTemplateFromColumns(data, options);

    // Convert workbook to binary string
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    // Tạo blob
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Download file
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error creating Excel template:', error);
    throw error;
  }
};
