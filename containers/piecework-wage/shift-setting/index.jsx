import { TrashIcon } from '@/components/icons'
import EditIcon from '@/components/icons/common/EditIcon'
import BreadcrumbCustom from '@/components/UI/breadcrumb/BreadcrumbCustom'
import OnResetData from '@/components/UI/btnResetData/btnReset'
import ContainerPagination from '@/components/UI/common/ContainerPagination/ContainerPagination'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import { EmptyExprired } from '@/components/UI/common/EmptyExprired'
import { LayOutTableDynamic } from '@/components/UI/common/layout'
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table'
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit'
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet'
import SearchComponent from '@/components/UI/filterComponents/searchComponent'
import SelectComponent from '@/components/UI/filterComponents/selectComponent'
import Loading from '@/components/UI/loading/loading'
import LoadingButton from '@/components/UI/loading/loadingButton'
import MultiValue from '@/components/UI/mutiValue/multiValue'
import NoData from '@/components/UI/noData/nodata'
import Pagination from '@/components/UI/pagination'
import PopupConfim from '@/components/UI/popupConfim/popupConfim'
import { CONFIRM_DELETION, TITLE_DELETE } from '@/constants/delete/deleteTable'
import { WARNING_ACTION_STATUS_ROLE } from '@/constants/warningStatus/warningStatus'
import { useBranchList } from '@/hooks/common/useBranch'
import { useLimitAndTotalItems } from '@/hooks/useLimitAndTotalItems'
import usePagination from '@/hooks/usePagination'
import useStatusExprired from '@/hooks/useStatusExprired'
import useToast from '@/hooks/useToast'
import { useSetupShift, useDeleteSetupShift } from '@/managers/api/piecework-wage/useSetupShift'
import { Grid6 } from 'iconsax-react'
import { debounce } from 'lodash'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import PopupShiftSetting from './components/PopupShiftSetting'

// Mock data cho ca làm việc
const mockShiftData = [
  {
    id: 1,
    name: 'Ca sáng',
    timeFrame: '7:00h - 11:00',
    daysOfWeek: ['Thứ 2', 'Thứ 3'],
  },
  {
    id: 2,
    name: 'Ca tối',
    timeFrame: '7:00h - 11:00',
    daysOfWeek: ['Thứ 2', 'Thứ 3'],
  },
  {
    id: 3,
    name: 'Tăng ca',
    timeFrame: '7:00h - 11:00',
    daysOfWeek: ['Thứ 2', 'Thứ 3'],
  },
  {
    id: 4,
    name: 'Ca sáng',
    timeFrame: '7:00h - 11:00',
    daysOfWeek: ['Thứ 4', 'Thứ 5'],
  },
  {
    id: 5,
    name: 'Ca chiều',
    timeFrame: '13:00h - 17:00',
    daysOfWeek: ['Thứ 2', 'Thứ 3'],
  },
  {
    id: 6,
    name: 'Ca đêm',
    timeFrame: '19:00h - 23:00',
    daysOfWeek: ['Thứ 6', 'Thứ 7'],
  },
  {
    id: 7,
    name: 'Ca sáng',
    timeFrame: '7:00h - 11:00',
    daysOfWeek: ['Chủ nhật'],
  },
  {
    id: 8,
    name: 'Ca tối',
    timeFrame: '18:00h - 22:00',
    daysOfWeek: ['Thứ 2', 'Thứ 3', 'Thứ 4'],
  },
  {
    id: 9,
    name: 'Ca sáng',
    timeFrame: '6:00h - 10:00',
    daysOfWeek: ['Thứ 5', 'Thứ 6'],
  },
  {
    id: 10,
    name: 'Ca chiều',
    timeFrame: '14:00h - 18:00',
    daysOfWeek: ['Thứ 7', 'Chủ nhật'],
  },
]

const initialState = {
  keySearch: '',
  idBranch: [], // Array để hỗ trợ multi-select
}

const ShiftSetting = props => {
  const dataLang = props.dataLang
  const isShow = useToast()
  const router = useRouter()
  const statusExprired = useStatusExprired()
  const { paginate } = usePagination()
  const { limit, updateLimit: sLimit } = useLimitAndTotalItems()

  const [isState, sIsState] = useState(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const queryState = key => sIsState(prev => ({ ...prev, ...key }))

  // Hook để xóa setup shift
  const { mutate: deleteSetupShift, isPending: isDeleting } = useDeleteSetupShift({
    onSuccess: data => {
      const messageKey = data?.message || 'deleted_successfully'
      const toastType = data?.isSuccess === true || data?.isSuccess === 1 ? 'success' : 'error'
      isShow(toastType, dataLang?.[messageKey] || messageKey)
      setDeleteTarget(null)
      refetch()
    },
    onError: error => {
      const messageKey = error?.response?.data?.message || error?.message || 'delete_failed'
      isShow('error', dataLang?.[messageKey] || messageKey)
      setDeleteTarget(null)
    },
  })

  // Danh sách chi nhánh
  const { data: listBranch = [] } = useBranchList()

  // Options cho filter chi nhánh
  const branchOptions = useMemo(() => {
    return listBranch || []
  }, [listBranch])

  // Pagination config
  const effectiveLimit = useMemo(() => (limit && Number(limit) > 0 ? Number(limit) : 15), [limit])
  const currentPage = useMemo(() => Number(router.query?.page) || 1, [router.query?.page])

  // Hàm format time từ "HH:mm:ss" sang "HH:mmh" (định nghĩa trước để dùng ở các useMemo khác)
  const formatTime = timeString => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    return `${hours}:${minutes}h`
  }

  // Tạo params cho API với pagination, search và branch filter
  const filterParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: effectiveLimit,
      search: isState.keySearch || undefined,
    }
    
    // Thêm filter[branch_id][0], filter[branch_id][1], ... nếu có chọn branch
    if (isState.idBranch && Array.isArray(isState.idBranch) && isState.idBranch.length > 0) {
      const branchIds = isState.idBranch.map(item => item?.value || item).filter(Boolean)
      if (branchIds.length > 0) {
        params['filter[branch_id]'] = branchIds
      }
    }

    return params
  }, [currentPage, effectiveLimit, isState.keySearch, isState.idBranch])

  // API: Lấy danh sách ca làm việc với pagination
  const { data: setupShiftData, isLoading: isLoadingSetupShift, refetch: refetchSetupShift } = useSetupShift(filterParams)

  // Hàm map day code sang tên tiếng Việt
  const mapDayToVietnamese = dayCode => {
    const dayMap = {
      Mon: 'Thứ 2',
      Tue: 'Thứ 3',
      Wed: 'Thứ 4',
      Thu: 'Thứ 5',
      Fri: 'Thứ 6',
      Sat: 'Thứ 7',
      Sun: 'Chủ nhật',
    }
    return dayMap[dayCode] || dayCode
  }

  // Sắp xếp days theo đúng thứ tự từ Thứ 2 -> Chủ nhật
  const sortDaysByWeekOrder = dayCodes => {
    if (!Array.isArray(dayCodes)) return []
    const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return [...dayCodes].sort((a, b) => {
      const indexA = order.indexOf(a) === -1 ? Number.MAX_SAFE_INTEGER : order.indexOf(a)
      const indexB = order.indexOf(b) === -1 ? Number.MAX_SAFE_INTEGER : order.indexOf(b)
      return indexA - indexB
    })
  }

  // Hook useMemo để map dữ liệu từ API ra format table
  const mappedShiftData = useMemo(() => {
    if (!setupShiftData?.rResult || !Array.isArray(setupShiftData.rResult)) {
      return []
    }

    return setupShiftData.rResult.map(item => {
      // Map khung giờ từ time_start và time_end
      const frameHour = `${formatTime(item.time_start)} - ${formatTime(item.time_end)}`

      // Map days từ string "Mon,Tue,Wed" sang array, và sắp xếp từ Thứ 2 -> Chủ nhật
      const days = item.days
        ? sortDaysByWeekOrder(
            item.days
              .split(',')
              .map(day => day.trim())
              .filter(Boolean)
          ).map(day => mapDayToVietnamese(day))
        : []

      return {
        id: item.id,
        name: item.name || '',
        frameHour,
        days,
        // Giữ lại dữ liệu gốc để dùng cho edit
        time_start: item.time_start,
        time_end: item.time_end,
        branch_id: item.branch_id,
        branch_name: item.branch_name,
        daysRaw: item.days, // Giữ nguyên format gốc
      }
    })
  }, [setupShiftData])

  // Log dữ liệu từ API
  useEffect(() => {
    if (setupShiftData) {
      console.log('Setup Shift Data:', setupShiftData)
    }
  }, [setupShiftData])

  // Log dữ liệu đã map
  useEffect(() => {
    if (mappedShiftData.length > 0) {
      console.log('Mapped Shift Data:', mappedShiftData)
    }
  }, [mappedShiftData])


  // Filter dữ liệu từ API (server-side pagination, search, time và shift đã được xử lý)
  const filteredData = useMemo(() => {
    // Tất cả filter đã được xử lý ở server-side, không cần filter client-side
    return mappedShiftData
  }, [mappedShiftData])

  // Pagination từ output của API
  const totalRecords = useMemo(() => {
    // Ưu tiên dùng iTotalDisplayRecords, nếu không có thì dùng iTotalRecords
    return Number(setupShiftData?.output?.iTotalDisplayRecords) || Number(setupShiftData?.output?.iTotalRecords) || filteredData.length
  }, [setupShiftData?.output, filteredData.length])

  // Dữ liệu hiển thị trên table (API đã paginate server-side)
  const paginatedData = useMemo(() => {
    // API đã paginate server-side, dùng trực tiếp filteredData (đã được filter client-side nếu cần)
    return filteredData
  }, [filteredData])


 

  // Tự điều chỉnh về trang 1 nếu limit thay đổi hoặc khi refetch data
  useEffect(() => {
    if (!effectiveLimit || effectiveLimit <= 0) return

    const totalPages = Math.max(1, Math.ceil(totalRecords / effectiveLimit))
    if (currentPage > totalPages && totalPages > 0) {
      paginate(1)
    }
  }, [effectiveLimit, totalRecords, currentPage, paginate])

  // Hàm tìm kiếm - reset về trang 1 khi search thay đổi
  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    queryState({ keySearch: value })
    // Reset về trang 1 khi search thay đổi
    if (currentPage !== 1) {
      paginate(1)
    }
    router.replace('/piecework-wage/shift-setting')
  }, 500)

  // Hàm refetch từ API
  const refetch = () => {
    refetchSetupShift()
      // isShow('success', dataLang?.reloaded_successfully || 'Tải lại thành công')
  }

  // Xuất Excel từ dữ liệu đã map
  const multiDataSet = useMemo(() => [
    {
      columns: [
        {
          title: `${dataLang?.stt || 'STT'}`,
          width: { wch: 6 },
          style: {
            fill: { fgColor: { rgb: 'EFF6FF' } },
            font: { bold: true, name: 'Lexend Deca', color: { rgb: '111827' } },
          },
        },
        {
          title: `${dataLang?.shift_name || 'Tên ca'}`,
          width: { wpx: 160 },
          style: {
            fill: { fgColor: { rgb: 'EFF6FF' } },
            font: { bold: true, name: 'Lexend Deca', color: { rgb: '111827' } },
          },
        },
        {
          title: `${dataLang?.time_frame || 'Khung giờ'}`,
          width: { wpx: 160 },
          style: {
            fill: { fgColor: { rgb: 'EFF6FF' } },
            font: { bold: true, name: 'Lexend Deca', color: { rgb: '111827' } },
          },
        },
        {
          title: `${dataLang?.days_of_week || 'Thứ trong tuần'}`,
          width: { wpx: 200 },
          style: {
            fill: { fgColor: { rgb: 'EFF6FF' } },
            font: { bold: true, name: 'Lexend Deca', color: { rgb: '111827' } },
          },
        },
      ],
      data:
        filteredData?.map((e, index) => [
          { value: index + 1, style: { numFmt: '0', font: { name: 'Lexend Deca' } } },
          { value: `${e.name ? e.name : ''}`, style: { font: { name: 'Lexend Deca' } } },
          { value: `${e.frameHour ? e.frameHour : ''}`, style: { font: { name: 'Lexend Deca' } } },
          { value: `${e.days ? e.days.join(', ') : ''}`, style: { font: { name: 'Lexend Deca' } } },
        ]) || [],
    },
  ], [filteredData, dataLang])

  const breadcrumbItems = [
    {
      label: `${dataLang?.piecework_wage || 'Lương sản lượng'}`,
    },
    {
      label: `${dataLang?.shift_setting || 'Thiết lập ca làm việc'}`,
    },
  ]


  const handleOpenDeletePopup = id => {
    if (isDeleting) return
    setDeleteTarget(id)
  }

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return
    // Đóng modal ngay khi bấm xác nhận
    const targetId = deleteTarget
    setDeleteTarget(null)
    
    // Gọi API xóa ca làm việc
    deleteSetupShift(targetId)
  }

  const popupSubtitle = isDeleting ? (
    <span className='inline-flex items-center gap-2 text-[#003DA0]'>
      <LoadingButton hiddenTitle className='w-4 h-4 text-[#003DA0]' />
      <span>{dataLang?.processing || 'Đang xử lý...'}</span>
    </span>
  ) : (
    CONFIRM_DELETION
  )

  return (
    <div className='min-h-screen relative'>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{dataLang?.shift_setting || 'Thiết lập ca làm việc'}</title>
          </Head>
        }
        breadcrumb={
          <>
            {statusExprired ? (
              <EmptyExprired />
            ) : (
              <React.Fragment>
                <BreadcrumbCustom items={breadcrumbItems} className='3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]' />
              </React.Fragment>
            )}
          </>
        }
        titleButton={
          <>
            <h2 className='text-title-section text-[#52575E] capitalize font-medium'>{dataLang?.shift_setting || 'Thiết lập ca làm việc'}</h2>
            <div className='flex items-center justify-end gap-2'>
              <PopupShiftSetting
                dataLang={dataLang}
                onRefresh={refetch}
                listBranch={listBranch}
                className='responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal rounded-md bg-blue-fmrp text-white btn-animation hover:scale-105'
              />
            </div>
          </>
        }
        table={
          <div className='flex flex-col h-full'>
            <div className='w-full items-center flex justify-between gap-2'>
              <div className='flex gap-3 items-center w-full'>
                <SearchComponent dataLang={dataLang} onChange={_HandleOnChangeKeySearch.bind(this)} colSpan={1} alwaysOpen={true} />
                <SelectComponent
                  options={branchOptions}
                  colSpan={1}
                  onChange={selected => {
                    queryState({ idBranch: selected || [] })
                    // Reset về trang 1 khi filter thay đổi
                    if (currentPage !== 1) {
                      paginate(1)
                    }
                  }}
                  value={isState.idBranch}
                  placeholder={dataLang?.price_quote_branch || 'Chi nhánh'}
                  isClearable={true}
                  isMulti={true}
                  closeMenuOnSelect={false}
                  components={{ MultiValue }}
                />
              </div>

              <div className='flex items-center justify-end space-x-2'>
                <OnResetData sOnFetching={e => {}} onClick={() => refetch()} />
                <div className={``}>
                  {filteredData?.length > 0 && (
                    <ExcelFileComponent multiDataSet={multiDataSet} filename='Danh sách ca làm việc' title='DSCLV' dataLang={dataLang} />
                  )}
                </div>
              </div>
            </div>
            <Customscrollbar className='h-full overflow-y-auto'>
              <div className='w-full'>
                <HeaderTable gridCols={15}>
                  <ColumnTable colSpan={0.5} textAlign={'center'}>
                    {dataLang?.stt || 'STT'}
                  </ColumnTable>
                  <ColumnTable colSpan={3} textAlign={'left'}>
                    {dataLang?.shift_name || 'Tên ca'}
                  </ColumnTable>
                  <ColumnTable colSpan={3} textAlign={'left'}>
                    {dataLang?.time_frame || 'Khung giờ'}
                  </ColumnTable>
                  <ColumnTable colSpan={4} textAlign={'left'}>
                    {dataLang?.days_of_week || 'Thứ trong tuần'}
                  </ColumnTable>
                  <ColumnTable colSpan={3} textAlign={'left'}>
                    {dataLang?.branch_name || 'Chi nhánh'}
                  </ColumnTable>
                  <ColumnTable colSpan={1.5} textAlign={'center'}>
                    {dataLang?.branch_popup_properties || 'Tác vụ'}
                  </ColumnTable>
                </HeaderTable>

                {isLoadingSetupShift || isLoading ? (
                  <Loading className='h-80' color='#0f4f9e' />
                ) : paginatedData?.length > 0 ? (
                  <>
                    <div className='divide-y divide-slate-200 h-[100%]'>
                      {paginatedData.map((e, index) => {
                        // Tính STT dựa trên currentPage và effectiveLimit
                        const stt = (currentPage - 1) * effectiveLimit + index + 1
                        return (
                          <RowTable gridCols={15} key={e.id?.toString() || index}>
                            <RowItemTable colSpan={0.5} textAlign={'center'}>
                              {stt}
                            </RowItemTable>
                            <RowItemTable colSpan={3} textAlign={'left'}>
                              {e.name}
                            </RowItemTable>
                            <RowItemTable colSpan={3} textAlign={'left'}>
                              <span className='text-blue-fmrp'>{e.frameHour}</span>
                            </RowItemTable>
                            <RowItemTable colSpan={4} textAlign={'left'}>
                              {e.days?.join(', ') || ''}
                            </RowItemTable>
                            <RowItemTable colSpan={3} textAlign={'left'}>
                              {e.branch_name || ''}
                            </RowItemTable>
                            <RowItemTable colSpan={1.5} className='flex items-center justify-center space-x-2 text-center'>
                              <PopupShiftSetting
                                dataLang={dataLang}
                                onRefresh={() => {
                                  refetch()
                                }}
                                listBranch={listBranch}
                                editData={e}
                                trigger={
                                  <button
                                    type='button'
                                    className='group hover:border-blue-500 hover:bg-blue-50 rounded-lg p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer'
                                    title='Sửa'
                                  >
                                    <EditIcon className='size-5 text-[#003DA0]' />
                                  </button>
                                }
                                buttonClassName='inline-flex'
                              />
                              <button
                                onClick={() => handleOpenDeletePopup(e.id)}
                                className='group hover:border-red-01 hover:bg-red-02 rounded-lg w-fit p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer'
                                title='Xóa'
                              >
                                <TrashIcon className='size-5 text-[#EE1E1E]' />
                              </button>
                            </RowItemTable>
                          </RowTable>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <NoData />
                )}
              </div>
            </Customscrollbar>
          </div>
        }
        pagination={
          <div className='flex items-center justify-between gap-2'>
            <ContainerPagination>
              <Pagination postsPerPage={effectiveLimit} totalPosts={totalRecords} paginate={paginate} currentPage={currentPage} />
            </ContainerPagination>

            <DropdowLimit sLimit={sLimit} limit={effectiveLimit} dataLang={dataLang} />
          </div>
        }
      />
      {deleteTarget && (
        <PopupConfim
          dataLang={dataLang}
          type='warning'
          nameModel='shift_setting'
          title={TITLE_DELETE}
          subtitle={popupSubtitle}
          isOpen={!!deleteTarget}
          save={() => {
            if (!isDeleting) {
              handleDelete()
            }
          }}
          cancel={() => {
            if (!isDeleting) {
              setDeleteTarget(null)
            }
          }}
          onClose={() => {
            if (!isDeleting) {
              setDeleteTarget(null)
            }
          }}
        />
      )}
    </div>
  )
}

export default ShiftSetting

