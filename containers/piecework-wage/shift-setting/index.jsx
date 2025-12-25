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
  idShift: null,
  idTimeFrame: null,
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
  const [isDeleting, setIsDeleting] = useState(false)
  const queryState = key => sIsState(prev => ({ ...prev, ...key }))

  // Danh sách chi nhánh
  const { data: listBranch = [] } = useBranchList()

  // Mock data với pagination
  const effectiveLimit = useMemo(() => (limit && Number(limit) > 0 ? Number(limit) : 8), [limit])
  const currentPage = useMemo(() => Number(router.query?.page) || 1, [router.query?.page])

  // Filter và search mock data
  const filteredData = useMemo(() => {
    let result = [...mockShiftData]

    // Filter by search
    if (isState.keySearch) {
      const searchLower = isState.keySearch.toLowerCase()
      result = result.filter(item => item.name.toLowerCase().includes(searchLower))
    }

    // Filter by shift name
    if (isState.idShift?.value) {
      result = result.filter(item => item.id === isState.idShift.value)
    }

    // Filter by time frame
    if (isState.idTimeFrame?.value) {
      result = result.filter(item => item.timeFrame === isState.idTimeFrame.value)
    }

    return result
  }, [isState.keySearch, isState.idShift, isState.idTimeFrame])

  // Pagination
  const totalRecords = filteredData.length
  const startIndex = (currentPage - 1) * effectiveLimit
  const endIndex = startIndex + effectiveLimit
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Options cho filter
  const shiftOptions = useMemo(() => {
    const uniqueShifts = [...new Set(mockShiftData.map(item => item.name))]
    return uniqueShifts.map(name => ({
      value: mockShiftData.find(item => item.name === name)?.id,
      label: name,
    }))
  }, [])

  const timeFrameOptions = useMemo(() => {
    const uniqueTimeFrames = [...new Set(mockShiftData.map(item => item.timeFrame))]
    return uniqueTimeFrames.map(timeFrame => ({
      value: timeFrame,
      label: timeFrame,
    }))
  }, [])

  // Tự điều chỉnh về trang 1 nếu limit thay đổi
  useEffect(() => {
    if (!effectiveLimit || effectiveLimit <= 0) return

    const totalPages = Math.max(1, Math.ceil(totalRecords / effectiveLimit))
    if (currentPage > totalPages) {
      paginate(1)
    }
  }, [effectiveLimit, totalRecords, currentPage, paginate])

  // Hàm tìm kiếm
  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    queryState({ keySearch: value })
    router.replace('/piecework-wage/shift-setting')
  }, 500)

  // Hàm refetch (mock)
  const refetch = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      // isShow('success', dataLang?.reloaded_successfully || 'Tải lại thành công')
    }, 500)
  }

  // Xuất Excel
  const multiDataSet = [
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
          { value: `${e.timeFrame ? e.timeFrame : ''}`, style: { font: { name: 'Lexend Deca' } } },
          { value: `${e.daysOfWeek ? e.daysOfWeek.join(', ') : ''}`, style: { font: { name: 'Lexend Deca' } } },
        ]) || [],
    },
  ]

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
    setIsDeleting(true)
    
    // TODO: Gọi API xóa ca làm việc ở đây
    // Mock delete - sau này thay bằng API call thực tế
    setTimeout(() => {
      setIsDeleting(false)
      isShow('success', dataLang?.deleted_successfully || 'Xóa thành công')
      refetch()
    }, 1000)
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
                <SearchComponent dataLang={dataLang} onChange={_HandleOnChangeKeySearch.bind(this)} colSpan={1} />
                <SelectComponent
                  options={[
                    {
                      value: '',
                      label: dataLang?.shift || 'Ca',
                      isDisabled: true,
                    },
                    ...shiftOptions,
                  ]}
                  colSpan={1}
                  onChange={selected => queryState({ idShift: selected })}
                  value={isState.idShift}
                  placeholder={dataLang?.shift || 'Ca'}
                  isClearable={true}
                />
                <SelectComponent
                  options={[
                    {
                      value: '',
                      label: dataLang?.time_frame || 'Khung giờ',
                      isDisabled: true,
                    },
                    ...timeFrameOptions,
                  ]}
                  colSpan={1}
                  onChange={selected => queryState({ idTimeFrame: selected })}
                  value={isState.idTimeFrame}
                  placeholder={dataLang?.time_frame || 'Khung giờ'}
                  isClearable={true}
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
                <HeaderTable gridCols={12}>
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
                  <ColumnTable colSpan={1.5} textAlign={'center'}>
                    {dataLang?.branch_popup_properties || 'Tác vụ'}
                  </ColumnTable>
                </HeaderTable>

                {isLoading ? (
                  <Loading className='h-80' color='#0f4f9e' />
                ) : paginatedData?.length > 0 ? (
                  <>
                    <div className='divide-y divide-slate-200 h-[100%]'>
                      {paginatedData.map((e, index) => {
                        return (
                          <RowTable gridCols={12} key={e.id.toString()}>
                            <RowItemTable colSpan={0.5} textAlign={'center'}>
                              {startIndex + index + 1}
                            </RowItemTable>
                            <RowItemTable colSpan={3} textAlign={'left'}>
                              {e.name}
                            </RowItemTable>
                            <RowItemTable colSpan={3} textAlign={'left'}>
                              <span className='text-blue-fmrp'>{e.timeFrame}</span>
                            </RowItemTable>
                            <RowItemTable colSpan={4} textAlign={'left'}>
                              {e.daysOfWeek.join(', ')}
                            </RowItemTable>
                            <RowItemTable colSpan={1.5} className='flex items-center justify-center space-x-2 text-center'>
                              <PopupShiftSetting
                                dataLang={dataLang}
                                onRefresh={() => {
                                  refetch()
                                  setEditData(null)
                                }}
                                listBranch={listBranch}
                                editData={e}
                                trigger={
                                  <button
                                    type='button'
                                    className='group hover:border-blue-500 hover:bg-blue-50 rounded-lg w-fit p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer'
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

