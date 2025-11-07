import moment from 'moment'

export const useExportExcel = (dataReportImport, hasProductExpiry, hasMaterialExpiry, hasProductSerial) => {
  const showInfoColumn = hasProductExpiry || hasMaterialExpiry || hasProductSerial;

  const baseColumns = [
    {
      title: 'STT',
      width: { wch: 5 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'Ngày chứng từ',
      width: { wch: 20 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'Mã chứng từ',
      width: { wch: 15 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'Nhà cung cấp',
      width: { wch: 30 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'Mã mặt hàng',
      width: { wch: 15 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'Mặt hàng',
      width: { wch: 40 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
  ];

  const infoColumn = showInfoColumn
    ? [
        {
          title: 'Thông tin',
          width: { wch: 30 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ]
    : [];

  const remainingColumns = [
    {
      title: 'ĐVT',
      width: { wch: 10 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'Chi nhánh',
      width: { wch: 20 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'Vị trí',
      width: { wch: 20 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'SL',
      width: { wch: 10 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'Đơn giá',
      width: { wch: 15 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: '%CK',
      width: { wch: 10 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'Đơn giá SCK',
      width: { wch: 15 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'Thuế',
      width: { wch: 10 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'Thành tiền',
      width: { wch: 20 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
    {
      title: 'Ghi chú',
      width: { wch: 30 },
      style: {
        fill: { fgColor: { rgb: 'C7DFFB' } },
        font: { bold: true },
      },
    },
  ];

  const columns = [...baseColumns, ...infoColumn, ...remainingColumns];

  const getInfoValue = (item) => {
    if (!showInfoColumn) return '';
    
    const infoParts = [];
    if (item.lot) infoParts.push(`LOT: ${item.lot}`);
    if (item.expiration_date) infoParts.push(`Date: ${moment(item.expiration_date).format('DD/MM/YYYY')}`);
    if (item.serial) infoParts.push(`Serial: ${item.serial}`);
    
    return infoParts.join('\n');
  };

  const multiDataSet = [
    {
      columns: columns,
      data: dataReportImport?.rResult?.map((item, index) => {
        const baseData = [
          { value: String(index + 1) },
          { value: item.date ? moment(item.date).format('DD/MM/YYYY HH:mm:ss') : '' },
          { value: item.code_import || '' },
          { value: item.name_supplier || '' },
          { value: item.item_code || '' },
          { value: item.item_name + (item.item_variation ? '\n' + item.item_variation : '') || '' },
        ];

        const infoData = showInfoColumn ? [{ value: getInfoValue(item) }] : [];

        const remainingData = [
          { value: item.unit_name || '' },
          { value: item.branch_name || '' },
          { value: item.warehouse_name || '' },
          { value: item.quantity ? Number(item.quantity) : 0, style: { numFmt: '#,##0' } },
          {
            value: item.price ? Number(item.price) : 0,
            style: { numFmt: '#,##0' },
          },
          { value: item.discount_percent ? String(item.discount_percent) + '%' : '0%' },
          {
            value: item.price_after_discount ? Number(item.price_after_discount) : 0,
            style: { numFmt: '#,##0' },
          },
          { value: item.tax_rate ? String(item.tax_rate) + '%' : '0%' },
          {
            value: item.amount ? Number(item.amount) : 0,
            style: { numFmt: '#,##0' },
          },
          { value: item.note || '' },
        ];

        return [...baseData, ...infoData, ...remainingData];
      }) || [],
    },
  ];

  return { multiDataSet };
}; 