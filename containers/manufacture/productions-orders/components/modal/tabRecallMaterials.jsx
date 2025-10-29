// Thu hồi nvl
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
import { v4 as uddid } from 'uuid';

const initialState = {
    onFetching: false,
    dataTable: [
        {
            id: uddid(),
            date: new Date(),
            codeReceipts: 'NKNB-090524687',
            codeImport: 'NK-080502',
            warehouse: 'Kho bán thành phẩm',
            code: 'NVL-ABC',
            name: 'Xeo Gk Khánh Việt ĐL100',
            unit: 'Cuộn',
            locationWarehouse: 'LSXCT-12122306',
            quantity: 1000,
            user: {
                name: 'Nguyễn Văn Tôn',
                image: '/user-placeholder.jpg'
            },
            note: 'Note',
        },
    ]
}

const TabRecallMaterials = memo(({ isStateModal, width, dataLang, listTab, typePageMoblie }) => {
    const router = useRouter()

    const { paginate } = usePagination()

    const dataSeting = useSetingServer();

    const [isSearch, setIsSearch] = useState("");

    const [isExportHistory, setIsExportHistory] = useState(initialState)

    const onChangeSearch = debounce((e) => { setIsSearch(e.target.value) }, 500)


    const queryStateExportHistory = (key) => setIsExportHistory(x => ({ ...x, ...key }))

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    const { dataProductExpiry, dataProductSerial, dataMaterialExpiry } = useFeature()

    // const { checkAdd, checkExport } = useActionRole(auth, "")
    const { limit, updateLimit: sLimit, updateTotalItems: sTotalItems } = useLimitAndTotalItems()

    const formatNumber = (num) => formatNumberConfig(+num, dataSeting);

    const { data, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ['api_recall_productions', isSearch, router.query?.page],
        queryFn: async () => {
            let formData = new FormData();

            formData.append("search", isSearch);

            formData.append("page", router.query?.page ?? "");

            formData.append("pod_id", isStateModal?.dataDetail?.poi?.poi_id);

            const { data } = await apiProductionsOrders.apiGetRecallProduction(formData)
            return data
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
                    title: "Ngày CT",
                    width: { wch: 4 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Phiếu nhập'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Tên NVL'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Đơn vị tính'}`,
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
                    title: `${'Số lượng'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Kho hàng'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Vị trí kho'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${'Ghi chú'}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
            ],
            data: data?.rResult?.map((e, index) => [
                { value: `${e?.id ? e.id : ""}`, style: { numFmt: "0" } },
                { value: `${e?.date ? formatMoment(e.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}` },
                { value: `${e?.item_name ?? ""}` },
                { value: `${e?.unit_name ?? ""}` },
                { value: `${e?.variation ?? ""}` },
                ...[dataProductSerial.is_enable === "1" && {
                    value: `${e?.serial ?? ""}`
                },
                (dataProductExpiry.is_enable === "1" || dataMaterialExpiry.is_enable === "1") && {
                    value: `${e?.lot ?? ""}`
                },
                (dataProductExpiry.is_enable === "1" || dataMaterialExpiry.is_enable === "1") && {
                    value: `${e?.expiration_date ? formatMoment(e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}`
                }],
                { value: `${e?.quantity ? formatNumber(e?.quantity) : ""}` },
                { value: `${e?.warehouse?.name ?? ""}` },
                { value: `${e?.location?.name ?? ""}` },
                { value: `${e?.note ?? ""}` },
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
                    sizeIcon={typePageMoblie ? 16 : 20}
                    dataLang={dataLang}
                    placeholder={dataLang?.branch_search}
                    onChange={(e) => { onChangeSearch(e) }}
                    classInput={`border ${typePageMoblie ? " !pl-7 !py-1.5" : ""}`}
                    classNameIcon={`${typePageMoblie ? "!z-[999]" : "!z-[999]"}`}
                    classNameBox={`${typePageMoblie ? "w-1/2" : "w-[25%]"}`}
                />
                <div className="flex items-center justify-end gap-1">
                    <OnResetData sOnFetching={(e) => { }} onClick={refetch.bind(this)} />
                    {
                        data?.rResult?.length > 0 &&
                        <ExcelFileComponent
                            dataLang={dataLang}
                            filename={"Danh sách dữ liệu thu hồi NVL"}
                            multiDataSet={multiDataSet}
                            title="DSDL Thu hồi NVL"
                        />
                    }
                    {/* <div>
                        <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
                    </div> */}
                </div>
            </div>
            <Customscrollbar
                className={`h-[65vh]  `}>
                {/* className={`${(width > 1100 ? "3xl:h-[calc(100vh_-_410px)] 2xl:h-[calc(100vh_-_390px)] xl:h-[calc(100vh_-_395px)] h-[calc(100vh_-_390px)]" : '3xl:h-[calc(100vh_-_520px)] 2xl:h-[calc(100vh_-_500px)] xl:h-[calc(100vh_-_490px)] h-[calc(100vh_-_490px)]')
                }  scrollbar-thin scrollbar-thumb-slate-300 bg-white scrollbar-track-slate-100`}> */}
                <div>
                    <HeaderTable gridCols={14} display={'grid'}>
                        <ColumnTable colSpan={2} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {typePageMoblie ? "Ngày CT" : "Ngày chứng từ"}
                        </ColumnTable>
                        <ColumnTable colSpan={2} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            Phiếu nhập
                        </ColumnTable>
                        <ColumnTable colSpan={3} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            Tên NVL
                        </ColumnTable>
                        <ColumnTable colSpan={1} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {typePageMoblie ? "ĐVT" : "Đơn vị tính"}
                        </ColumnTable>
                        <ColumnTable colSpan={1} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            {typePageMoblie ? "SL" : "Số lượng"}
                        </ColumnTable>
                        <ColumnTable colSpan={2} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            Kho hàng
                        </ColumnTable>
                        <ColumnTable colSpan={2} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            Vị trí kho
                        </ColumnTable>
                        <ColumnTable colSpan={1} textAlign={'center'} className={` normal-case ${typePageMoblie ? "!text-[8px]" : "!text-[13px]"}`}>
                            Ghi chú
                        </ColumnTable>
                    </HeaderTable>
                    {(isLoading || isRefetching) ? (
                        <Loading className="h-80" color="#0f4f9e" />
                    ) : data?.rResult?.length > 0 ? (
                        <div className="h-full divide-y divide-slate-200">
                            {data?.rResult?.map((e, index) => (
                                <RowTable gridCols={14} key={`${e?.id?.toString() + "-" + index}`} >
                                    <RowItemTable
                                        colSpan={2}
                                        textAlign={'center'}
                                        textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                        className={''}
                                    >
                                        {e?.date ? formatMoment(e?.date, FORMAT_MOMENT.DATE_TIME_SLASH_LONG) : ""}
                                    </RowItemTable>
                                    {/* <RowItemTable colSpan={1} textAlign={'center'}>
                                        {e.codeReceipts}
                                    </RowItemTable> */}
                                    <RowItemTable
                                        colSpan={2}
                                        textAlign={'center'}
                                        textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                        className={'line-clamp-1 !px-px'}
                                    >
                                        {e?.reference_no}
                                    </RowItemTable>
                                    <RowItemTable
                                        colSpan={3}
                                        textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                        className={'flex items-center gap-1 !py-2.5 !px-1'}
                                    >
                                        <Image
                                            src={e?.images ? e?.images : '/icon/noimagelogo.png'}
                                            // large={e?.images ? e?.images : '/icon/noimagelogo.png'}
                                            width={36}
                                            height={36}
                                            alt={e?.item_name}
                                            className={`object-cover rounded-md ${typePageMoblie ? 'w-[24px] h-[24px] min-w-[24px] min-h-[24px]' : "min-w-[36px] min-h-[36px] w-[36px] h-[36px] max-w-[36px] max-h-[36px]"}`}
                                        />
                                        <div className="flex flex-col gap-1">

                                            <div className='flex flex-col'>
                                                <span className={`${typePageMoblie ? "text-[8px] leading-tight" : "text-xs"}`}>{e?.item_name}</span>
                                                <div className={`flex items-center gap-1 ${typePageMoblie ? "text-[6px] leading-tight" : "text-[11px]"}  italic text-gray-500`}>
                                                    <span className='leading-tight'>{e?.variation}</span>
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
                                                                {e?.serial == null || e?.serial == "" ? "-" : e?.serial}
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
                                                                    {e?.lot == null || e?.lot == "" ? "-" : e?.lot}
                                                                </h6>
                                                            </div>
                                                            <div className="flex gap-0.5">
                                                                <h6 className={`${typePageMoblie ? "text-[6px] leading-tight" : 'text-[12px]'}`}>
                                                                    Date:
                                                                </h6>{" "}
                                                                <h6 className={`${typePageMoblie ? "text-[6px] leading-tight px-px" : 'text-[12px] px-2'} w-[full] text-left`}>
                                                                    {e?.expiration_date ? formatMoment(e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : "-"}
                                                                </h6>
                                                            </div>
                                                        </>
                                                    )
                                                }
                                            </div>
                                        </div>

                                    </RowItemTable>
                                    <RowItemTable
                                        colSpan={1}
                                        textAlign={'center'}
                                        textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                    >
                                        {e?.unit_name}
                                    </RowItemTable>
                                    <RowItemTable
                                        colSpan={1}
                                        textAlign={'center'}
                                        textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                    >
                                        {e?.quantity > 0 ? formatNumber(e?.quantity) : '-'}
                                    </RowItemTable>
                                    <RowItemTable
                                        colSpan={2}
                                        textAlign={'center'}
                                        textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                    >
                                        {e?.warehouse?.name}
                                    </RowItemTable>
                                    <RowItemTable
                                        colSpan={2}
                                        textAlign={'center'}
                                        textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                    >
                                        {e?.location?.name}
                                    </RowItemTable>
                                    <RowItemTable
                                        colSpan={1}
                                        textAlign={'center'}
                                        textSize={`${typePageMoblie ? "text-[8px]" : "!text-xs"}`}
                                    >
                                        {e?.note}
                                    </RowItemTable>
                                </RowTable>
                            ))}
                        </div>
                    ) : <NoData />}
                </div>
            </Customscrollbar>
            {
                <ContainerPagination>
                    {/* <TitlePagination
                    dataLang={dataLang}
                    totalItems={10}
                // totalItems={totalItems?.iTotalDisplayRecords}
                /> */}
                    <Pagination
                        postsPerPage={limit}
                        totalPosts={Number(data?.output?.iTotalDisplayRecords)}
                        paginate={paginate}
                        currentPage={router.query?.page || 1}
                    />
                </ContainerPagination>
            }
        </div>
    )
})

export default TabRecallMaterials