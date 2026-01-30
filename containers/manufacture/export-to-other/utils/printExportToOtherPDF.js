import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { applyCommonStyles, createFooter, createHeaderBlock, createTopLineBlock, ensureTimesNewRomanFonts, openPdf, PDF_THEME } from '@/utils/pdfCommon';

export const printExportToOtherPDF = async ({ data, dataLang, dataSeting }) => {
  if (!data) return;
  await ensureTimesNewRomanFonts();

  const dataCompany = dataSeting;
  const { PRIMARY, BORDER, TEXT, SUBTEXT } = PDF_THEME;

  const formatNumber = number => {
    if (typeof number == 'string') {
      return formatNumberConfig(+number ? +number : 0, dataSeting);
    } else if (typeof number == 'undefined') {
      return formatNumberConfig(0, dataSeting);
    }
    return formatNumberConfig(number, dataSeting);
  };

  const marginDate = [0, 10, 0, 0];

  // Ngày hiện tại
  const currentDate = moment().format('[Ngày] DD [Tháng] MM [Năm] YYYY');

  const headerBlock = createHeaderBlock(dataCompany);

  const titleBlock = {
    text: (dataLang?.exportToOthe_exporttoOther || 'exportToOthe_exporttoOther').toUpperCase(),
    style: 'pwTitle',
    alignment: 'center',
    margin: [0, 12, 0, 8],
  };

  const metaRightBlock = {
    columns: [
      { width: '*', text: '' },
      {
        width: 220,
        stack: [
          {
            text: [
              { text: `${dataLang?.import_code_vouchers || 'import_code_vouchers'}: `, style: 'pwMetaLabel' },
              { text: `${data?.code || ''}`, style: 'pwMetaValue' },
            ],
          },
          {
            text: [
              { text: `${dataLang?.import_day_vouchers || 'import_day_vouchers'}: `, style: 'pwMetaLabel' },
              { text: `${data?.date ? formatMoment(data?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}`, style: 'pwMetaValue' },
            ],
          },
        ],
        alignment: 'right',
      },
    ],
    columnGap: 10,
    margin: [0, 0, 0, 10],
  };

  const objectText = (() => {
    const key = data?.object;
    if (!key) return '';
    return dataLang[key] || data?.object_text || key;
  })();

  const infoBlock = {
    columns: [
      {
        width: '*',
        stack: [
          {
            text: [
              { text: `${dataLang?.exportToOthe_warehouse || 'exportToOthe_warehouse'}: `, style: 'pwInfoLabel' },
              { text: `${data?.warehouse_name || ''}`, style: 'pwInfoValue' },
            ],
          },
          {
            text: [
              { text: `${dataLang?.purchase_order_note || 'purchase_order_note'}: `, style: 'pwInfoLabel' },
              { text: `${data?.note || ''}`, style: 'pwInfoValue' },
            ],
          },
        ],
      },
    ],
    columnGap: 20,
    margin: [0, 0, 0, 12],
  };

  const pwTableHeaderCell = (text, alignment = 'center') => ({
    text,
    alignment,
    bold: true,
    fontSize: 10,
    color: '#FFFFFF',
    fillColor: PRIMARY,
  });

  // Cấu trúc cột: STT | Mặt hàng | Thông tin | VTX | ĐVT | SL | Ghi chú
  const tableWidths = ['auto', '*', '*', 'auto', 'auto', 'auto', '*'];

  const headerRow = [
    pwTableHeaderCell('STT'),
    pwTableHeaderCell('Mặt hàng', 'left'),
    pwTableHeaderCell('Thông tin', 'left'),
    pwTableHeaderCell(
      'VTX',
      'left'
    ),
    pwTableHeaderCell('ĐVT'),
    pwTableHeaderCell('SL'),
    pwTableHeaderCell(`${dataLang?.import_from_note || 'import_from_note'}`, 'left'),
  ];

  const totalExportQty =
    Array.isArray(data?.items)
      ? data.items.reduce((total, item) => total + Number(item?.quantity || 0), 0)
      : 0;

  const docDefinition = {
    info: {
      title: `${dataLang?.exportToOthe_exporttoOther || 'exportToOthe_exporttoOther'} - ${data?.code}`,
      author: 'Foso',
      subject: 'Export To Other',
      keywords: 'PDF',
    },
    pageMargins: [40, 0, 40, 40],
    pageOrientation: 'portrait',
    defaultStyle: {
      font: 'TimesNewRoman',
    },
    footer: createFooter(PRIMARY),
    content: [
      createTopLineBlock(PRIMARY),
      headerBlock,
      titleBlock,
      metaRightBlock,
      infoBlock,
      {
        table: {
          widths: tableWidths,
          headerRows: 0,
          body: [
            headerRow,
            ...(data?.items?.length > 0
              ? data.items.map((item, index) => {
                const nameStack = [
                  {
                    text: item?.item?.name ? item?.item?.name : '',
                    fontSize: 10,
                  },
                ];

                const infoStack = [];

                infoStack.push({
                  text: `Biến thể: ${item?.item?.product_variation || '(NONE)'}`,
                  fontSize: 9,
                });

                if (item.lot) {
                  infoStack.push({
                    text: [
                      { text: 'Lot: ', fontSize: 9 },
                      { text: item.lot, fontSize: 9 },
                    ],
                  });
                }

                if (item.expiration_date) {
                  infoStack.push({
                    text: [
                      { text: 'Date: ', fontSize: 9 },
                      {
                        text: formatMoment(item.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG),
                        fontSize: 8.5,
                      },
                    ],
                  });
                }

                const unitText = item?.item?.unit_name || '';
                const qtyValue = item?.quantity;

                return [
                  {
                    text: `${index + 1}`,
                    alignment: 'center',
                    fontSize: 9,
                  },
                  {
                    stack: nameStack,
                  },
                  {
                    stack: infoStack,
                  },
                  {
                    text: item?.warehouse_location?.location_name || '',
                    fontSize: 9,
                    alignment: 'left',
                  },
                  {
                    text: unitText,
                    alignment: 'center',
                    fontSize: 9,
                  },
                  {
                    text: qtyValue != null ? `${formatNumber(+qtyValue)}` : '',
                    alignment: 'center',
                    fontSize: 9,
                  },
                  {
                    text: item?.note ? item?.note : '',
                    fontSize: 9,
                  },
                ];
              })
              : []),
            [
              {
                text: `${dataLang?.production_warehouse_totalItem || 'production_warehouse_totalItem'}`,
                bold: true,
                colSpan: 2,
                fontSize: 10,
                fillColor: '#F8FAFC',
              },
              '',
              {
                text: `${formatNumber(data?.items?.length || 0)}`,
                bold: true,
                alignment: 'right',
                colSpan: tableWidths.length - 2,
                fontSize: 10,
                fillColor: '#F8FAFC',
              },
              ...Array(tableWidths.length - 3).fill(''),
            ],
            [
              {
                text: 'Tổng SL xuất kho',
                bold: true,
                colSpan: 2,
                fontSize: 10,
                fillColor: '#F8FAFC',
              },
              '',
              {
                text: `${formatNumber(totalExportQty)}`,
                bold: true,
                alignment: 'right',
                colSpan: tableWidths.length - 2,
                fontSize: 10,
                fillColor: '#F8FAFC',
              },
              ...Array(tableWidths.length - 3).fill(''),
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
      { style: 'dateTexts', text: `${currentDate}`, alignment: 'right', margin: marginDate },
      {
        columns: [
          {
            width: '33%',
            stack: [
              {
                text: '',
                style: 'dateText',
                alignment: 'center',
                fontSize: 10,
              },
              {
                text: `${dataLang?.PDF_Deliver || 'PDF_Deliver'}`,
                style: 'signatureText',
                alignment: 'center',
                fontSize: 10,
                bold: true,
              },
              {
                text: `(${dataLang?.PDF_sign || 'PDF_sign'})`,
                style: 'signatureText',
                alignment: 'center',
                fontSize: 10,
              },
            ],
          },
          {
            width: '33%',
            stack: [
              {
                text: '',
                style: 'dateText',
                alignment: 'center',
                fontSize: 10,
              },
              {
                text: `${dataLang?.PDF_Receiver || 'PDF_Receiver'}`,
                style: 'signatureText',
                alignment: 'center',
                fontSize: 10,
                bold: true,
              },
              {
                text: `(${dataLang?.PDF_sign || 'PDF_sign'})`,
                style: 'signatureText',
                alignment: 'center',
                fontSize: 10,
              },
            ],
          },
          {
            width: '33%',
            stack: [
              {
                text: '',
                style: 'dateText',
                alignment: 'center',
                fontSize: 10,
              },
              {
                text: `${dataLang?.PDF_Stocker || 'PDF_Stocker'}`,
                style: 'signatureText',
                alignment: 'center',
                fontSize: 10,
                bold: true,
              },
              {
                text: `(${dataLang?.PDF_sign || 'PDF_sign'})`,
                style: 'signatureText',
                alignment: 'center',
                fontSize: 10,
              },
            ],
          },
        ],
        columnGap: 2,
      },
    ],
    dontBreakRows: true,
    images: {
      logo: {
        url: `${dataCompany?.company_logo}`,
      },
    },
  };

  applyCommonStyles(docDefinition, TEXT, SUBTEXT);
  openPdf(docDefinition);
};


