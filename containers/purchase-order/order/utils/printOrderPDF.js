import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { applyCommonStyles, createFooter, createHeaderBlock, createTopLineBlock, ensureTimesNewRomanFonts, openPdf, PDF_THEME } from '@/utils/pdfCommon';

export const printOrderPDF = async ({ data, dataLang, dataSeting }) => {
  if (!data) {
    console.error('printOrderPDF: Không có dữ liệu');
    return;
  }

  try {
    await ensureTimesNewRomanFonts();
  } catch (error) {
    console.error('Lỗi khi load font:', error);
    throw error;
  }

  const dataCompany = dataSeting;
  const { PRIMARY, BORDER, TEXT, SUBTEXT } = PDF_THEME;

  // Debug: Kiểm tra dữ liệu
  // console.log('printOrderPDF - data:', data);
  // console.log('printOrderPDF - data.item:', data?.item);

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
    text: 'ĐƠN HÀNG MUA (PO)',
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
              { text: `${dataLang?.purchase_order_table_code || 'purchase_order_table_code'}: `, style: 'pwMetaLabel' },
              { text: `${data?.code || ''}`, style: 'pwMetaValue' },
            ],
          },
          {
            text: [
              { text: `${dataLang?.purchase_order_table_dayvoucers || 'purchase_order_table_dayvoucers'}: `, style: 'pwMetaLabel' },
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

  const orderTypeText = (() => {
    if (data?.status_plan === '1') return 'KHSX';
    if (data?.order_type === '0') return 'Đặt mới';
    return 'Theo YCHM';
  })();

  const infoBlock = {
    columns: [
      {
        width: '*',
        stack: [
          {
            text: [
              { text: `${dataLang?.purchase_order_table_supplier || 'purchase_order_table_supplier'}: `, style: 'pwInfoLabel' },
              { text: `${data?.supplier_name || ''}`, style: 'pwInfoValue' },
            ],
          },
          {
            text: [
              { text: `Ngày dự kiến giao hàng: `, style: 'pwInfoLabel' },
              { text: `${data?.delivery_date ? formatMoment(data?.delivery_date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}`, style: 'pwInfoValue' },
            ],
          },
          {
            text: [
              { text: `Số kế hoạch: `, style: 'pwInfoLabel' },
              { text: `${data?.list_production_plan?.map(p => p.reference_no).join(', ') || ''}`, style: 'pwInfoValue' },
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

  // Cấu trúc cột: STT | Mặt hàng | Biến thể | ĐVT | SL | Đơn Giá | % Thuế | Thành tiền | Ghi chú
  const tableWidths = ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];

  const headerRow = [
    pwTableHeaderCell('STT'),
    pwTableHeaderCell('Mặt hàng', 'left'),
    pwTableHeaderCell('Biến thể', 'left'),
    pwTableHeaderCell('ĐVT'),
    pwTableHeaderCell('SL'),
    pwTableHeaderCell('Đơn Giá', 'right'),
    pwTableHeaderCell('% Thuế', 'right'),
    pwTableHeaderCell('Thành tiền', 'right'),
    pwTableHeaderCell(`${dataLang?.purchase_order_note || 'purchase_order_note'}`, 'left'),
  ];

  const totalQty =
    Array.isArray(data?.item)
      ? data.item.reduce((total, item) => total + Number(item?.quantity || 0), 0)
      : 0;

  const totalAmount = data?.total_amount || 0;
  const totalPrice = data?.total_price || 0;
  const totalTax = data?.total_tax_price || data?.total_tax || 0;
  const totalDiscount = data?.total_discount || 0;
  const totalPriceAfterDiscount = data?.total_price_after_discount || (totalPrice - totalDiscount);

  const docDefinition = {
    info: {
      title: `Đơn hàng mua (PO) - ${data?.code}`,
      author: 'Foso',
      subject: 'Purchase Order',
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
            ...(Array.isArray(data?.item) && data.item.length > 0
              ? data.item.map((item, index) => {
                const variationText = item?.item?.product_variation || '';
                const unitText = item?.item?.unit_name || '';
                const qtyValue = item?.quantity || 0;
                const priceValue = item?.price || 0;
                const taxRate = item?.tax_rate || 0;
                const amountValue = item?.amount || 0;

                const productName = item?.item?.item_name || item?.item?.name || item?.name || '';
                const productCode = item?.item?.code || item?.code || '';

                const itemNameStack = [
                  {
                    text: productName,
                    fontSize: 10,
                  },
                  ...(productCode
                    ? [
                      {
                        text: productCode,
                        fontSize: 9,
                        color: SUBTEXT,
                        margin: [0, 1, 0, 0],
                      },
                    ]
                    : []),
                ];

                return [
                  {
                    text: `${index + 1}`,
                    alignment: 'center',
                    fontSize: 9,
                  },
                  {
                    stack: itemNameStack,
                    alignment: 'left',
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
                    text: item?.note ? item?.note : '',
                    fontSize: 9,
                  },
                ];
              })
              : []),
            [
              {
                text: 'Tổng tiền',
                bold: true,
                colSpan: 8,
                fontSize: 10,
                fillColor: '#FFFFFF',
              },
              null,
              null,
              null,
              null,
              null,
              null,
              null,
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
                colSpan: 8,
                fontSize: 10,
                fillColor: '#FFFFFF',
              },
              null,
              null,
              null,
              null,
              null,
              null,
              null,
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
                colSpan: 8,
                fontSize: 10,
                fillColor: '#FFFFFF',
              },
              null,
              null,
              null,
              null,
              null,
              null,
              null,
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
                colSpan: 8,
                fontSize: 10,
                fillColor: '#FFFFFF',
              },
              null,
              null,
              null,
              null,
              null,
              null,
              null,
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
                text: `${dataLang?.purchase_order_table_intoMoney || 'purchase_order_table_intoMoney'}`,
                bold: true,
                colSpan: 8,
                fontSize: 11,
                fillColor: '#FFFFFF',
              },
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              {
                text: `${formatMoney(totalAmount)}`,
                bold: true,
                alignment: 'right',
                fontSize: 11,
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
      { style: 'dateTexts', text: `${currentDate}`, alignment: 'right', margin: marginDate },
      {
        columns: [
          { width: '*', text: '' },
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
                text: 'Người đặt hàng',
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

  try {
    openPdf(docDefinition);
  } catch (error) {
    console.error('Lỗi khi tạo PDF:', error);
    throw error;
  }
};

