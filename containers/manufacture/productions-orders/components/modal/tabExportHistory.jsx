// lich su xuất NVL/btp
import apiProductionsOrders from '@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders';
import OnResetData from '@/components/UI/btnResetData/btnReset';
import ContainerPagination from '@/components/UI/common/ContainerPagination/ContainerPagination';
import TitlePagination from '@/components/UI/common/ContainerPagination/TitlePagination';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
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
import { Grid6 } from 'iconsax-react';
import { debounce } from 'lodash';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { memo, useState } from 'react';
import ModalImage from 'react-modal-image';
import { useSelector } from 'react-redux';
const TabExportHistory = memo(({ isStateModal, width, dataLang, listTab, typePageMoblie, isState }) => {

    const router = useRouter()

    const dataSeting = useSetingServer()

    const { paginate } = usePagination()
    //search mã ct
    const [isSearch, setIsSearch] = useState("");

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems()

    const formatNumber = (num) => formatNumberConfig(+num, dataSeting);

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    // const { checkAdd, checkExport } = useActionRole(auth, "")

    const onChangeSearch = debounce((e) => { setIsSearch(e.target.value) }, 500)

    const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature()

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['api_get_suggest_exporting', isSearch, router.query?.page, isState.openModal, isStateModal.isTab],
        queryFn: async () => {
            let formData = new FormData();

            formData.append("search", isSearch);

            formData.append("page", router.query?.page ?? "");

            formData.append("pod_id", isStateModal?.dataDetail?.poi?.poi_id);

            const res = await apiProductionsOrders.apiGetSuggestExporting(formData)

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
                    title: `${'Đơn vị tính'}`,
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
                { value: `${e?.item?.unit_name ?? ""}` },
                { value: `${e?.item?.quantity_export ? formatNumber(e?.item?.quantity_export) : ""}` },
            ]),
        },
    ];


    return (
        <div className='h-full overflow-x-hidden'>
            <div className='flex items-center justify-between'>
                {/* <div className='flex items-center gap-1'>
                    <h1 className="my-1 text-sm 3xl:text-basse">{listTab[isStateModal.isTab - 1]?.name}</h1>
                </div> */}
                <SearchComponent
                    colSpan={2}
                    dataLang={dataLang}
                    placeholder={dataLang?.branch_search}
                    onChange={(e) => onChangeSearch(e)}
                    sizeIcon={typePageMoblie ? 16 : 20}
                    classInput={`border ${typePageMoblie ? " !pl-7 !py-1.5" : ""}`}
                    classNameIcon={`${typePageMoblie ? "!z-[999]" : "!z-[999]"}`}
                    classNameBox={`${typePageMoblie ? "w-1/2" : "w-[25%]"}`}
                />
                <div className="flex items-center justify-end gap-1">
                    <OnResetData sOnFetching={(e) => { }} onClick={refetch.bind(this)} />
                    {
                        data?.rResult?.length > 0 &&
                        (
                            <ExcelFileComponent
                                dataLang={dataLang}
                                filename={"Danh sách dữ liệu lịch sử xuất NVL/BTP"}
                                multiDataSet={multiDataSet}
                                title="DSDLLS NVL/BTP"
                            />

                        )
                    }
                    {/* <div>
                        <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
                    </div> */}
                </div>
            </div>
            <Customscrollbar
                className={`h-[65vh] w-full overflow-x-auto bg-white`}>
                {/* className={`${(width > 1100 ? "3xl:h-[calc(100vh_-_410px)] 2xl:h-[calc(100vh_-_390px)] xl:h-[calc(100vh_-_395px)] h-[calc(100vh_-_390px)]" : '3xl:h-[calc(100vh_-_520px)] 2xl:h-[calc(100vh_-_500px)] xl:h-[calc(100vh_-_490px)] h-[calc(100vh_-_490px)]')
                }  scrollbar-thin scrollbar-thumb-slate-300 bg-white scrollbar-track-slate-100`}> */}
                <div>
                    <HeaderTable gridCols={12} display={'grid'}>
                        <ColumnTable colSpan={1} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            STT
                        </ColumnTable>
                        <ColumnTable colSpan={2} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {typePageMoblie ? 'Ngày CT' : (dataLang?.productions_orders_modal_exporting_materials_document_date || 'productions_orders_modal_exporting_materials_document_date')}
                        </ColumnTable>
                        <ColumnTable colSpan={2} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {typePageMoblie ? 'Mã CT' : (dataLang?.productions_orders_modal_exporting_materials_document_code || 'productions_orders_modal_exporting_materials_document_code')}
                        </ColumnTable>
                        <ColumnTable colSpan={3} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {dataLang?.productions_orders_modal_exporting_materials_item || 'productions_orders_modal_exporting_materials_item'}
                        </ColumnTable>
                        <ColumnTable colSpan={2} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {dataLang?.productions_orders_modal_exporting_materials_unit || 'productions_orders_modal_exporting_materials_unit'}
                        </ColumnTable>
                        <ColumnTable colSpan={2} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {dataLang?.productions_orders_modal_exporting_materials_quantity || 'productions_orders_modal_exporting_materials_quantity'}
                        </ColumnTable>
                    </HeaderTable>
                    {
                        (isLoading || isFetching)
                            ?
                            <Loading className="h-80" color="#0f4f9e" />
                            : data?.rResult?.length > 0
                                ?
                                <div className="divide-y divide-slate-200 h-[100%]">
                                    {
                                        data?.rResult?.map((e, index) => (
                                            <RowTable gridCols={12} key={e.id.toString()} >
                                                <RowItemTable colSpan={1} textAlign={'center'} textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}>
                                                    {index + 1}
                                                </RowItemTable>
                                                <RowItemTable colSpan={2} textAlign={'center'} textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}>
                                                    {formatMoment(e.date, FORMAT_MOMENT.DATE_TIME_SLASH_LONG)}
                                                </RowItemTable>
                                                <RowItemTable colSpan={2} textAlign={'center'} textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}>
                                                    {e.code}
                                                </RowItemTable>
                                                <RowItemTable colSpan={3} textAlign={'left'} className={'flex items-center gap-1'}>
                                                    <Image
                                                        src={e?.item?.images ?? '/icon/noimagelogo.png'}
                                                        // large={e?.item?.images ?? '/icon/noimagelogo.png'}
                                                        width={36}
                                                        height={36}
                                                        alt={e?.item?.name}
                                                        className={`object-cover rounded-md ${typePageMoblie ? 'w-[24px] h-[24px] min-w-[24px] min-h-[24px]' : "min-w-[36px] min-h-[36px] w-[36px] h-[36px] max-w-[36px] max-h-[36px]"}`} 
                                                        />
                                                    <div className={`flex flex-col ${typePageMoblie ? "gap-px" : "gap-1"}`}>
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
                                                <RowItemTable colSpan={2} textAlign={'center'} textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}>
                                                    {e?.item?.unit_name}
                                                </RowItemTable>
                                                <RowItemTable colSpan={2} textAlign={'center'} textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`} className={'font-semibold'}>
                                                    {e?.item?.quantity_export > 0 ? formatNumber(e?.item?.quantity_export) : '-'}
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
                    totalPosts={data?.output?.iTotalDisplayRecords}
                    paginate={paginate}
                    currentPage={router.query?.page || 1}
                />
            </ContainerPagination>
        </div>
    )
})

export default TabExportHistory