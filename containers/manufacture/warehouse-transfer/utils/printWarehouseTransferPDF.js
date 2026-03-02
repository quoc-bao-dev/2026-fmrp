import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { applyCommonStyles, createFooter, createHeaderBlock, createTopLineBlock, ensureTimesNewRomanFonts, openPdf, PDF_THEME } from '@/utils/pdfCommon';

export const printWarehouseTransferPDF = async ({ data, dataLang, dataSeting, dataMaterialExpiry, dataProductExpiry, dataProductSerial, isWarehousePropertiesEnabled, warehousePropertyLabels }) => {
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
        text: (dataLang?.warehouseTransfer_title || 'warehouseTransfer_title').toUpperCase(),
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
                            { text: `${dataLang?.import_branch || 'import_branch'}: `, style: 'pwInfoLabel' },
                            { text: `${data?.branch_name_id || ''}`, style: 'pwInfoValue' },
                        ],
                    },
                    {
                        text: [
                            { text: `${dataLang?.production_warehouse_creator || 'production_warehouse_creator'}: `, style: 'pwInfoLabel' },
                            { text: `${data?.staff_create?.full_name || ''}`, style: 'pwInfoValue' },
                        ],
                    },
                    {
                        text: [
                            { text: `${dataLang?.warehouseTransfer_transferWarehouse || 'warehouseTransfer_transferWarehouse'}: `, style: 'pwInfoLabel' },
                            { text: `${data?.warehouses_id_name || ''}`, style: 'pwInfoValue' },
                        ],
                    },
                    {
                        text: [
                            { text: `${dataLang?.warehouseTransfer_receivingWarehouse || 'warehouseTransfer_receivingWarehouse'}: `, style: 'pwInfoLabel' },
                            { text: `${data?.warehouses_to_name || ''}`, style: 'pwInfoValue' },
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

    const wtTableHeaderCell = (text, alignment = 'center') => ({
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
            title: `${dataLang?.warehouseTransfer_title || 'warehouseTransfer_title'} - ${data?.code}`,
            author: 'Foso',
            subject: 'Warehouse Transfer',
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
                    // 8 cột tương ứng với 8 ô header bên dưới
                    widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    // Không dùng headerRows để tránh lặp header khi sang trang mới
                    headerRows: 0,
                    body: [
                        [
                            wtTableHeaderCell('STT'),
                            wtTableHeaderCell(`${dataLang?.purchase_items || 'purchase_items'}`, 'left'),
                            wtTableHeaderCell(`${dataLang?.PDF_infoVarian || 'PDF_infoVarian'}`, 'left'),
                            wtTableHeaderCell(`${dataLang?.warehouseTransfer_rransferPosition || 'warehouseTransfer_rransferPosition'}`),
                            wtTableHeaderCell(`${dataLang?.warehouseTransfer_receivingLocation || 'warehouseTransfer_receivingLocation'}`),
                            wtTableHeaderCell('ĐVT'),
                            wtTableHeaderCell(`${dataLang?.production_warehouse_export_slPDF || 'production_warehouse_export_slPDF'}`),
                            wtTableHeaderCell(`${dataLang?.serviceVoucher_note || 'serviceVoucher_note'}`, 'left'),
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
                                if (item?.item?.text_type === 'material' && Array.isArray(warehousePropertyLabels) && warehousePropertyLabels.length > 0) {
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
                                        text: `${item?.warehouse_location?.warehouse_name || ''} - ${item?.warehouse_location?.location_name || ''}`,
                                        fontSize: 9,
                                        alignment: 'left',
                                    },
                                    {
                                        text: `${item?.warehouse_location_to?.warehouse_name || ''} - ${item?.warehouse_location_to?.location_name || ''}`,
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
                        // Tổng số dòng
                        [
                            {
                                text: `${dataLang?.production_warehouse_totalItem || 'production_warehouse_totalItem'}`,
                                bold: true,
                                colSpan: 5,
                                fontSize: 10,
                                fillColor: '#FFFFFF',
                                alignment: 'left',
                            },
                            '',
                            '',
                            '',
                            '',
                            {
                                text: `${formatNumber(data?.items?.length || 0)}`,
                                bold: true,
                                alignment: 'right',
                                colSpan: 3,
                                fontSize: 10,
                                fillColor: '#FFFFFF',
                            },
                            '',
                            '',
                        ],
                        // Tổng số lượng chuyển
                        [
                            {
                                text: `${dataLang?.warehouseTransfer_total || 'warehouseTransfer_total'}`,
                                bold: true,
                                colSpan: 5,
                                fontSize: 10,
                                fillColor: '#FFFFFF',
                                alignment: 'left',
                            },
                            '',
                            '',
                            '',
                            '',
                            {
                                text: `${formatNumber(data?.items?.reduce((total, item) => total + Number(item.quantity || 0), 0))}`,
                                bold: true,
                                alignment: 'right',
                                colSpan: 3,
                                fontSize: 10,
                                fillColor: '#FFFFFF',
                            },
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
