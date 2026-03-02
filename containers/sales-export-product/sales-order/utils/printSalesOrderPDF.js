import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { applyCommonStyles, createFooter, createHeaderBlock, createTopLineBlock, ensureTimesNewRomanFonts, openPdf, PDF_THEME } from '@/utils/pdfCommon';

export const printSalesOrderPDF = async ({ data, dataLang, dataSeting }) => {
  if (!data) {
    console.error('printSalesOrderPDF: Không có dữ liệu');
    return;
  }

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
    text: 'ĐƠN HÀNG BÁN',
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
              { text: `${dataLang?.purchase_order_table_code || 'sales_product_code'}: `, style: 'pwMetaLabel' },
              { text: `${data?.code || ''}`, style: 'pwMetaValue' },
            ],
          },
          {
            text: [
              { text: `${dataLang?.purchase_order_table_dayvoucers || 'sales_product_date'}: `, style: 'pwMetaLabel' },
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
              { text: `${dataLang?.customer || 'customer'}: `, style: 'pwInfoLabel' },
              { text: `${data?.client_name || ''}`, style: 'pwInfoValue' },
            ],
          },
          {
            text: [
              { text: `${dataLang?.note || 'note'}: `, style: 'pwInfoLabel' },
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

  // Cấu trúc cột: STT | Mặt hàng | Biến thể | ĐVT | SL | Đơn Giá | % CK | ĐGSCK | Thành tiền
  const tableWidths = ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];

  const headerRow = [
    pwTableHeaderCell('STT'),
    pwTableHeaderCell('Mặt hàng', 'left'),
    pwTableHeaderCell('Biến thể', 'left'),
    pwTableHeaderCell('ĐVT'),
    pwTableHeaderCell('SL'),
    pwTableHeaderCell('Đơn Giá', 'right'),
    pwTableHeaderCell('% CK', 'right'),
    pwTableHeaderCell('ĐGSCK', 'right'),
    pwTableHeaderCell('Thành tiền', 'right'),
  ];

  const totalAmount = data?.total_amount || 0;
  const totalPrice = data?.total_price || 0;
  const totalTax = data?.total_tax_price || data?.total_tax || 0;
  const totalDiscount = data?.total_discount || 0;
  const totalPriceAfterDiscount = data?.total_price_after_discount || (totalPrice - totalDiscount);

  const docDefinition = {
    info: {
      title: `Đơn hàng bán - ${data?.code}`,
      author: 'Foso',
      subject: 'Sales Order',
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
                const productName = item?.item?.item_name || item?.item?.name || item?.name || '';
                const productCode = item?.item?.code || item?.code || '';
                const variationText = item?.item?.product_variation || '';
                const unitText = item?.item?.unit_name || '';
                const qtyValue = item?.quantity || 0;
                const priceValue = item?.price || 0;
                const discountPercent = item?.discount_percent || 0;
                const priceAfterDiscount = item?.price_after_discount || item?.price || 0;
                const amountValue = item?.amount || 0;

                return [
                  {
                    text: `${index + 1}`,
                    alignment: 'center',
                    fontSize: 9,
                  },
                  {
                    text: productCode
                      ? [
                        { text: productName, fontSize: 10 },
                        { text: `\n${productCode}`, fontSize: 8, color: CODETEXT },
                      ]
                      : productName,
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
                    text: discountPercent > 0 ? `${formatNumber(+discountPercent)}%` : '0%',
                    alignment: 'right',
                    fontSize: 9,
                  },
                  {
                    text: priceAfterDiscount != null ? `${formatMoney(+priceAfterDiscount)}` : '0',
                    alignment: 'right',
                    fontSize: 9,
                  },
                  {
                    text: amountValue != null ? `${formatMoney(+amountValue)}` : '0',
                    alignment: 'right',
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
                text: `${dataLang?.sales_product_total_into_money || 'sales_product_total_into_money'}`,
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
      {
        text: [
          { text: 'Thành tiền bằng chữ: ', bold: true, fontSize: 10 },
          { text: data?.total_amount_word || 'Không', fontSize: 10 },
        ],
        alignment: 'left',
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
                text: 'Người lập phiếu',
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

