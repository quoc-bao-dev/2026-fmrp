export const useExportExcel = displayedData => {
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
        {
          title: 'Ngày duyệt kho',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Ngày chứng từ',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Mã chứng từ',
          width: { wch: 20 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Diễn giải',
          width: { wch: 30 },
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
          title: 'Số lượng nhập',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Số lượng xuất',
          width: { wch: 15 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Số lượng tồn lũy kế',
          width: { wch: 20 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: [
        ...(displayedData?.map((item, index) => {
          // Xác định màu nền dựa trên loại dòng
          const backgroundColor = item._rowType === 'opening' ? 'F3F6FF' : item._rowType === 'closing' ? 'E8FFF3' : '';
          
          return [
            { 
              value: item._rowType ? '' : String(index),
              style: backgroundColor ? { fill: { fgColor: { rgb: backgroundColor } } } : {}
            },
            {
              value: item._rowType ? (item._rowType === 'opening' ? 'Tồn đầu kỳ' : 'Tồn cuối kỳ') : item.warehouseman_date ? new Date(item.warehouseman_date).toLocaleDateString('vi-VN') : '',
              style: backgroundColor ? { fill: { fgColor: { rgb: backgroundColor } } } : {}
            },
            {
              value: item.document_date ? new Date(item.document_date).toLocaleDateString('vi-VN') : '',
              style: backgroundColor ? { fill: { fgColor: { rgb: backgroundColor } } } : {}
            },
            { 
              value: item.document_code || '',
              style: backgroundColor ? { fill: { fgColor: { rgb: backgroundColor } } } : {}
            },
            {
              value: item._rowType ? '' : item.document_type || '',
              style: backgroundColor ? { fill: { fgColor: { rgb: backgroundColor } } } : {}
            },
            {
              value: item._rowType === 'opening' ? '' : Number(item.price || 0),
              style: { 
                numFmt: '#,##0',
                ...(backgroundColor ? { fill: { fgColor: { rgb: backgroundColor } } } : {})
              },
            },
            {
              value: item._rowType ? '' : Number(item.in_qty || 0),
              style: { 
                numFmt: '#,##0',
                ...(backgroundColor ? { fill: { fgColor: { rgb: backgroundColor } } } : {})
              },
            },
            {
              value: item._rowType ? '' : Number(item.out_qty || 0),
              style: { 
                numFmt: '#,##0',
                ...(backgroundColor ? { fill: { fgColor: { rgb: backgroundColor } } } : {})
              },
            },
            {
              value: Number(item.closing_qty || 0),
              style: { 
                numFmt: '#,##0',
                ...(backgroundColor ? { fill: { fgColor: { rgb: backgroundColor } } } : {})
              },
            },
          ];
        }) || []),
      ],
    },
  ];

  return { multiDataSet };
};
