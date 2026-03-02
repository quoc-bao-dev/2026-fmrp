import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { applyCommonStyles, createFooter, createHeaderBlock, createTopLineBlock, ensureTimesNewRomanFonts, openPdf, PDF_THEME } from '@/utils/pdfCommon';

export const printProductsWarehousePDF = async ({ data, dataLang, dataSeting, dataMaterialExpiry, dataProductExpiry, dataProductSerial }) => {
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
    const marginTextTotal = [0, 10, 0, 0];

    // Ngày hiện tại
    const currentDate = moment().format('[Ngày] DD [Tháng] MM [Năm] YYYY');

    const headerBlock = createHeaderBlock(dataCompany);

    const titleBlock = {
        text: (dataLang?.productsWarehouse_title || 'productsWarehouse_title').toUpperCase(),
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

    const infoBlock = {
        columns: [
            {
                width: '*',
                stack: [
                    {
                        text: [
                            { text: `${dataLang?.productsWarehouse_warehouseImport || 'productsWarehouse_warehouseImport'}: `, style: 'pwInfoLabel' },
                            { text: `${data?.warehouse_name || ''}`, style: 'pwInfoValue' },
                        ],
                    },
                    {
                        text: [
                            { text: `${dataLang?.production_warehouse_LSX || 'production_warehouse_LSX'}: `, style: 'pwInfoLabel' },
                            { text: `${data?.reference_no_detail || ''}`, style: 'pwInfoValue' },
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

    // Định nghĩa PDF document
    const docDefinition = {
        info: {
            title: `${dataLang?.productsWarehouse_title || 'productsWarehouse_title'} - ${data?.code}`,
            author: 'Foso',
            subject: 'Products Warehouse',
            keywords: 'PDF',
        },
        // Cho đường kẻ sát mép trên cùng
        pageMargins: [40, 0, 40, 40],
        pageOrientation: 'portrait',
        defaultStyle: {
            font: 'TimesNewRoman',
        },
        // Footer cho mọi trang
        footer: createFooter(PRIMARY),
        content: [
            // Đường kẻ trên đầu trang
            createTopLineBlock(PRIMARY),
            headerBlock,
            titleBlock,
            metaRightBlock,
            infoBlock,
            {
                table: {
                    widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto'],
                    // Không dùng headerRows để tránh lặp header khi sang trang mới
                    headerRows: 0,
                    body: [
                        [
                            pwTableHeaderCell('STT'),
                            pwTableHeaderCell(`${dataLang?.purchase_items || 'purchase_items'}`, 'left'),
                            pwTableHeaderCell(`${dataLang?.PDF_infoVarian || 'PDF_infoVarian'}`, 'left'),
                            pwTableHeaderCell(`${dataLang?.productsWarehouse_warehouseLocaImport || 'productsWarehouse_warehouseLocaImport'}`),
                            pwTableHeaderCell('ĐVT'),
                            pwTableHeaderCell(`${dataLang?.productsWarehouse_QtyImport || 'productsWarehouse_QtyImport'}`),
                            pwTableHeaderCell(`${dataLang?.serviceVoucher_note || 'serviceVoucher_note'}`, 'left'),
                        ],
                        // Data rows
                        ...(data?.items?.length > 0
                            ? data.items.map((item, index) => {
                                const stack = [];
                                const stackBt = [];
                                const productName = item?.item?.item_name || item?.item?.name || item?.name || '';
                                const productCode = item?.item?.code || item?.code || '';

                                stack.push({
                                    text: productName,
                                    fontSize: 10,
                                });
                                if (productCode) {
                                    stack.push({
                                        text: productCode,
                                        fontSize: 9,
                                        color: SUBTEXT,
                                        margin: [0, 1, 0, 0],
                                    });
                                }
                                stackBt.push({
                                    text: `Biến thể: ${item?.item?.product_variation || '(NONE)'}`,
                                    fontSize: 9,
                                });

                                if (dataProductSerial?.is_enable === '1') {
                                    const serialStack = [
                                        {
                                            text: [
                                                {
                                                    text: 'Serial: ',
                                                    fontSize: 9,
                                                },
                                                {
                                                    text: item.serial == null || item.serial == '' ? '-' : item.serial,
                                                    fontSize: 9,
                                                },
                                            ],
                                        },
                                    ];
                                    stackBt.push(serialStack);
                                }

                                if (dataMaterialExpiry?.is_enable === '1' || dataProductExpiry?.is_enable === '1') {
                                    const subStack = [
                                        {
                                            text: [
                                                {
                                                    text: 'Lot: ',
                                                    fontSize: 9,
                                                },
                                                {
                                                    text: item.lot == null || item.lot == '' ? '-' : item.lot,
                                                    fontSize: 9,
                                                },
                                            ],
                                            fontSize: 9,
                                        },
                                        {
                                            text: [
                                                {
                                                    text: 'Date: ',
                                                    fontSize: 9,
                                                },
                                                {
                                                    text: item.expiration_date ? formatMoment(item.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-',
                                                    fontSize: 8.5,
                                                },
                                            ],
                                            fontSize: 9,
                                        },
                                    ];
                                    stackBt.push(subStack);
                                }
                                return [
                                    {
                                        text: `${index + 1}`,
                                        alignment: 'center',
                                        fontSize: 9,
                                    },
                                    {
                                        stack: stack,
                                    },
                                    {
                                        stack: stackBt,
                                    },
                                    {
                                        text: `${item?.location_name || item?.location_code || ''}`,
                                        fontSize: 9,
                                        alignment: 'left',
                                    },
                                    {
                                        text: item?.item?.unit_name ? item?.item?.unit_name : '',
                                        fontSize: 9,
                                        alignment: 'center',
                                    },
                                    {
                                        text: item?.quantity ? `${formatNumber(+item?.quantity)}` : '',
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
                                fillColor: '#FFFFFF',
                            },
                            '',
                            {
                                text: `${formatNumber(data?.items?.length || 0)}`,
                                bold: true,
                                alignment: 'right',
                                colSpan: 5,
                                fontSize: 10,
                                fillColor: '#FFFFFF',
                            },
                            '',
                            '',
                            '',
                            '',
                        ],
                        [
                            {
                                text: `${dataLang?.production_warehouse_sales || 'production_warehouse_sales'}`,
                                bold: true,
                                colSpan: 2,
                                fontSize: 10,
                                fillColor: '#FFFFFF',
                            },
                            '',
                            {
                                text: `${formatNumber(data?.items?.reduce((total, item) => total + Number(item.quantity || 0), 0))}`,
                                bold: true,
                                alignment: 'right',
                                colSpan: 5,
                                fontSize: 10,
                                fillColor: '#FFFFFF',
                            },
                            '',
                            '',
                            '',
                            '',
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

    // Bổ sung style riêng cho template này (không đụng global `styles`)
    applyCommonStyles(docDefinition, TEXT, SUBTEXT);

    // Tạo và mở PDF
    openPdf(docDefinition);
};

