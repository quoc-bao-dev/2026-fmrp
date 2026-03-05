import React, { useCallback, useMemo, useState } from 'react';
import ModalImage from 'react-modal-image';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import LimitListDropdown from '@/components/common/dropdown/LimitListDropdown';
import { PiCaretDownBold, PiTable } from 'react-icons/pi';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import useSetingServer from '@/hooks/useConfigNumber';
import { TagColorProductNew } from '@/components/common/tag/TagStatusNew';
import ExcelFileComponent from '@/components/common/excel/ExcelFileComponent';
import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import { useDebounce } from 'use-debounce';
import { CloseXIcon, MagnifyingGlassIcon } from '@/components/icons';

const TabMaterialOutputHistory = ({ dataLang, items = [], count = 0 }) => {
    const [limit, setLimit] = useState(5);
    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearchValue] = useDebounce(searchValue, 500);
    const dataSeting = useSetingServer();

    const formatNumber = useCallback((num) => formatNumberConfig(+num, dataSeting), [dataSeting]);

    const onChangeSearch = e => setSearchValue(e?.target?.value ?? '');

    const filteredData = useMemo(() => {
        const data = Array.isArray(items) ? items : [];
        if (!debouncedSearchValue) return data;

        const keyword = debouncedSearchValue.toLowerCase();
        return data.filter(item => {
            const name = item?.item_name?.toLowerCase() || '';
            const code = item?.item_code?.toLowerCase() || '';
            const variation = item?.product_variation?.toLowerCase() || '';
            const type = item?.type_products?.toLowerCase() || '';
            return (
                name.includes(keyword) ||
                code.includes(keyword) ||
                variation.includes(keyword) ||
                type.includes(keyword)
            );
        });
    }, [items, debouncedSearchValue]);

    const totalCount = useMemo(() => {
        // Khi search: tổng hiển thị là số item sau filter (client-side)
        if (debouncedSearchValue) return filteredData.length;
        // Không search: ưu tiên count server nếu có
        return Number(count) > 0 ? Number(count) : filteredData.length;
    }, [count, debouncedSearchValue, filteredData.length]);

    const visibleData = useMemo(() => filteredData.slice(0, limit), [filteredData, limit]);

    const multiDataSet = useMemo(() => ([
        {
            columns: [
                {
                    title: 'ID',
                    width: { wch: 10 },
                    style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } },
                },
                {
                    title: 'Nguyên vật liệu',
                    width: { wch: 40 },
                    style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } },
                },
                {
                    title: 'Biến thể',
                    width: { wch: 40 },
                    style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } },
                },
                {
                    title: 'Mã nguyên vật liệu',
                    width: { wch: 20 },
                    style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } },
                },
                {
                    title: 'Đơn vị tính',
                    width: { wch: 14 },
                    style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } },
                },
                {
                    title: 'Loại',
                    width: { wch: 22 },
                    style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } },
                },
                {
                    title: 'Kế hoạch',
                    width: { wch: 14 },
                    style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } },
                },
                {
                    title: 'Đã xuất',
                    width: { wch: 14 },
                    style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } },
                },
                {
                    title: 'Còn lại',
                    width: { wch: 14 },
                    style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } },
                },
                {
                    title: 'Thu hồi',
                    width: { wch: 14 },
                    style: { fill: { fgColor: { rgb: 'C7DFFB' } }, font: { bold: true } },
                },
            ],
            data: (filteredData || []).map(e => ([
                { value: `${e?.item_id ?? e?.id ?? ''}`, style: { numFmt: '0' } },
                { value: `${e?.item_name ?? ''}` },
                { value: `${e?.product_variation ?? ''}` },
                { value: `${e?.item_code ?? ''}` },
                { value: `${e?.unit_name ?? ''}` },
                { value: `${e?.type_products ?? ''}` },
                { value: `${+e?.quantity_total_quota ? formatNumber(+e?.quantity_total_quota) : '0'}` },
                { value: `${+e?.quantity_exported ? formatNumber(+e?.quantity_exported) : '0'}` },
                { value: `${+e?.quantity_rest ? formatNumber(+e?.quantity_rest) : '0'}` },
                { value: `${+e?.quantity_recovery ? formatNumber(+e?.quantity_recovery) : '0'}` },
            ])),
        },
    ]), [filteredData, formatNumber]);

    return (
        <div className='flex flex-col h-full w-full'>
            <div className='flex items-center justify-between gap-3 m-1'>
                {/* Search input (same UI as PlaningProductionOrder.jsx) */}
                <div className='flex gap-x-2 items-center w-1/3 rounded-lg border border-[#D0D5DD] px-4 py-2 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500'>
                    <input
                        type='text'
                        placeholder={dataLang?.productions_orders_find_table || 'Tìm kiếm theo tên và mã nguyên vật liệu'}
                        className='flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-400'
                        value={searchValue}
                        onChange={onChangeSearch}
                    />
                    {searchValue && (
                        <button
                            type='button'
                            className='rounded-full bg-gray-100 hover:bg-gray-200 text-[#3A3E4C] p-1 transition'
                            aria-label='Xóa tìm kiếm'
                            onClick={() => setSearchValue('')}
                        >
                            <CloseXIcon className='size-3' />
                        </button>
                    )}
                    <button type='button' className='rounded-lg bg-[#1760B9] p-1'>
                        <MagnifyingGlassIcon className='size-4 text-white' />
                    </button>
                </div>

                {filteredData?.length > 0 && (
                    <ExcelFileComponent
                        dataLang={dataLang}
                        filename={'Lịch sử xuất kho NVL'}
                        multiDataSet={multiDataSet}
                        title='Lịch sử xuất kho NVL'
                    >
                        <ButtonAnimationNew
                            icon={
                                <div className='3xl:size-5 size-4'>
                                    <PiTable className='size-full' />
                                </div>
                            }
                            title='Xuất Excel'
                            className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-normal text-[#0375F3] border border-[#0375F3] hover:bg-[#0375F3]/5 hover:shadow-hover-button rounded-lg'
                        />
                    </ExcelFileComponent>
                )}
            </div>
            {/* Khu vực bảng (scrollable) */}
            <div className='flex-1 min-h-0 overflow-y-auto'>
                <div className='grid grid-cols-16 mt-2 min-h-0'>
                    {/* header */}
                    <div className='col-span-16 grid grid-cols-16 gap-2 py-3 border-b sticky top-0 z-10 bg-white'>
                        <h4 className='text-xs-default text-center text-[#9295A4] font-semibold col-span-1 px-1'>STT</h4>

                        <h4 className='text-xs-default text-start text-[#9295A4] font-semibold col-span-3 px-1'>
                            Nguyên vật liệu
                        </h4>

                        <h4 className='text-xs-default text-start text-[#9295A4] font-semibold col-span-1 px-1'>ĐVT</h4>

                        <h4 className='text-xs-default text-start text-[#9295A4] font-semibold col-span-3 px-1'>Loại</h4>

                        <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            Kế hoạch
                        </h4>

                        <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            Đã xuất
                        </h4>

                        <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            Còn lại
                        </h4>

                        <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            Thu hồi
                        </h4>
                    </div>

                    <div className='col-span-16 grid grid-cols-16'>
                        {isLoadingTable ? (
                            <Loading className='3xl:h-full 2xl:h-full xl:h-full h-full col-span-16' />
                        ) : filteredData && filteredData.length > 0 ? (
                            visibleData.map((product, index) => (
                                <div
                                    key={`product-history-${product.id}-${index}`}
                                    className={`${visibleData.length - 1 !== index ? 'border-[#F3F3F4]' : 'border-transparent'
                                        } border-b col-span-16 grid grid-cols-16 gap-2 items-start group hover:bg-gray-100 cursor-pointer transition-all duration-150 ease-in-out`}
                                >
                                    <h4 className='col-span-1 flex items-center justify-center size-full text-center text-[#141522] font-semibold text-sm-default uppercase 3xl:py-4 py-2 px-1'>
                                        {index + 1 ?? '-'}
                                    </h4>

                                    <h4 className='col-span-3 flex items-center justify-center size-full text-[#344054] font-normal gap-2 3xl:py-4 py-2 px-1'>
                                        <div className='flex items-start justify-start w-full gap-2'>
                                            <ModalImage
                                                small={
                                                    product?.images && product?.images !== ''
                                                        ? product?.images
                                                        : '/icon/default/default.png'
                                                }
                                                large={
                                                    product?.images && product?.images !== ''
                                                        ? product?.images
                                                        : '/icon/default/default.png'
                                                }
                                                width={200}
                                                height={200}
                                                alt={product?.item_name ?? 'image'}
                                                className={`3xl:size-10 3xl:min-w-10 size-8 min-w-8 text-xs-default object-cover rounded-md shrink-0`}
                                            />

                                            <div className='flex flex-col 3xl:gap-1 gap-0.5'>
                                                <p className='font-semibold text-sm-default text-[#141522] group-hover:text-[#0F4F9E]'>
                                                    {product?.item_name ?? ''}
                                                </p>

                                                <p className='text-[#667085] font-normal xl:text-[10px] text-[8px]'>
                                                    {product?.product_variation ?? ''}
                                                </p>

                                                <p className='text-[#3276FA] font-normal 3xl:text-sm xl:text-xs text-[10px]'>
                                                    {product?.item_code ?? ''}
                                                </p>
                                            </div>
                                        </div>
                                    </h4>

                                    <h4 className='col-span-1 flex items-center justify-start size-full text-start text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                        {product?.unit_name ?? '-'}
                                    </h4>

                                    <h4 className='col-span-3 flex flex-col justify-center size-full gap-1 text-[#141522] 3xl:py-4 py-2 px-1'>
                                        <TagColorProductNew
                                            dataKey={
                                                product?.type_products === 'products'
                                                    ? 0
                                                    : product?.type_products === 'semi_products'
                                                        ? 1
                                                        : product?.type_products === 'out_side'
                                                            ? 2
                                                            : product?.type_products === 'materials'
                                                                ? 3
                                                                : product?.type_products === 'semi_products_outside'
                                                                    ? 4
                                                                    : null
                                            }
                                            className='!px-2 !py-1 !rounded-[4px] !font-normal 3xl:text-sm xl:text-xs text-[13px]'
                                            dataLang={dataLang}
                                            name={product?.type_products}
                                        />
                                    </h4>

                                    <h4 className='col-span-2 flex items-center justify-center size-full text-center text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                        {+product?.quantity_total_quota > 0 ? formatNumber(+product?.quantity_total_quota) : '-'}
                                    </h4>

                                    <h4 className='col-span-2 flex items-center justify-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                        {+product?.quantity_exported > 0 ? formatNumber(+product?.quantity_exported) : '-'}
                                    </h4>

                                    <h4 className='col-span-2 flex items-center justify-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                        {+product?.quantity_rest > 0 ? formatNumber(+product?.quantity_rest) : '-'}
                                    </h4>

                                    <h4 className='col-span-2 flex items-center justify-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                        {+product?.quantity_recovery > 0 ? formatNumber(+product?.quantity_recovery) : '-'}
                                    </h4>
                                </div>
                            ))
                        ) : (
                            <NoData className='mt-0 col-span-16' type='table' />
                        )}
                    </div>
                </div>
            </div>

            {/* Pagination luôn nằm cuối tab */}
            {totalCount > 0 && !isLoadingTable && (
                <div className='flex item justify-between mt-2'>
                    <div />
                    {limit < totalCount && (
                        <div className='flex justify-center py-2'>
                            <button
                                onClick={() => setLimit(totalCount)}
                                className='flex items-center gap-2 text-[#667085] 3xl:text-base xl:text-sm text-xs hover:underline'
                            >
                                <div className='space-x-2'>
                                    <span>Xem Thêm</span>
                                    <span>({Math.max(totalCount - limit, 0)})</span>
                                    <span>Nguyên Vật Liệu</span>
                                </div>
                                <PiCaretDownBold className='3xl:size-5 size-4' />
                            </button>
                        </div>
                    )}

                    <LimitListDropdown
                        limit={limit}
                        sLimit={value => setLimit(value)}
                        dataLang={{ display: 'Hiển thị', on: 'trên', lsx: 'BTP' }}
                        total={totalCount}
                    />
                </div>
            )}
        </div>
    );
};

export default TabMaterialOutputHistory;

