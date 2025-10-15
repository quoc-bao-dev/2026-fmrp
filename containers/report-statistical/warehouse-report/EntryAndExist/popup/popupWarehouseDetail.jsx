import CloseXIcon from '@/components/icons/common/CloseXIcon'
import OnResetData from '@/components/UI/btnResetData/btnReset'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit'
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet'
import Loading from '@/components/UI/loading/loading'
import NoData from '@/components/UI/noData/nodata'
import Pagination from '@/components/UI/pagination'
import { useLanguageContext } from '@/context/ui/LanguageContext'
import formatNumber from '@/utils/helpers/formatnumber'
import { motion } from 'framer-motion'
import moment from 'moment'
import Image from 'next/image'
import { useState } from 'react'
import { useExportExcelDetail } from '../hooks/useExportExcelDetail'
import {
  useGetAllDetailInItems,
  useGetAllDetailOutItems,
  useGetDetailInItems,
  useGetDetailOutItems,
} from '../hooks/useGetDetailInItems'

const PopupWarehouseDetail = ({ isOpen, onClose, itemData, type = 'import', dateRange, selectedWarehouse }) => {
  const dataLang = useLanguageContext()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Xác định loại thống kê dựa trên type
  const isImport = type === 'import'
  const title = isImport ? 'Thống kê nhập kho' : 'Thống kê xuất kho'
  const filename = isImport ? 'Danh sách nhập kho' : 'Danh sách xuất kho'
  const quantityLabel = isImport ? 'Số lượng nhập' : 'Số lượng xuất'

  // Sử dụng hook phù hợp dựa trên type
  const requestParams = {
    item_id: itemData?.item_id,
    page: currentPage,
    limit: itemsPerPage,
    item_variation_id: itemData?.item_variation_id,
    item_type: itemData?.item_type,
    ...(dateRange?.startDate !== undefined && { start_date: dateRange.startDate }),
    ...(dateRange?.endDate !== undefined && { end_date: dateRange.endDate }),
    ...(selectedWarehouse?.value !== undefined && { warehouses_id: selectedWarehouse.value }),
  }

  // Tạo params cho việc lấy tất cả dữ liệu (không có page và limit)
  const allDataParams = {
    item_id: itemData?.item_id,
    item_variation_id: itemData?.item_variation_id,
    item_type: itemData?.item_type,
    ...(dateRange?.startDate !== undefined && { start_date: dateRange.startDate }),
    ...(dateRange?.endDate !== undefined && { end_date: dateRange.endDate }),
    ...(selectedWarehouse?.value !== undefined && { warehouses_id: selectedWarehouse.value }),
  }

  const {
    data: detailInItems,
    isLoading: isLoadingIn,
    refetch: refetchInItems,
  } = useGetDetailInItems(isImport && !!itemData ? requestParams : null)

  const {
    data: detailOutItems,
    isLoading: isLoadingOut,
    refetch: refetchOutItems,
  } = useGetDetailOutItems(!isImport && !!itemData ? requestParams : null)

  // Hook để lấy tất cả dữ liệu cho việc xuất Excel - enabled khi có itemData
  const { data: allDetailInItems, refetch: refetchAllInItems } = useGetAllDetailInItems(
    allDataParams,
    isImport && !!itemData
  )

  const { data: allDetailOutItems, refetch: refetchAllOutItems } = useGetAllDetailOutItems(
    allDataParams,
    !isImport && !!itemData
  )

  // Chọn dữ liệu phù hợp
  const detailItems = isImport ? detailInItems : detailOutItems
  const isLoading = isImport ? isLoadingIn : isLoadingOut
  const refetch = isImport ? refetchInItems : refetchOutItems

  // Dữ liệu cho việc xuất Excel (tất cả dữ liệu)
  const allDetailItems = isImport ? allDetailInItems : allDetailOutItems

  // Hook xuất Excel với tất cả dữ liệu
  const { multiDataSet } = useExportExcelDetail(allDetailItems, type)

  // Hooks sẽ tự động refetch khi requestParams thay đổi nhờ dependency của React Query

  const handleReload = () => {
    // Reset về trang đầu tiên
    setCurrentPage(1)

    // Tải lại dữ liệu dựa trên type
    if (refetch) {
      refetch()
    }

    // Tải lại dữ liệu cho Excel
    if (isImport && refetchAllInItems) {
      refetchAllInItems()
    } else if (!isImport && refetchAllOutItems) {
      refetchAllOutItems()
    }
  }

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1) // Reset về trang đầu khi thay đổi số lượng item per page
  }

  if (!isOpen || !itemData) return null

  return (
    <div className="fixed inset-0 bg-[#25387A40] bg-opacity-50 flex items-center justify-center z-[999] backdrop-blur-sm">
      <div className="bg-white w-[1085px] p-6 rounded-3xl flex flex-col gap-6 shadow-[1px_0px_0px_0px_#00000026_inset,-6px_0px_24px_0px_#1F232914]">
        <div className="flex justify-between items-center">
          <h2 className="responsive-text-2xl text-neutral-07 font-bold">{title}</h2>
          <div className="flex gap-3 items-center">
            <OnResetData sOnFetching={() => {}} onClick={handleReload} className="!py-3" />
            <ExcelFileComponent
              dataLang={dataLang}
              filename={filename}
              title={isImport ? 'DSNK' : 'DSXK'}
              multiDataSet={multiDataSet}
              classBtn="!py-3"
            />
            <motion.div
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9, rotate: -90 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="size-6 shrink-0 text-neutral-02 cursor-pointer ml-5"
              onClick={onClose}
            >
              <CloseXIcon className="size-full" />
            </motion.div>
          </div>
        </div>
        <div className="bg-primary-06 p-2 rounded-lg flex gap-2">
          <Image
            src={detailItems?.summary?.image || '/productionPlan/default-product.svg'}
            alt={isImport ? 'icon-import' : 'icon-export'}
            width={40}
            height={40}
            className="size-10 flex-shrink-0 rounded bg-neutral-01"
          />
          <div className="flex w-full items-center">
            <div className="flex-1 flex flex-col gap-1">
              <h3 className="responsive-text-sm text-neutral-07 font-semibold">{detailItems?.summary?.name}</h3>
              <p className="responsive-text-sm text-neutral-03">{detailItems?.summary?.item_variation}</p>
              <p className="responsive-text-sm text-typo-blue-2">{detailItems?.summary?.code}</p>
              <span className="w-fit py-[5px] px-1.5 rounded bg-[#3EC3F733] responsive-text-sm text-[#076A94]">
                Thành phẩm
              </span>
            </div>
            <p className="w-[195px] flex flex-col justify-center items-center responsive-text-sm text-neutral-07 font-semibold">
              ĐVT: {detailItems?.summary?.unit}
            </p>
            <p className="w-[185px] flex flex-col justify-center items-center responsive-text-sm text-new-blue font-semibold">
              Tổng SL: {formatNumber(Number(detailItems?.summary?.total_quantity))}
            </p>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="grid grid-cols-16 border-b border-[#F3F3F4]">
            <h4 className="col-span-1 flex justify-center items-center responsive-text-sm text-neutral-07 font-semibold py-2 px-3">
              STT
            </h4>
            <h4 className="col-span-3 flex justify-center items-center responsive-text-sm text-neutral-07 font-semibold py-2 px-3">
              Ngày duyệt kho
            </h4>
            <h4 className="col-span-3 flex justify-center items-center responsive-text-sm text-neutral-07 font-semibold py-2 px-3">
              Ngày chứng từ
            </h4>
            <h4 className="col-span-3 flex justify-center items-center responsive-text-sm text-neutral-07 font-semibold py-2 px-3">
              Mã chứng từ
            </h4>
            <h4 className="col-span-3 flex justify-center items-center responsive-text-sm text-neutral-07 font-semibold py-2 px-3">
              Diễn giải
            </h4>
            <h4 className="col-span-3 flex justify-center items-center responsive-text-sm text-neutral-07 font-semibold py-2 px-3">
              {quantityLabel}
            </h4>
          </div>
          <Customscrollbar className="max-h-[40vh]">
            {isLoading ? (
              <Loading color="#0f4f9e" />
            ) : detailItems?.data?.length > 0 ? (
              detailItems?.data?.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-16 border-[#F3F3F4] ${
                    index === detailItems?.data?.length - 1 ? 'border-b-0' : 'border-b'
                  }`}
                >
                  <h4 className="col-span-1 flex justify-center items-center responsive-text-sm text-neutral-07 py-2 px-3">
                    {index + 1}
                  </h4>
                  <div className="col-span-3 flex justify-center items-center text-neutral-07 py-2 px-3">
                    <div className="flex flex-col gap-2">
                      <span className="responsive-text-sm">
                        {moment(item?.document_date_warehouse).format('DD/MM/YYYY')}
                      </span>
                      <span className="responsive-text-xs">
                        {moment(item?.document_date_warehouse).format('HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3 flex justify-center items-center text-neutral-07 py-2 px-3">
                    <div className="flex flex-col gap-2">
                      <span className="responsive-text-sm">{moment(item?.document_date).format('DD/MM/YYYY')}</span>
                      <span className="responsive-text-xs">{moment(item?.document_date).format('HH:mm:ss')}</span>
                    </div>
                  </div>
                  <div className="col-span-3 flex justify-center items-center responsive-text-sm text-new-blue font-semibold py-2 px-3">
                    {item?.document_code}
                  </div>
                  <div className="col-span-3 flex justify-center items-center responsive-text-sm text-neutral-07 py-2 px-3">
                    {item?.document_type}
                  </div>
                  <div className="col-span-3 flex justify-center items-center responsive-text-sm text-neutral-07 py-2 px-3">
                    {formatNumber(Number(item?.quantity))}
                  </div>
                </div>
              ))
            ) : (
              <NoData type="report" classNameImage="w-[245px]" />
            )}
          </Customscrollbar>
        </div>
        <div className="flex justify-between items-center">
          <Pagination
            postsPerPage={itemsPerPage}
            totalPosts={detailItems?.recordsTotal || 0}
            paginate={setCurrentPage}
            currentPage={currentPage}
          />
          {detailItems?.data?.length > 0 && (
            <DropdowLimit sLimit={handleItemsPerPageChange} limit={itemsPerPage} dataLang={dataLang} />
          )}
        </div>
      </div>
    </div>
  )
}

export default PopupWarehouseDetail
