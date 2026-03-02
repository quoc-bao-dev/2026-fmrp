import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { applyCommonStyles, createFooter, createHeaderBlock, createTopLineBlock, ensureTimesNewRomanFonts, openPdf, PDF_THEME } from '@/utils/pdfCommon';

export const printInternalPlanPDF = async ({ data, dataLang, dataSeting }) => {
  if (!data) {
    console.error('printInternalPlanPDF: Không có dữ liệu');
    return;
  }

  await ensureTimesNewRomanFonts();

  const dataCompany = dataSeting;
  const { PRIMARY, BORDER, TEXT, SUBTEXT, CODETEXT } = PDF_THEME;

  const internalPlans = data?.internalPlans || {};
  const items = Array.isArray(data?.internalPlansItems) ? data.internalPlansItems : [];

  const formatNumber = number => {
    if (typeof number === 'string') return formatNumberConfig(+number ? +number : 0, dataSeting);
    if (typeof number === 'undefined' || number == null) return formatNumberConfig(0, dataSeting);
    return formatNumberConfig(number, dataSeting);
  };

  const currentDate = moment().format('[Ngày] DD [Tháng] MM [Năm] YYYY');

  const headerBlock = createHeaderBlock(dataCompany);

  const titleBlock = {
    text: 'KẾ HOẠCH NỘI BỘ',
    style: 'pwTitle',
    alignment: 'center',
    margin: [0, 12, 0, 8],
  };

  const metaRightBlock = {
    columns: [
      { width: '*', text: '' },
      {
        width: 240,
        stack: [
          {
            text: [
              { text: `${dataLang?.import_code_vouchers || 'Mã chứng từ'}: `, style: 'pwMetaLabel' },
              { text: `${internalPlans?.reference_no || ''}`, style: 'pwMetaValue' },
            ],
          },
          {
            text: [
              { text: `${dataLang?.import_day_vouchers || 'Ngày chứng từ'}: `, style: 'pwMetaLabel' },
              { text: `${internalPlans?.date ? formatMoment(internalPlans.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}`, style: 'pwMetaValue' },
            ],
          },
        ],
        alignment: 'right',
      },
    ],
    columnGap: 10,
    margin: [0, 0, 0, 10],
  };

  const infoBlock = {
    columns: [
      {
        width: '*',
        stack: [
          {
            text: [
              { text: `${dataLang?.internal_plan_name || 'Tên kế hoạch'}: `, style: 'pwInfoLabel' },
              { text: `${internalPlans?.plan_name || ''}`, style: 'pwInfoValue' },
            ],
          },
          {
            text: [
              { text: `${dataLang?.import_from_note || 'Ghi chú'}: `, style: 'pwInfoLabel' },
              { text: `${internalPlans?.note || ''}`, style: 'pwInfoValue' },
            ],
          },
        ],
      },
    ],
    columnGap: 20,
    margin: [0, 0, 0, 12],
  };

  const tableHeaderCell = (text, alignment = 'center') => ({
    text,
    alignment,
    bold: true,
    fontSize: 10,
    color: '#FFFFFF',
    fillColor: PRIMARY,
  });

  const totalQty = internalPlans?.total_quantity != null
    ? Number(internalPlans.total_quantity || 0)
    : items.reduce((sum, it) => sum + Number(it?.quantity || 0), 0);

  const totalItems = items.length;

  const docDefinition = {
    info: {
      title: `Kế hoạch nội bộ - ${internalPlans?.reference_no || ''}`,
      author: 'Foso',
      subject: 'Internal Plan',
      keywords: 'PDF',
    },
    pageMargins: [40, 0, 40, 40],
    pageOrientation: 'portrait',
    defaultStyle: { font: 'TimesNewRoman' },
    footer: createFooter(PRIMARY),
    content: [
      createTopLineBlock(PRIMARY),
      headerBlock,
      titleBlock,
      metaRightBlock,
      infoBlock,
      {
        table: {
          widths: ['auto', '*', 'auto', 'auto', 'auto', '*'],
          headerRows: 0,
          body: [
            [
              tableHeaderCell('STT'),
              tableHeaderCell(dataLang?.import_detail_items || 'Mặt hàng', 'left'),
              tableHeaderCell(dataLang?.purchase_variant || 'Biến thể', 'left'),
              tableHeaderCell('ĐVT'),
              tableHeaderCell(dataLang?.import_from_quantity || 'SL'),
              tableHeaderCell(dataLang?.import_from_note || 'Ghi chú', 'left'),
            ],
            ...items.map((item, index) => {
              const itemName = item?.item_name || '';
              const itemCode = item?.item_code || item?.code || '';
              const variation = item?.product_variation || '';
              const unit = item?.unit_name || '';
              const qty = item?.quantity || 0;
              const note = item?.note_item || '';

              const itemNameStack = [
                { text: itemName, fontSize: 10, margin: [0, 1, 0, 0] },
                ...(itemCode
                  ? [
                    {
                      text: itemCode,
                      fontSize: 9,
                      color: CODETEXT,
                      margin: [0, 1, 0, 0],
                    },
                  ]
                  : []),
              ];

              return [
                { text: `${index + 1}`, alignment: 'center', fontSize: 9 },
                { stack: itemNameStack },
                { text: variation, alignment: 'left', fontSize: 9 },
                { text: unit, alignment: 'center', fontSize: 9 },
                { text: `${formatNumber(+qty)}`, alignment: 'center', fontSize: 9 },
                { text: note, alignment: 'left', fontSize: 9 },
              ];
            }),
            [
              {
                text: dataLang?.production_warehouse_totalItem || 'Tổng mặt hàng',
                bold: true,
                colSpan: 5,
                fontSize: 10,
                fillColor: '#FFFFFF',
                alignment: 'left',
              },
              null,
              null,
              null,
              null,
              {
                text: `${formatNumber(totalItems)}`,
                bold: true,
                alignment: 'right',
                fontSize: 10,
                fillColor: '#FFFFFF',
              },
            ],
            [
              {
                text: dataLang?.internal_plan_total || 'Tổng số lượng',
                bold: true,
                colSpan: 5,
                fontSize: 10,
                fillColor: '#FFFFFF',
                alignment: 'left',
              },
              null,
              null,
              null,
              null,
              {
                text: `${formatNumber(totalQty)}`,
                bold: true,
                alignment: 'right',
                fontSize: 10,
                fillColor: '#FFFFFF',
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => BORDER,
          vLineColor: () => BORDER,
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
        margin: [0, 0, 0, 6],
      },
      { style: 'dateTexts', text: `${currentDate}`, alignment: 'right', margin: [0, 10, 0, 10] },
      {
        columns: [
          {
            width: '33%',
            stack: [
              { text: 'Giám đốc', alignment: 'center', fontSize: 10, bold: true },
              { text: `(${dataLang?.PDF_sign || 'Ký, ghi rõ họ tên'})`, alignment: 'center', fontSize: 10 },
              { text: '\n\n\n', fontSize: 10 },
            ],
          },
          {
            width: '33%',
            stack: [
              { text: 'Người lập phiếu', alignment: 'center', fontSize: 10, bold: true },
              { text: `(${dataLang?.PDF_sign || 'Ký, ghi rõ họ tên'})`, alignment: 'center', fontSize: 10 },
              { text: '\n\n\n', fontSize: 10 },
            ],
          },
          {
            width: '33%',
            stack: [
              { text: 'Kế toán trưởng', alignment: 'center', fontSize: 10, bold: true },
              { text: `(${dataLang?.PDF_sign || 'Ký, ghi rõ họ tên'})`, alignment: 'center', fontSize: 10 },
              { text: '\n\n\n', fontSize: 10 },
            ],
          },
        ],
        columnGap: 2,
      },
    ],
    images: {
      logo: {
        url: `${dataCompany?.company_logo}`,
      },
    },
  };

  applyCommonStyles(docDefinition, TEXT, SUBTEXT, CODETEXT);

  try {
    openPdf(docDefinition);
  } catch (error) {
    console.error('Lỗi khi tạo PDF internal_plan:', error);
    throw error;
  }
};

