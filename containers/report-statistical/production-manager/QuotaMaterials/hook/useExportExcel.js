import formatNumber from '@/utils/helpers/formatnumber';

export const useExportExcel = dataReportBom => {
  const multiDataSet = [
    {
      columns: [
        {
          title: 'STT',
          width: { wch: 5 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Mã nguyên vật liệu',
          width: { wch: 20 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Tên nguyên vật liệu',
          width: { wch: 25 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Loại',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Biến thể',
          width: { wch: 30 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Đơn vị',
          width: { wch: 15 },
          style: {
            font: { bold: true },
          },
        },
        {
          title: 'Số lượng định mức',
          width: { wch: 20 },
          style: {
            font: { bold: true },
          },
        },
      ],
      data: [
        ...(dataReportBom?.map((item, index) => [
          {
            value: item.displayIndex,
            style: item.isMainProduct
              ? {
                  font: { bold: true },
                  fill: { fgColor: { rgb: 'E6F3FF' } },
                }
              : {},
          },
          {
            value: item.material_code || '',
            style: item.isMainProduct
              ? {
                  font: { bold: true },
                  fill: { fgColor: { rgb: 'E6F3FF' } },
                }
              : {},
          },
          {
            value: item.material_name || '',
            style: item.isMainProduct
              ? {
                  font: { bold: true },
                  fill: { fgColor: { rgb: 'E6F3FF' } },
                }
              : {},
          },
          {
            value: item.material_type || '',
            style: item.isMainProduct
              ? {
                  font: { bold: true },
                  fill: { fgColor: { rgb: 'E6F3FF' } },
                }
              : {},
          },
          {
            value: item.variant_name || '',
            style: item.isMainProduct
              ? {
                  font: { bold: true },
                  fill: { fgColor: { rgb: 'E6F3FF' } },
                }
              : {},
          },
          {
            value: item.unit_name || '',
            style: item.isMainProduct
              ? {
                  font: { bold: true },
                  fill: { fgColor: { rgb: 'E6F3FF' } },
                }
              : {},
          },
          {
            value: item.quota_quantity ? String(formatNumber(Number(item.quota_quantity))) : '0',
            style: item.isMainProduct
              ? {
                  font: { bold: true },
                  fill: { fgColor: { rgb: 'E6F3FF' } },
                }
              : {},
          },
        ]) || []),
      ],
    },
  ];

  return { multiDataSet };
};
