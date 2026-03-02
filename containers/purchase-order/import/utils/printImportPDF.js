import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { applyCommonStyles, createFooter, createHeaderBlock, createTopLineBlock, ensureTimesNewRomanFonts, openPdf, PDF_THEME } from '@/utils/pdfCommon';

export const printImportPDF = async ({
  data,
  dataLang,
  dataSeting,
  isWarehousePropertiesEnabled,
  warehousePropertyLabels,
  showPrice = true,
}) => {
  if (!data) {
    console.error('printImportPDF: Không có dữ liệu');
    return;
  }

  // Đảm bảo font được load trước khi tạo PDF
  await ensureTimesNewRomanFonts();

  const dataCompany = dataSeting;
  const { PRIMARY, BORDER, TEXT, SUBTEXT, CODETEXT } = PDF_THEME;

  const formatNumber = number => {
    if (typeof number == 'string') {
      return formatNumberConfig(+number ? +number : 0, dataSeting);
    } else if (typeof number == 'undefined') {
      return formatNumberConfig(0, dataSeting);
    }
    return formatNumberConfig(number, dataSeting);
  };

  const formatMoney = number => {
    return formatNumber(number);
  };

  const marginDate = [0, 10, 0, 0];

  // Ngày hiện tại
  const currentDate = moment().format('[Ngày] DD [Tháng] MM [Năm] YYYY');

  const headerBlock = createHeaderBlock(dataCompany);

  const titleBlock = {
    text: 'PHIẾU NHẬP HÀNG',
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

  const infoBlock = {
    columns: [
      {
        width: '*',
        stack: [
          {
            text: [
              { text: `${dataLang?.import_supplier || 'import_supplier'}: `, style: 'pwInfoLabel' },
              { text: `${data?.supplier_name || ''}`, style: 'pwInfoValue' },
            ],
          },
          {
            text: [
              { text: `${dataLang?.import_from_note || 'import_from_note'}: `, style: 'pwInfoLabel' },
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

  const buildItemMetaLines = item => {
    const lines = [];
    if (item?.serial) lines.push(`Serial: ${item.serial}`);
    if (item?.lot) lines.push(`Lot: ${item.lot}`);
    if (item?.expiration_date) lines.push(`Date: ${formatMoment(item.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG)}`);
    // Thuộc tính động (giống deliveryReceipt: 153-160)
    const isMaterial = item?.item_type === 'material' || item?.type_item === 'material';
    if (isMaterial && Array.isArray(warehousePropertyLabels) && warehousePropertyLabels.length > 0) {
      warehousePropertyLabels.forEach(({ key, label }) => {
        if (!label) return;
        const value = item?.item?.[key] ?? item?.[key];
        if (!isWarehousePropertiesEnabled && (value == null || value === '')) return;
        lines.push(`${label}: ${value == null || value === '' ? '-' : value}`);
      });
    }
    return lines;
  };

  // Cấu trúc cột: STT | Mặt hàng | Biến thể | ĐVT | SL | Đơn Giá | % Thuế | Thành tiền | Ghi chú
  // Nếu không hiển thị giá thì bỏ các cột giá
  const tableWidths = showPrice
    ? ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']
    : ['auto', '*', 'auto', 'auto', 'auto', 'auto'];

  const headerRow = showPrice
    ? [
      pwTableHeaderCell('STT'),
      pwTableHeaderCell('Mặt hàng', 'left'),
      pwTableHeaderCell('Biến thể', 'left'),
      pwTableHeaderCell('ĐVT'),
      pwTableHeaderCell('SL'),
      pwTableHeaderCell('Đơn Giá', 'right'),
      pwTableHeaderCell('% Thuế', 'right'),
      pwTableHeaderCell('Thành tiền', 'right'),
      pwTableHeaderCell(`${dataLang?.import_from_note || 'import_from_note'}`, 'left'),
    ]
    : [
      pwTableHeaderCell('STT'),
      pwTableHeaderCell('Mặt hàng', 'left'),
      pwTableHeaderCell('Biến thể', 'left'),
      pwTableHeaderCell('ĐVT'),
      pwTableHeaderCell('SL'),
      pwTableHeaderCell(`${dataLang?.import_from_note || 'import_from_note'}`, 'left'),
    ];

  const totalAmount = data?.total_amount || 0;
  const totalPrice = data?.total_price || 0;
  const totalTax = data?.total_tax_price || data?.total_tax || 0;
  const totalDiscount = data?.total_discount || 0;
  const totalPriceAfterDiscount = data?.total_price_after_discount || (totalPrice - totalDiscount);

  const docDefinition = {
    info: {
      title: `Phiếu nhập hàng - ${data?.code}`,
      author: 'Foso',
      subject: 'Import Voucher',
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
            ...(Array.isArray(data?.items) && data.items.length > 0
              ? data.items.map((item, index) => {
                const variationText = item?.item?.product_variation || item?.product_variation || '';
                const unitText = item?.item?.unit_name || item?.unit_name || '';
                const qtyValue = item?.quantity || 0;
                const priceValue = item?.price || 0;
                const taxRate = item?.tax_rate || 0;
                const amountValue = item?.amount || 0;
                const metaLines = buildItemMetaLines(item);

                const productName = item?.item?.item_name || item?.item?.name || item?.name || '';
                const productCode = item?.item?.code || item?.code || '';

                const itemNameStack = [
                  { text: productName, fontSize: 10, margin: [0, 1, 0, 0] },
                  ...(productCode
                    ? [
                      {
                        text: productCode,
                        fontSize: 8,
                        italics: true,
                        color: CODETEXT,
                        margin: [0, 1, 0, 0],
                      },
                    ]
                    : []),
                  ...(metaLines.length
                    ? [
                      {
                        text: metaLines.join('\n'),
                        fontSize: 9,
                        italics: true,
                        margin: [0, 2, 0, 0],
                      },
                    ]
                    : []),
                ];

                if (showPrice) {
                  return [
                    {
                      text: `${index + 1}`,
                      alignment: 'center',
                      fontSize: 9,
                    },
                    {
                      stack: itemNameStack,
                    },
                    {
                      text: variationText,
                      alignment: 'left',
                      fontSize: 9,
                    },
                    {
                      text: unitText,
                      alignment: 'center',
                      fontSize: 9,
                    },
                    {
                      text: qtyValue != null ? `${formatNumber(+qtyValue)}` : '0',
                      alignment: 'center',
                      fontSize: 9,
                    },
                    {
                      text: priceValue != null ? `${formatMoney(+priceValue)}` : '0',
                      alignment: 'right',
                      fontSize: 9,
                    },
                    {
                      text: taxRate > 0 ? `${formatNumber(+taxRate)}%` : '0%',
                      alignment: 'right',
                      fontSize: 9,
                    },
                    {
                      text: amountValue != null ? `${formatMoney(+amountValue)}` : '0',
                      alignment: 'right',
                      fontSize: 9,
                    },
                    {
                      text: item?.note || '',
                      fontSize: 9,
                    },
                  ];
                } else {
                  return [
                    {
                      text: `${index + 1}`,
                      alignment: 'center',
                      fontSize: 9,
                    },
                    {
                      stack: itemNameStack,
                    },
                    {
                      text: variationText,
                      alignment: 'left',
                      fontSize: 9,
                    },
                    {
                      text: unitText,
                      alignment: 'center',
                      fontSize: 9,
                    },
                    {
                      text: qtyValue != null ? `${formatNumber(+qtyValue)}` : '0',
                      alignment: 'center',
                      fontSize: 9,
                    },
                    {
                      text: item?.note || '',
                      fontSize: 9,
                    },
                  ];
                }
              })
              : []),
            // Tổng kết - chỉ hiển thị khi có giá
            ...(showPrice ? [
              [
                {
                  text: 'Tổng tiền',
                  bold: true,
                  colSpan: showPrice ? 8 : 4,
                  fontSize: 10,
                  fillColor: '#FFFFFF',
                },
                ...(showPrice ? [null, null, null, null, null, null, null] : [null, null, null]),
                {
                  text: `${formatMoney(totalPrice)}`,
                  bold: true,
                  alignment: 'right',
                  fontSize: 10,
                  fillColor: '#FFFFFF',
                },
              ],
              [
                {
                  text: 'Tiền chiết khấu',
                  bold: true,
                  colSpan: showPrice ? 8 : 4,
                  fontSize: 10,
                  fillColor: '#FFFFFF',
                },
                ...(showPrice ? [null, null, null, null, null, null, null] : [null, null, null]),
                {
                  text: `${formatMoney(totalDiscount)}`,
                  bold: true,
                  alignment: 'right',
                  fontSize: 10,
                  fillColor: '#FFFFFF',
                },
              ],
              [
                {
                  text: 'Tiền sau chiết khấu',
                  bold: true,
                  colSpan: showPrice ? 8 : 4,
                  fontSize: 10,
                  fillColor: '#FFFFFF',
                },
                ...(showPrice ? [null, null, null, null, null, null, null] : [null, null, null]),
                {
                  text: `${formatMoney(totalPriceAfterDiscount)}`,
                  bold: true,
                  alignment: 'right',
                  fontSize: 10,
                  fillColor: '#FFFFFF',
                },
              ],
              [
                {
                  text: 'Tiền thuế',
                  bold: true,
                  colSpan: showPrice ? 8 : 4,
                  fontSize: 10,
                  fillColor: '#FFFFFF',
                },
                ...(showPrice ? [null, null, null, null, null, null, null] : [null, null, null]),
                {
                  text: `${formatMoney(totalTax)}`,
                  bold: true,
                  alignment: 'right',
                  fontSize: 10,
                  fillColor: '#FFFFFF',
                },
              ],
              [
                {
                  text: `${dataLang?.import_into_money || 'import_into_money'}`,
                  bold: true,
                  colSpan: showPrice ? 8 : 4,
                  fontSize: 11,
                  fillColor: '#FFFFFF',
                },
                ...(showPrice ? [null, null, null, null, null, null, null] : [null, null, null]),
                {
                  text: `${formatMoney(totalAmount)}`,
                  bold: true,
                  alignment: 'right',
                  fontSize: 11,
                  fillColor: '#FFFFFF',
                },
              ],
            ] : []),
            // Tổng mặt hàng và tổng số lượng - chỉ hiển thị khi in không giá
            ...(!showPrice ? [
              [
                {
                  text: `${dataLang?.production_warehouse_totalItem || 'production_warehouse_totalItem'}`,
                  bold: true,
                  colSpan: 2,
                  fontSize: 10,
                  fillColor: '#FFFFFF',
                },
                null,
                {
                  text: `${formatNumber(data?.items?.length || 0)}`,
                  bold: true,
                  alignment: 'right',
                  colSpan: 4,
                  fontSize: 10,
                  fillColor: '#FFFFFF',
                },
                null,
                null,
                null,
              ],
              [
                {
                  text: `${dataLang?.production_warehouse_sales || 'production_warehouse_sales'}`,
                  bold: true,
                  colSpan: 2,
                  fontSize: 10,
                  fillColor: '#FFFFFF',
                },
                null,
                {
                  text: `${formatNumber(data?.items?.reduce((total, item) => total + Number(item.quantity || 0), 0))}`,
                  bold: true,
                  alignment: 'right',
                  colSpan: 4,
                  fontSize: 10,
                  fillColor: '#FFFFFF',
                },
                null,
                null,
                null,
              ],
            ] : []),
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

  applyCommonStyles(docDefinition, TEXT, SUBTEXT, CODETEXT);

  try {
    openPdf(docDefinition);
  } catch (error) {
    console.error('Lỗi khi tạo PDF:', error);
    throw error;
  }
};

