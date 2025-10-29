// lich su nhap kho tp
import apiProductionsOrders from '@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders';
import OnResetData from '@/components/UI/btnResetData/btnReset';
import ContainerPagination from '@/components/UI/common/ContainerPagination/ContainerPagination';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import Pagination from "@/components/UI/pagination";
import { optionsQuery } from '@/configs/optionsQuery';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import useFeature from '@/hooks/useConfigFeature';
import useSetingServer from '@/hooks/useConfigNumber';
import { useLimitAndTotalItems } from '@/hooks/useLimitAndTotalItems';
import usePagination from '@/hooks/usePagination';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { memo, useState } from 'react';
import { useSelector } from 'react-redux';


const TabWarehouseHistory = memo(({ isStateModal, width, dataLang, listTab, typePageMoblie }) => {
    const router = useRouter()

    const { paginate } = usePagination()

    const dataSeting = useSetingServer();

    const [isSearch, setIsSearch] = useState("");

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems()

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    // const { checkAdd, checkExport } = useActionRole(auth, "")

    const { dataProductExpiry, dataProductSerial, dataMaterialExpiry } = useFeature()

    const formatNumber = (num) => formatNumberConfig(+num, dataSeting);

    const onChangeSearch = debounce((e) => { setIsSearch(e.target.value) }, 500)

    const { data, isLoading, isFetching, refetch, isRefetching } = useQuery({
        queryKey: ['api_get_purchase_products', isSearch, router.query?.page],
        queryFn: async () => {
            let formData = new FormData();

            formData.append("search", isSearch);

            formData.append("page", router.query?.page ?? "");

            formData.append("pod_id", isStateModal?.dataDetail?.poi?.poi_id);

            const res = await apiProductionsOrders.apiGetPurchaseProducts(formData)

            const flattenedItemsArray = res?.data?.rResult.flatMap(entry =>
                entry.items.map(item => ({
                    branch_name: entry.branch_name,
                    code: entry.code,
                    created_by: entry.created_by,
                    date: entry.date,
                    grand_total: entry.grand_total,
                    id: entry.id,
                    note: entry.note,
                    poi_data: entry.poi_data,
                    poi_id: entry.poi_id,
                    staff_create: entry.staff_create,
                    total_quantity: entry.total_quantity,
                    item
                }))
            );
            return { ...res.data, rResult: flattenedItemsArray } || {}
        },
        ...optionsQuery
    })

    const multiDataSet = [
        {
            columns: [
                {
                    title: "ID",
                    width: { wch: 4 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Ngày chứng từ'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Mã chứng từ'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Mặt hàng'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Biến thể'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                ...[dataProductSerial.is_enable === "1" && {
                    title: `${'Serial'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                (dataProductExpiry.is_enable === "1" || dataMaterialExpiry.is_enable === "1") && {
                    title: `${'Lot'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                (dataProductExpiry.is_enable === "1" || dataMaterialExpiry.is_enable === "1") && {
                    title: `${'Date'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                ],
                {
                    title: `${'Kho thảnh phẩm'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Số lượng'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Kho QC'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Số lượng lỗi'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
            ],
            data: data?.rResult?.map((e, index) => [
                { value: `${e?.id ? e.id : ""}`, style: { numFmt: "0" } },
                { value: `${e?.date ? formatMoment(e.date, FORMAT_MOMENT.DATE_TIME_SLASH_LONG) : ''}` },
                { value: `${e?.code ?? ""}` },
                { value: `${e?.item?.item_name ?? ""}` },
                { value: `${e?.item?.product_variation ?? ""}` },
                ...[dataProductSerial.is_enable === "1" && {
                    value: `${e?.item?.serial ?? ""}`
                },
                (dataProductExpiry.is_enable === "1" || dataMaterialExpiry.is_enable === "1") && {
                    value: `${e?.item?.lot ?? ""}`
                },
                (dataProductExpiry.is_enable === "1" || dataMaterialExpiry.is_enable === "1") && {
                    value: `${e?.item?.expiration_date ? formatMoment(e?.item?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}`
                }],
                { value: `${e?.item?.warehouse_name ?? ""}` },
                { value: `${e?.item?.quantity ? formatNumber(e?.item?.quantity) : ""}` },
                { value: `${e?.item?.warehouse_name_qc ?? ""}` },
                { value: `${e?.item?.quantity_error ? formatNumber(e?.item?.quantity_error) : ""}` },
            ]),
        },
    ];

    return (
        <div className='h-full'>
            <div className='flex items-center justify-between'>
                {/* <div className='flex items-center gap-1'>
                    <h1 className="my-1 text-sm 3xl:text-basse">{listTab[isStateModal.isTab - 1]?.name}</h1>
                </div> */}
                <SearchComponent
                    colSpan={1}
                    dataLang={dataLang}
                    sizeIcon={typePageMoblie ? 16 : 20}
                    placeholder={dataLang?.branch_search}
                    onChange={(e) => { onChangeSearch(e) }}
                    classInput={`border ${typePageMoblie ? " !pl-7 !py-1.5" : ""}`}
                    classNameIcon={`${typePageMoblie ? "!z-[999]" : "!z-[999]"}`}
                    classNameBox={`${typePageMoblie ? "w-1/2" : "w-[25%]"}`}
                />
                <div className="flex items-center justify-end gap-1">
                    <OnResetData sOnFetching={(e) => { }} onClick={refetch.bind(this)} />
                    {
                        data?.rResult?.length > 0 && (
                            <ExcelFileComponent
                                dataLang={dataLang}
                                filename={"Danh sách dữ liệu lịch sử nhập kho TP"}
                                multiDataSet={multiDataSet}
                                title="DSDLLS nhập kho TP"
                            />
                        )
                    }
                    {/* <div>
                        <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
                    </div> */}
                </div>
            </div>
            <Customscrollbar
                className={`h-[65vh] bg-white `}>
                {/* className={`${(width > 1100 ? "3xl:h-[calc(100vh_-_410px)] 2xl:h-[calc(100vh_-_390px)] xl:h-[calc(100vh_-_395px)] h-[calc(100vh_-_390px)]" : '3xl:h-[calc(100vh_-_520px)] 2xl:h-[calc(100vh_-_500px)] xl:h-[calc(100vh_-_490px)] h-[calc(100vh_-_490px)]')
                }  scrollbar-thin scrollbar-thumb-slate-300 bg-white scrollbar-track-slate-100`}> */}
                <div>
                    <HeaderTable gridCols={14} display={'grid'}>
                        <ColumnTable colSpan={1} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            STT
                        </ColumnTable>
                        <ColumnTable colSpan={2} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {typePageMoblie ? "Ngày CT" : "Ngày chứng từ"}
                        </ColumnTable>
                        <ColumnTable colSpan={2} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {typePageMoblie ? "Mã CT" : "Mã chứng từ"}
                        </ColumnTable>
                        <ColumnTable colSpan={3} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {dataLang?.productions_orders_modal_exporting_materials_item || 'productions_orders_modal_exporting_materials_item'}
                        </ColumnTable>
                        <ColumnTable colSpan={2} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {typePageMoblie ? "Kho TP" : "Kho thành phẩm"}
                        </ColumnTable>
                        <ColumnTable colSpan={1} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {typePageMoblie ? "SL" : 'Số lượng'}
                        </ColumnTable>
                        <ColumnTable colSpan={2} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            Kho QC
                        </ColumnTable>
                        <ColumnTable colSpan={1} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            SL lỗi
                        </ColumnTable>
                    </HeaderTable>
                    {(isLoading || isRefetching)
                        ?
                        <Loading className="h-80" color="#0f4f9e" />
                        : data?.rResult?.length > 0
                            ?
                            <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px]">
                                {
                                    data?.rResult?.map((e, index) => (
                                        <RowTable gridCols={14} key={e.id.toString()} className={'!py-0'} >
                                            <RowItemTable
                                                colSpan={1}
                                                textAlign={'center'}
                                                textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                                className={'!py-2.5'}
                                            >
                                                {index + 1}
                                            </RowItemTable>
                                            <RowItemTable
                                                colSpan={2}
                                                textAlign={'center'}
                                                textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                                className={'!py-2.5'}
                                            >
                                                {formatMoment(e?.date, FORMAT_MOMENT.DATE_TIME_SLASH_LONG)}
                                            </RowItemTable>
                                            <RowItemTable
                                                colSpan={2}
                                                textAlign={'center'}
                                                textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                                className={'!py-2.5'}
                                            >
                                                {e?.code}
                                            </RowItemTable>
                                            <RowItemTable
                                                colSpan={3}
                                                textAlign={'left'}
                                                textSize={' !text-xs'}
                                                className={'flex items-center gap-1 !py-2.5 !px-0'}
                                            >
                                                <Image
                                                    src={e?.item?.images ?? '/icon/noimagelogo.png'}
                                                    // large={e?.item?.images ?? '/icon/noimagelogo.png'}
                                                    width={36}
                                                    height={36}
                                                    alt={e?.item?.name}
                                                    className={`object-cover rounded-md ${typePageMoblie ? 'w-[24px] h-[24px] min-w-[24px] min-h-[24px]' : "min-w-[36px] min-h-[36px] w-[36px] h-[36px] max-w-[36px] max-h-[36px]"}`}
                                                />
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className='flex flex-col'>
                                                            <span className={`${typePageMoblie ? "text-[8px] leading-tight" : "text-xs"}`}>{e?.item?.item_name}</span>
                                                            <div className={`flex items-center gap-1 ${typePageMoblie ? "text-[6px] leading-tight" : "text-[11px]"}  italic text-gray-500`}>
                                                                <span className='leading-tight'>{e?.item?.product_variation}</span>
                                                                {/* <span>{e?.item?.item_code}</span>-<span>{e?.item?.product_variation}</span> */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center font-oblique">
                                                        {
                                                            dataProductSerial.is_enable === "1" && (
                                                                <div className="flex gap-0.5">
                                                                    <h6 className={`${typePageMoblie ? "text-[6px] leading-tight" : 'text-[12px]'}`}>
                                                                        Serial:
                                                                    </h6>
                                                                    <h6 className={`${typePageMoblie ? "text-[6px] leading-tight px-px" : 'text-[12px]  px-2'} w-[full] text-left`}>
                                                                        {e?.item?.serial == null || e?.item?.serial == "" ? "-" : e?.item?.serial}
                                                                    </h6>
                                                                </div>
                                                            )
                                                        }
                                                        {
                                                            (dataProductExpiry.is_enable === "1" || dataMaterialExpiry.is_enable === "1") && (
                                                                <>
                                                                    <div className="flex gap-0.5">
                                                                        <h6 className={`${typePageMoblie ? "text-[6px] leading-tight" : 'text-[12px]'}`}>
                                                                            Lot:
                                                                        </h6>{" "}
                                                                        <h6 className={`${typePageMoblie ? "text-[6px] leading-tight px-px" : 'text-[12px]  px-2'} w-[full] text-left`}>
                                                                            {e?.item?.lot == null || e?.item?.lot == "" ? "-" : e?.item?.lot}
                                                                        </h6>
                                                                    </div>
                                                                    <div className="flex gap-0.5">
                                                                        <h6 className={`${typePageMoblie ? "text-[6px] leading-tight" : 'text-[12px]'}`}>
                                                                            Date:
                                                                        </h6>{" "}
                                                                        <h6 className={`${typePageMoblie ? "text-[6px] leading-tight px-px" : 'text-[12px]  px-2'} w-[full] text-left`}>
                                                                            {e?.item?.expiration_date ? formatMoment(e?.item?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : "-"}
                                                                        </h6>
                                                                    </div>
                                                                </>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </RowItemTable>
                                            <RowItemTable
                                                colSpan={2}
                                                textAlign={'center'}
                                                textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                                className={'!py-2.5'}
                                            >
                                                {e?.item?.warehouse_name}
                                            </RowItemTable>
                                            <RowItemTable
                                                colSpan={1}
                                                textAlign={'center'}
                                                textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                                className={'!py-2.5 font-semibold'}
                                            >
                                                {e?.item?.quantity > 0 ? formatNumber(e?.item?.quantity) : '-'}
                                            </RowItemTable>
                                            <RowItemTable
                                                colSpan={2}
                                                textAlign={'center'}
                                                textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                                className={'bg-[#FFEEF0] h-full !py-2.5 flex flex-col justify-center'}
                                            >
                                                {e?.item?.warehouse_name_qc}
                                            </RowItemTable>
                                            <RowItemTable
                                                colSpan={1}
                                                textAlign={'center'}
                                                textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                                className={'bg-[#FFEEF0] font-semibold h-full !py-2.5 flex flex-col justify-center'}
                                            >
                                                {e?.item?.quantity_error > 0 ? formatNumber(e?.item?.quantity_error) : '-'}
                                            </RowItemTable>
                                        </RowTable>
                                    ))
                                }
                            </div>
                            :
                            <NoData />
                    }
                </div>
            </Customscrollbar>
            <ContainerPagination>
                {/* <TitlePagination
                    dataLang={dataLang}
                    totalItems={data?.output?.iTotalDisplayRecords}
                /> */}
                <Pagination
                    postsPerPage={limit}
                    totalPosts={Number(data?.output?.iTotalDisplayRecords)}
                    paginate={paginate}
                    currentPage={router.query?.page || 1}
                />
            </ContainerPagination>
        </div>
    )
})

export default TabWarehouseHistory