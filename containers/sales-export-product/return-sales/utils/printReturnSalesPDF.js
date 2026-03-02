import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatMoneyConfig from '@/utils/helpers/formatMoney';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { applyCommonStyles, createFooter, createHeaderBlock, createTopLineBlock, ensureTimesNewRomanFonts, openPdf, PDF_THEME } from '@/utils/pdfCommon';

export const printReturnSalesPDF = async ({ data, dataLang, dataSeting, dataMaterialExpiry, dataProductExpiry, dataProductSerial, isWarehousePropertiesEnabled, warehousePropertyLabels, showPrice = true }) => {
    if (!data) return;

    try {
        await ensureTimesNewRomanFonts();

        const dataCompany = dataSeting;
        const { PRIMARY, BORDER, TEXT, SUBTEXT } = PDF_THEME;

        const formatMoney = number => {
            if (typeof number == 'string') {
                return formatMoneyConfig(+number ? +number : 0, dataSeting);
            } else if (typeof number == 'undefined') {
                return formatMoneyConfig(0, dataSeting);
            }
            return formatMoneyConfig(+number ? +number : 0, dataSeting);
        };

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
            text: (dataLang?.returnSales_title || 'returnSales_title').toUpperCase(),
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
                                { text: `${dataLang?.returnSales_client || 'returnSales_client'}: `, style: 'pwInfoLabel' },
                                { text: `${data?.client_name || ''}`, style: 'pwInfoValue' },
                            ],
                        },
                        {
                            text: [
                                { text: `${dataLang?.import_branch || 'import_branch'}: `, style: 'pwInfoLabel' },
                                { text: `${data?.branch_name || ''}`, style: 'pwInfoValue' },
                            ],
                        },
                        {
                            text: [
                                { text: `${dataLang?.returns_form || 'returns_form'}: `, style: 'pwInfoLabel' },
                                { text: `${dataLang?.[data?.handling_solution] || data?.handling_solution || ''}`, style: 'pwInfoValue' },
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

        const rsTableHeaderCell = (text, alignment = 'center') => ({
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
                title: `${dataLang?.returnSales_title || 'returnSales_title'} - ${data?.code}`,
                author: 'Foso',
                subject: 'Return Sales',
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
                        widths: showPrice
                            ? ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']
                            : ['auto', '*', '*', 'auto', 'auto', 'auto', '*'],
                        // Không dùng headerRows để tránh lặp header khi sang trang mới
                        headerRows: 0,
                        body: [
                            showPrice
                                ? [
                                    rsTableHeaderCell('STT'),
                                    rsTableHeaderCell(`${dataLang?.purchase_items || 'purchase_items'}`, 'left'),
                                    rsTableHeaderCell(`${dataLang?.PDF_infoItem || 'PDF_infoItem'}`, 'left'),
                                    rsTableHeaderCell('ĐVT'),
                                    rsTableHeaderCell(`${dataLang?.import_from_quantity || 'import_from_quantity'}`),
                                    rsTableHeaderCell(`${dataLang?.import_from_unit_price || 'import_from_unit_price'}`),
                                    rsTableHeaderCell(`${dataLang?.serviceVoucher_tax || 'serviceVoucher_tax'}`),
                                    rsTableHeaderCell(`${dataLang?.serviceVoucher_into_money || 'serviceVoucher_into_money'}`),
                                    rsTableHeaderCell(`${dataLang?.serviceVoucher_note || 'serviceVoucher_note'}`, 'left'),
                                ]
                                : [
                                    rsTableHeaderCell('STT'),
                                    rsTableHeaderCell(`${dataLang?.purchase_items || 'purchase_items'}`, 'left'),
                                    rsTableHeaderCell(`${dataLang?.PDF_infoItem || 'PDF_infoItem'}`, 'left'),
                                    rsTableHeaderCell(`${dataLang?.PDF_house || 'PDF_house'}`),
                                    rsTableHeaderCell('ĐVT'),
                                    rsTableHeaderCell(`${dataLang?.import_from_quantity || 'import_from_quantity'}`),
                                    rsTableHeaderCell(`${dataLang?.serviceVoucher_note || 'serviceVoucher_note'}`, 'left'),
                                ],
                            // Data rows
                            ...(data?.items?.length > 0
                                ? data.items.map((item, index) => {
                                    const stack = [];
                                    const stackBt = [];

                                    const productName = item?.item?.item_name || item?.item?.name || item?.name || '';
                                    const productCode = item?.item?.code || item?.code || '';

                                    // Dòng 1: Tên sản phẩm
                                    stack.push({
                                        text: productName,
                                        fontSize: 10,
                                    });

                                    // Dòng 2: Mã sản phẩm (code) dưới tên, nếu có
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
                                                        text: item?.item?.serial == null || item?.item?.serial == '' ? '-' : item?.item?.serial,
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
                                                        text: item?.item?.lot == null || item?.item?.lot == '' ? '-' : item?.item?.lot,
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
                                                        text: item?.item?.expiration_date ? formatMoment(item?.item?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-',
                                                        fontSize: 8.5,
                                                    },
                                                ],
                                                fontSize: 9,
                                            },
                                        ];
                                        stackBt.push(subStack);
                                    }

                                    // Hiển thị warehousePropertyLabels cho material
                                    if (item?.item_type === 'material' && Array.isArray(warehousePropertyLabels) && warehousePropertyLabels.length > 0) {
                                        const propertyStack = warehousePropertyLabels
                                            .map(({ key, label }) => {
                                                if (!label) return null;
                                                const value = item?.item?.[key] ?? item?.[key];
                                                // Nếu isWarehousePropertiesEnabled tắt và thuộc tính không có giá trị → ẩn
                                                if (!isWarehousePropertiesEnabled && (value == null || value === '')) return null;
                                                return {
                                                    text: [
                                                        {
                                                            text: `${label}: `,
                                                            fontSize: 9,
                                                        },
                                                        {
                                                            text: value == null || value === '' ? '-' : value,
                                                            fontSize: 9,
                                                        },
                                                    ],
                                                    fontSize: 9,
                                                };
                                            })
                                            .filter(Boolean);
                                        if (propertyStack.length > 0) {
                                            stackBt.push(...propertyStack);
                                        }
                                    }

                                    if (showPrice) {
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
                                                text: item?.price_after_discount ? `${formatMoney(item?.price_after_discount)}` : '',
                                                alignment: 'center',
                                                fontSize: 9,
                                            },
                                            {
                                                text: item?.tax_rate ? `${item?.tax_rate}%` : '',
                                                alignment: 'center',
                                                fontSize: 9,
                                            },
                                            {
                                                text: item?.amount ? `${formatMoney(item?.amount)}` : '',
                                                alignment: 'right',
                                                fontSize: 9,
                                            },
                                            {
                                                text: item?.note ? item?.note : '',
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
                                                stack: stack,
                                            },
                                            {
                                                stack: stackBt,
                                            },
                                            {
                                                text: `${item?.warehouse_name || ''} - ${item?.location_name || ''}`,
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
                                    }
                                })
                                : []),
                            // Chỉ hiển thị tổng tiền nếu showPrice = true
                            ...(showPrice ? [
                                // Tổng tiền
                                [
                                    {
                                        text: `${dataLang?.purchase_order_table_total || 'purchase_order_table_total'}`,
                                        bold: true,
                                        colSpan: 5,
                                        fontSize: 10,
                                        fillColor: '#F8FAFC',
                                    },
                                    '',
                                    '',
                                    '',
                                    '',
                                    {
                                        text: `${formatMoney(data?.total_price || 0)}`,
                                        bold: true,
                                        alignment: 'right',
                                        colSpan: 4,
                                        fontSize: 10,
                                        fillColor: '#F8FAFC',
                                    },
                                    '',
                                    '',
                                    '',
                                ],
                                // Chiết khấu
                                [
                                    {
                                        text: `${dataLang?.purchase_order_detail_discounty || 'purchase_order_detail_discounty'}`,
                                        bold: true,
                                        colSpan: 5,
                                        fontSize: 10,
                                        fillColor: '#F8FAFC',
                                    },
                                    '',
                                    '',
                                    '',
                                    '',
                                    {
                                        text: `${formatMoney(data?.total_discount || 0)}`,
                                        bold: true,
                                        alignment: 'right',
                                        colSpan: 4,
                                        fontSize: 10,
                                        fillColor: '#F8FAFC',
                                    },
                                    '',
                                    '',
                                    '',
                                ],
                                // Sau chiết khấu
                                [
                                    {
                                        text: `${dataLang?.purchase_order_detail_money_after_discount || 'purchase_order_detail_money_after_discount'}`,
                                        bold: true,
                                        colSpan: 5,
                                        fontSize: 10,
                                        fillColor: '#F8FAFC',
                                    },
                                    '',
                                    '',
                                    '',
                                    '',
                                    {
                                        text: `${formatMoney(data?.total_price_after_discount || 0)}`,
                                        bold: true,
                                        alignment: 'right',
                                        colSpan: 4,
                                        fontSize: 10,
                                        fillColor: '#F8FAFC',
                                    },
                                    '',
                                    '',
                                    '',
                                ],
                                // Thuế
                                [
                                    {
                                        text: `${dataLang?.purchase_order_detail_tax_money || 'purchase_order_detail_tax_money'}`,
                                        bold: true,
                                        colSpan: 5,
                                        fontSize: 10,
                                        fillColor: '#F8FAFC',
                                    },
                                    '',
                                    '',
                                    '',
                                    '',
                                    {
                                        text: `${formatMoney(data?.total_tax_price || 0)}`,
                                        bold: true,
                                        alignment: 'right',
                                        colSpan: 4,
                                        fontSize: 10,
                                        fillColor: '#F8FAFC',
                                    },
                                    '',
                                    '',
                                    '',
                                ],
                                // Thành tiền
                                [
                                    {
                                        text: `${dataLang?.purchase_order_detail_into_money || 'purchase_order_detail_into_money'}`,
                                        bold: true,
                                        colSpan: 5,
                                        fontSize: 10,
                                        fillColor: '#F8FAFC',
                                    },
                                    '',
                                    '',
                                    '',
                                    '',
                                    {
                                        text: `${formatMoney(data?.total_amount || 0)}`,
                                        bold: true,
                                        alignment: 'right',
                                        colSpan: 4,
                                        fontSize: 10,
                                        fillColor: '#F8FAFC',
                                    },
                                    '',
                                    '',
                                    '',
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

        // Bổ sung style riêng cho template này (không đụng global `styles`)
        applyCommonStyles(docDefinition, TEXT, SUBTEXT);

        // Tạo và mở PDF
        openPdf(docDefinition);
    } catch (error) {
        throw error;
    }
};
