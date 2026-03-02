import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { applyCommonStyles, createFooter, createHeaderBlock, createTopLineBlock, ensureTimesNewRomanFonts, openPdf, PDF_THEME } from '@/utils/pdfCommon';

export const printDeliveryReceiptPDF = async ({
  data,
  dataLang,
  dataSeting,
  dataMaterialExpiry,
  dataProductExpiry,
  dataProductSerial,
  isWarehousePropertiesEnabled,
  warehousePropertyLabels,
  showPrice = true,
}) => {
  if (!data) {
    console.error('printDeliveryReceiptPDF: Không có dữ liệu');
    return;
  }

  await ensureTimesNewRomanFonts();

  const dataCompany = dataSeting;
  const { PRIMARY, BORDER, TEXT, SUBTEXT, CODETEXT } = PDF_THEME;

  const formatNumber = number => {
    if (typeof number === 'string') {
      return formatNumberConfig(+number ? +number : 0, dataSeting);
    }
    if (typeof number === 'undefined' || number === null) {
      return formatNumberConfig(0, dataSeting);
    }
    return formatNumberConfig(number, dataSeting);
  };

  const formatMoney = number => formatNumber(number);

  const currentDate = moment().format('[Ngày] DD [Tháng] MM [Năm] YYYY');
  const headerBlock = createHeaderBlock(dataCompany);

  const titleBlock = {
    text: 'PHIẾU GIAO HÀNG',
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
              { text: `${dataLang?.import_code_vouchers || 'Mã phiếu'}: `, style: 'pwMetaLabel' },
              { text: `${data?.reference_no || ''}`, style: 'pwMetaValue' },
            ],
          },
          {
            text: [
              { text: `${dataLang?.import_day_vouchers || 'Ngày'}: `, style: 'pwMetaLabel' },
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

  const customerName = data?.customer_name || data?.client_name || '';
  const addressText = data?.name_address_delivery || '';
  const orderNo = data?.reference_no_order || '';

  const infoBlock = {
    columns: [
      {
        width: '*',
        stack: [
          {
            text: [
              { text: 'Khách hàng: ', style: 'pwInfoLabel' },
              { text: `${customerName}`, style: 'pwInfoValue' },
            ],
          },
          ...(addressText
            ? [
              {
                text: [
                  { text: 'Địa chỉ giao hàng: ', style: 'pwInfoLabel' },
                  { text: `${addressText}`, style: 'pwInfoValue' },
                ],
              },
            ]
            : []),
          ...(orderNo
            ? [
              {
                text: [
                  { text: 'Số đơn hàng: ', style: 'pwInfoLabel' },
                  { text: `${orderNo}`, style: 'pwInfoValue' },
                ],
              },
            ]
            : []),
          {
            text: [
              { text: `${dataLang?.serviceVoucher_note || 'Ghi chú'}: `, style: 'pwInfoLabel' },
              { text: `${data?.note ?? ''}`, style: 'pwInfoValue' },
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

  const items = Array.isArray(data?.items) ? data.items : [];

  const totalItems = items.length;
  const totalQty = items.reduce((acc, it) => acc + Number(it?.quantity || 0), 0);
  const totalPrice = data?.total_price || data?.grand_total || 0;
  const totalTax = data?.total_tax_price || data?.total_tax || 0;
  const totalDiscount =
    data?.total_discount ||
    data?.total_discount_items ||
    data?.total_discount_direct_items ||
    data?.total_discount_percent_items ||
    0;
  const totalPriceAfterDiscount = data?.total_price_after_discount || (totalPrice - totalDiscount);
  const totalAmount = data?.total_amount || data?.grand_total || 0;

  const buildItemMetaLines = item => {
    const lines = [];
    if (item?.serial) lines.push(`Serial: ${item.serial}`);
    if (item?.lot) lines.push(`Lot: ${item.lot}`);
    if (item?.expiration_date) lines.push(`Date: ${formatMoment(item.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG)}`);
    if (item?.type_item === 'material' && Array.isArray(warehousePropertyLabels) && warehousePropertyLabels.length > 0) {
      warehousePropertyLabels.forEach(({ key, label }) => {
        if (!label) return;
        const value = item?.item?.[key] ?? item?.[key];
        if (!isWarehousePropertiesEnabled && (value == null || value === '')) return;
        lines.push(`${label}: ${value == null || value === '' ? '-' : value}`);
      });
    }
    return lines;
  };

  const table = (() => {
    if (showPrice) {
      // STT | Mặt hàng (kèm Lot/Date/Serial) | Biến thể | ĐVT | SL | Đơn Giá | % Thuế | Thành tiền
      const widths = ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];
      const headerRow = [
        pwTableHeaderCell('STT'),
        pwTableHeaderCell('Mặt hàng', 'left'),
        pwTableHeaderCell('Biến thể', 'left'),
        pwTableHeaderCell('ĐVT'),
        pwTableHeaderCell('SL'),
        pwTableHeaderCell('Đơn Giá', 'right'),
        pwTableHeaderCell('% Thuế', 'right'),
        pwTableHeaderCell('Thành tiền', 'right'),
      ];

      const bodyRows = items.map((item, index) => {
        const qtyValue = item?.quantity || 0;
        const priceValue = item?.price_after_discount || item?.price || 0;
        const taxRate = item?.tax_rate_item || item?.tax_rate || 0;
        const amountValue = item?.amount || 0;
        const variationText = item?.item?.product_variation || '';
        const metaLines = buildItemMetaLines(item);
        const productName = item?.item?.item_name || item?.item?.name || '';
        const productCode = item?.item?.code || '';

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

        return [
          { text: `${index + 1}`, alignment: 'center', fontSize: 9 },
          { stack: itemNameStack },
          { text: variationText, alignment: 'left', fontSize: 9, italics: true },
          { text: item?.item?.unit_name || '', alignment: 'center', fontSize: 9 },
          { text: `${formatNumber(+qtyValue)}`, alignment: 'center', fontSize: 9 },
          { text: `${formatMoney(+priceValue)}`, alignment: 'right', fontSize: 9 },
          { text: taxRate ? `${formatNumber(+taxRate)}%` : '0%', alignment: 'right', fontSize: 9 },
          { text: `${formatMoney(+amountValue)}`, alignment: 'right', fontSize: 9 },
        ];
      });

      const totalRowsPrice = [
        [
          { text: 'Tổng tiền', bold: true, colSpan: 7, fontSize: 10, alignment: 'left' },
          null,
          null,
          null,
          null,
          null,
          null,
          { text: `${formatMoney(totalPrice)}`, bold: true, alignment: 'right', fontSize: 10 },
        ],
        [
          { text: 'Tiền chiết khấu', bold: true, colSpan: 7, fontSize: 10, alignment: 'left' },
          null,
          null,
          null,
          null,
          null,
          null,
          { text: `${formatMoney(totalDiscount)}`, bold: true, alignment: 'right', fontSize: 10 },
        ],
        [
          { text: 'Tiền sau chiết khấu', bold: true, colSpan: 7, fontSize: 10, alignment: 'left' },
          null,
          null,
          null,
          null,
          null,
          null,
          { text: `${formatMoney(totalPriceAfterDiscount)}`, bold: true, alignment: 'right', fontSize: 10 },
        ],
        [
          { text: 'Tiền thuế', bold: true, colSpan: 7, fontSize: 10, alignment: 'left' },
          null,
          null,
          null,
          null,
          null,
          null,
          { text: `${formatMoney(totalTax)}`, bold: true, alignment: 'right', fontSize: 10 },
        ],
        [
          { text: 'Thành tiền', bold: true, colSpan: 7, fontSize: 11, alignment: 'left' },
          null,
          null,
          null,
          null,
          null,
          null,
          { text: `${formatMoney(totalAmount)}`, bold: true, alignment: 'right', fontSize: 11 },
        ],
      ];

      return {
        table: {
          widths,
          headerRows: 0,
          body: [headerRow, ...bodyRows, ...totalRowsPrice],
        },
      };
    }

    // Không giá: STT | Mặt hàng (kèm Lot/Date/Serial) | Biến thể | ĐVT | SL | Ghi chú
    const widths = ['auto', '*', 'auto', 'auto', 'auto', 'auto'];
    const headerRow = [
      pwTableHeaderCell('STT'),
      pwTableHeaderCell('Mặt hàng', 'left'),
      pwTableHeaderCell('Biến thể', 'left'),
      pwTableHeaderCell('ĐVT'),
      pwTableHeaderCell('SL'),
      pwTableHeaderCell('Ghi chú', 'left'),
    ];

    const bodyRows = items.map((item, index) => {
      const qtyValue = item?.quantity || 0;
      const variationText = item?.item?.product_variation || '';
      const noteText = item?.note_item ?? item?.note ?? item?.noteItem ?? '';
      const metaLines = buildItemMetaLines(item);
      const productName = item?.item?.item_name || item?.item?.name || '';
      const productCode = item?.item?.code || '';

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

      return [
        { text: `${index + 1}`, alignment: 'center', fontSize: 9 },
        { stack: itemNameStack },
        { text: variationText, alignment: 'left', fontSize: 9, italics: true },
        { text: item?.item?.unit_name || '', alignment: 'center', fontSize: 9 },
        { text: `${formatNumber(+qtyValue)}`, alignment: 'center', fontSize: 9 },
        { text: noteText || '', fontSize: 9 },
      ];
    });

    const totalRowsNoPrice = [
      [
        { text: 'Tổng mặt hàng', bold: true, colSpan: 5, fontSize: 10, alignment: 'left' },
        null,
        null,
        null,
        null,
        { text: `${formatNumber(totalItems)}`, bold: true, alignment: 'right', fontSize: 10 },
      ],
      [
        { text: 'Tổng số lượng', bold: true, colSpan: 5, fontSize: 10, alignment: 'left' },
        null,
        null,
        null,
        null,
        { text: `${formatNumber(totalQty)}`, bold: true, alignment: 'right', fontSize: 10 },
      ],
    ];

    return {
      table: {
        widths,
        headerRows: 0,
        body: [headerRow, ...bodyRows, ...totalRowsNoPrice],
      },
    };
  })();

  const amountWordLine =
    showPrice
      ? {
        text: [
          { text: 'Thành tiền bằng chữ: ', bold: true, fontSize: 10 },
          { text: data?.total_amount_word || 'Không', fontSize: 10 },
        ],
        alignment: 'left',
        margin: [0, 0, 0, 6],
      }
      : null;

  const docDefinition = {
    info: {
      title: `Phiếu Giao Hàng - ${data?.reference_no || ''}`,
      author: 'Foso',
      subject: 'Delivery Receipt',
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
        ...table,
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
      ...(amountWordLine ? [amountWordLine] : []),
      { style: 'dateTexts', text: `${currentDate}`, alignment: 'right', margin: [0, 10, 0, 0] },
      {
        columns: [
          {
            width: '33%',
            stack: [
              { text: '', style: 'dateText', alignment: 'center', fontSize: 10 },
              { text: 'Người giao', style: 'signatureText', alignment: 'center', fontSize: 10, bold: true },
              { text: `(${dataLang?.PDF_sign || 'PDF_sign'})`, style: 'signatureText', alignment: 'center', fontSize: 10 },
            ],
          },
          {
            width: '33%',
            stack: [
              { text: '', style: 'dateText', alignment: 'center', fontSize: 10 },
              { text: 'Người nhận', style: 'signatureText', alignment: 'center', fontSize: 10, bold: true },
              { text: `(${dataLang?.PDF_sign || 'PDF_sign'})`, style: 'signatureText', alignment: 'center', fontSize: 10 },
            ],
          },
          {
            width: '33%',
            stack: [
              { text: '', style: 'dateText', alignment: 'center', fontSize: 10 },
              { text: 'Thủ kho', style: 'signatureText', alignment: 'center', fontSize: 10, bold: true },
              { text: `(${dataLang?.PDF_sign || 'PDF_sign'})`, style: 'signatureText', alignment: 'center', fontSize: 10 },
            ],
          },
        ],
        columnGap: 2,
      },
    ],
    dontBreakRows: true,
    images: {
      logo: { url: `${dataCompany?.company_logo}` },
    },
  };

  applyCommonStyles(docDefinition, TEXT, SUBTEXT, CODETEXT);
  openPdf(docDefinition);
};


