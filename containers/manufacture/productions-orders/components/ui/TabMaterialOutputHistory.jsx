import React, { useState } from 'react';
import ModalImage from 'react-modal-image';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import LimitListDropdown from '@/components/common/dropdown/LimitListDropdown';
import { PiCaretDownBold } from 'react-icons/pi';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import useSetingServer from '@/hooks/useConfigNumber';
import { TagColorProductNew } from '@/components/common/tag/TagStatusNew';

const TabMaterialOutputHistory = ({ dataLang, items = [], count = 0 }) => {
    const [limit, setLimit] = useState(5);
    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const dataSeting = useSetingServer();

    const formatNumber = (num) => formatNumberConfig(+num, dataSeting);

    const filteredData = Array.isArray(items) ? items : [];
    const totalCount = Number(count) > 0 ? Number(count) : filteredData.length;

    const visibleData = filteredData.slice(0, limit);

    return (
        <div className='flex flex-col h-full w-full'>
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

