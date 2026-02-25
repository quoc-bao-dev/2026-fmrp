import OnResetData from '@/components/UI/btnResetData/btnReset'
import { RowItemTable } from '@/components/UI/common/Table'
import { TagColorProduct, TagExpiryStatus } from '@/components/UI/common/Tag/TagStatus'
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit'
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet'
import SearchComponent from '@/components/UI/filterComponents/searchComponent'
import Pagination from '@/components/UI/pagination'
import SelectSearchReport from '@/components/common/select/SelectSearchReport'
import ReportLayout from '@/components/layout/ReportLayout'
import TableSection from '@/components/layout/ReportLayout/TableSection'
import { useWarehouseProperties } from '@/containers/manufacture/warehouse-transfer/hooks/useWarehouseProperties'
import { useLanguageContext } from '@/context/ui/LanguageContext'
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches'
import usePagination from '@/hooks/usePagination'
import useStatusExprired from '@/hooks/useStatusExprired'
import { useGetCountItemsExpired } from '@/managers/api/report/useGetCountItemsExpired'
import formatNumber from '@/utils/helpers/formatnumber'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDebounce } from 'use-debounce'
import { useExportExcel } from './hooks/useExportExcel'
import { useGetListExpiryWarning } from './hooks/useGetListExpiryWarning'

const breadcrumbItems = [
    {
        label: `Báo cáo`,
    },
    {
        label: `Báo cáo tồn kho`,
    },
    {
        label: `Cảnh báo hạn sử dụng`,
        href: '/report-statistical/warehouse-report/expiry-warning',
    },
]

const ExpiryWarning = (props) => {
    const router = useRouter()
    const { paginate } = usePagination()
    const dataLang = useLanguageContext()
    const statusExprired = useStatusExprired()
    const featureState = useSelector(state => state.feature)
    const { selectedBranches, setSelectedBranches } = usePersistedBranches()
    const { isWarehousePropertiesEnabled, warehousePropertyLabels } = useWarehouseProperties()

    const [itemType, setItemType] = useState(null) // Loại: NVL hoặc TP
    const [status, setStatus] = useState(null) // Tình trạng: Sắp hết hạn hoặc Hết hạn
    const [isInitialized, setIsInitialized] = useState(false)
    const [limit, setLimit] = useState(15)
    const [searchValue, setSearchValue] = useState('')
    const [debouncedSearchValue] = useDebounce(searchValue, 500)

    const currentPage = Number(router.query.page) || 1

    // Kiểm tra quyền hiển thị trang dựa vào feature (giống navbar)
    const isMaterialExpiryEnabled =
        featureState?.dataMaterialExpiry?.is_enable &&
        String(featureState.dataMaterialExpiry.is_enable) === '1'

    const isProductExpiryEnabled =
        featureState?.dataProductExpiry?.is_enable &&
        String(featureState.dataProductExpiry.is_enable) === '1'

    const shouldShowExpiryWarningPage = isMaterialExpiryEnabled || isProductExpiryEnabled

    // Options cho bộ lọc
    const itemTypeOptions = [
        { value: '', label: 'Tất cả' },
        { value: 'material', label: 'Nguyên vật liệu' },
        { value: 'product', label: 'Thành phẩm' },
    ]

    const statusOptions = [
        { value: '', label: 'Tất cả' },
        { value: 'expiring', label: 'Sắp hết hạn' },
        { value: 'expired', label: 'Hết hạn' },
    ]

    const {
        data: dataExpiryWarning,
        isFetching,
        refetch: refetchExpiryWarning,
    } = useGetListExpiryWarning({
        page: currentPage,
        limit: limit,
        search: debouncedSearchValue,
        filter: {
            branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
            type_items: itemType?.value,
            status: status?.value,
        },
    })

    const { data: dataCountItemsExpired } = useGetCountItemsExpired({
        page: currentPage,
        limit: limit,
        search: debouncedSearchValue,
        filter: {
            branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
            type_items: itemType?.value,
            status: status?.value,
        },
    })

    useEffect(() => {
        if (refetchExpiryWarning && isInitialized) {
            refetchExpiryWarning()
        }
    }, [limit, itemType, status, debouncedSearchValue, currentPage, refetchExpiryWarning, isInitialized, selectedBranches])

    // Nếu sau khi lọc lại mà tổng số trang < trang hiện tại
    // thì tự động đưa về trang cuối cùng
    useEffect(() => {
        if (!dataExpiryWarning?.recordsTotal || !limit) return

        const totalItems = Number(dataExpiryWarning.recordsTotal) || 0
        const totalPages = totalItems > 0 ? Math.ceil(totalItems / Number(limit)) : 1

        if (currentPage > totalPages) {
            router.push({
                pathname: router.pathname,
                query: { ...router.query, page: totalPages },
            })
        }
    }, [dataExpiryWarning?.recordsTotal, limit, currentPage, router])

    useEffect(() => {
        setIsInitialized(true)
    }, [])

    // Nếu không bật feature (theo logic giống navbar) thì redirect về trang nhập xuất tồn
    useEffect(() => {
        // Chờ khi featureState đã có dữ liệu
        if (!featureState) return

        if (!shouldShowExpiryWarningPage) {
            router.replace('/report-statistical/warehouse-report/entry-and-exist')
        }
    }, [featureState, shouldShowExpiryWarningPage, router])



    const handleItemTypeChange = (value) => {
        const selected = itemTypeOptions.find((opt) => opt.value === value)
        if (selected) {
            setItemType(selected)
        } else {
            setItemType(null)
        }
    }

    const handleClearItemType = () => {
        setItemType(null)
    }

    const handleStatusChange = (value) => {
        const selected = statusOptions.find((opt) => opt.value === value)
        if (selected) {
            setStatus(selected)
        } else {
            setStatus(null)
        }
    }

    const handleClearStatus = () => {
        setStatus(null)
    }

    const handleSearch = (value) => {
        const searchValue = value?.target?.value || (typeof value === 'string' ? value : '')
        setSearchValue(searchValue)
    }

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit)
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: 1 },
        })
    }

    const { multiDataSet } = useExportExcel(dataExpiryWarning, {
        isWarehousePropertiesEnabled,
        warehousePropertyLabels,
    })

    // Format ngày
    const formatDate = (dateString) => {
        if (!dateString) return '-'
        if (dateString === '1970-01-01') return '-'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('vi-VN')
        } catch {
            return dateString
        }
    }

    // Tính số ngày còn lại
    const getDaysRemaining = (expiryDate) => {
        if (!expiryDate) return null
        try {
            const expiry = new Date(expiryDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            expiry.setHours(0, 0, 0, 0)
            const diffTime = expiry - today
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays
        } catch {
            return null
        }
    }

    // Map item_type sang dataKey cho TagColorProduct
    const getTypeDataKey = (itemType) => {
        const typeMap = {
            product: 0, // products -> lime
            material: 1, // material -> orange
        }
        return typeMap[itemType] ?? 0
    }

    // Map item_type sang name key cho dataLang
    const getTypeNameKey = (itemType) => {
        const nameMap = {
            product: 'products',
            material: 'material',
        }
        return nameMap[itemType] || ''
    }


    return (
        <>
            <ReportLayout
                title={'Cảnh báo hạn sử dụng'}
                statusExprired={statusExprired}
                breadcrumbItems={breadcrumbItems}
                branchValue={selectedBranches}
                onBranchChange={setSelectedBranches}
                onBranchClear={() => setSelectedBranches([])}
                filterSection={
                    <div>

                        <div className="w-full items-start flex justify-between gap-4">
                            <div className="flex gap-3">
                                <SelectSearchReport
                                    placeholder="Loại"
                                    onChange={handleItemTypeChange}
                                    onClear={handleClearItemType}
                                    className="w-[150px] 2xl:w-[180px]"
                                    options={itemTypeOptions}
                                    value={itemType}
                                />

                                <SelectSearchReport
                                    placeholder="Tình trạng"
                                    onChange={handleStatusChange}
                                    onClear={handleClearStatus}
                                    className="w-[180px] 2xl:w-[200px]"
                                    options={statusOptions}
                                    value={status}
                                />
                                <div
                                    className="flex flex-col gap-2 rounded-2xl shadow-[0px_1px_8px_0px_#00000012] py-2 px-3"
                                    style={{ backgroundColor: '#fff5de' }}
                                >
                                    <div className="flex gap-2 items-center">
                                        <h3 className="text-sm font-medium" style={{ color: '#ff947a' }}>
                                            Nguyên Vật Liệu
                                        </h3>
                                    </div>
                                    <p className="text-lg text-center font-normal text-neutral-03">
                                        <span className="text-[#ff947a] font-semibold">
                                            {dataCountItemsExpired?.count_material}
                                        </span>
                                    </p>
                                </div>

                                <div
                                    className=" min-w-[140px] flex flex-col gap-2 rounded-2xl shadow-[0px_1px_8px_0px_#00000012] py-2 px-3"
                                    style={{ backgroundColor: '#dcfce8' }}
                                >
                                    <div className="flex gap-2 items-center justify-center">
                                        <h3 className="text-sm font-medium" style={{ color: '#14b42e' }}>
                                            Thành Phẩm
                                        </h3>
                                    </div>
                                    <p className="text-lg text-center font-normal text-neutral-03">
                                        <span className="text-[#14b42e]  font-semibold">
                                            {dataCountItemsExpired?.count_product}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-center ">
                                <SearchComponent
                                    dataLang={dataLang}
                                    onChange={handleSearch}
                                    value={searchValue}
                                    classNameBox="!py-2 2xl:!p-2.5"
                                />
                                <OnResetData sOnFetching={() => { }} onClick={refetchExpiryWarning} className="!py-3" />
                                <ExcelFileComponent
                                    dataLang={dataLang}
                                    filename="Báo cáo cảnh báo hạn sử dụng"
                                    title="Cảnh báo hạn sử dụng"
                                    multiDataSet={multiDataSet}
                                    classBtn="!py-3"
                                />
                            </div>
                        </div>

                        {/* number_day_warehouse, number_day_warehouse_products */}
                    </div>
                }
                tableSection={
                    <TableSection
                        fixedColumns={[
                            { title: 'STT', width: 'w-14', textAlign: 'center' },
                            { title: 'Mã hàng', width: 'w-32', textAlign: 'left' },
                            { title: 'Tên hàng', width: 'w-64', textAlign: 'left' },
                        ]}
                        scrollableColumns={[
                            { title: 'Loại', width: 'w-32', textAlign: 'center' },
                            { title: 'Đơn vị tính', width: 'w-28', textAlign: 'center' },
                            { title: 'Kho hàng', width: 'w-40', textAlign: 'center' },
                            { title: 'Vị trí', width: 'w-32', textAlign: 'center' },
                            { title: 'Lot', width: 'w-32', textAlign: 'center' },
                            { title: 'Hạn sử dụng', width: 'w-36', textAlign: 'center' },
                            { title: 'Ngày còn lại', width: 'w-32', textAlign: 'center' },
                            { title: 'Số lượng', width: 'w-32', textAlign: 'center' },
                            { title: 'Tình trạng', width: 'w-36', textAlign: 'center' },
                        ]}
                        groupedHeaders={[]}
                        data={dataExpiryWarning?.data}
                        isFetching={isFetching}
                        renderFixedRow={(item, index) => (
                            <>
                                <RowItemTable className="w-14 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                                    {index + 1}
                                </RowItemTable>
                                <RowItemTable className="w-32 flex flex-col justify-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 break-words">
                                    {item.item_code}
                                </RowItemTable>
                                <RowItemTable className="w-64 flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                                    <div className="flex flex-col gap-1 justify-start">
                                        <p className="text-left responsive-text-sm text-neutral-07 font-normal">{item.item_name}</p>
                                        {item.item_variation && (
                                            <p className="text-left responsive-text-xxs text-neutral-03 font-normal">
                                                {item.item_variation}
                                            </p>
                                        )}
                                        {/* Thuộc tính kho */}
                                        {item.item_type === 'material' && Array.isArray(warehousePropertyLabels) && warehousePropertyLabels.length > 0 &&
                                            warehousePropertyLabels.map(({ key, label }) => {
                                                if (!label) return null
                                                const value = item?.[key]

                                                // Nếu tắt thuộc tính kho và không có giá trị thì ẩn
                                                if (!isWarehousePropertiesEnabled && (value == null || value === '')) return null

                                                return (
                                                    <p
                                                        key={key}
                                                        className="text-left responsive-text-xxs text-neutral-03 font-normal"
                                                    >
                                                        {label}:{' '}
                                                        <span>
                                                            {value == null || value === '' ? '-' : value}
                                                        </span>
                                                    </p>
                                                )
                                            })
                                        }
                                    </div>
                                </RowItemTable>
                            </>
                        )}
                        renderScrollableRow={(item, index) => (
                            <>
                                {/* Loại */}
                                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                                    {item.item_type && (
                                        <TagColorProduct
                                            dataLang={dataLang}
                                            dataKey={getTypeDataKey(item.item_type)}
                                            name={getTypeNameKey(item.item_type)}
                                            className="!px-1"
                                            textSize="text-[11px]"
                                        />
                                    )}
                                </RowItemTable>

                                {/* Đơn vị tính */}
                                <RowItemTable className="w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                                    {item.unit_name || '-'}
                                </RowItemTable>

                                {/* Kho hàng */}
                                <RowItemTable className="w-40 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                                    {item.warehouse_name || '-'}
                                </RowItemTable>

                                {/* Vị trí */}
                                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                                    {item.location || '-'}
                                </RowItemTable>

                                {/* Lot */}
                                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                                    {item.lot || '-'}
                                </RowItemTable>

                                {/* Hạn sử dụng */}
                                <RowItemTable className="w-36 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                                    {formatDate(item.expiry_date)}
                                </RowItemTable>

                                {/* Ngày còn lại */}
                                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                                    {item.days_remaining !== null && item.days_remaining > 0
                                        ? formatNumber(item.days_remaining)
                                        : '-'}
                                </RowItemTable>

                                {/* Số lượng */}
                                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                                    {Number(item.quantity) === 0 ? '-' : formatNumber(Number(Math.abs(item.quantity || 0)))}
                                </RowItemTable>

                                {/* Tình trạng */}
                                <RowItemTable className="w-36 flex justify-center items-center py-2 px-3 text-neutral-07 font-normal flex-shrink-0">
                                    <TagExpiryStatus
                                        dataLang={dataLang}
                                        status={item.status}
                                        className="!px-1"
                                        textSize="text-[11px]"
                                    />
                                </RowItemTable>
                            </>
                        )}
                    />
                }
                totalSection={
                    dataExpiryWarning?.recordsTotal > 0 && (
                        <Pagination
                            postsPerPage={limit}
                            totalPosts={Number(dataExpiryWarning?.recordsTotal) || 0}
                            paginate={paginate}
                            currentPage={currentPage}
                        />
                    )
                }
                paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
            />
        </>
    )
}

export default ExpiryWarning
