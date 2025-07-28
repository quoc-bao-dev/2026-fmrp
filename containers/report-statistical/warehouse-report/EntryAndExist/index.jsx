import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table'
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit'
import SearchComponent from '@/components/UI/filterComponents/searchComponent'
import SelectComponent from '@/components/UI/filterComponents/selectComponent'
import Loading from "@/components/UI/loading/loading"
import NoData from "@/components/UI/noData/nodata"
import ReportLayout from '@/components/layout/ReportLayout'
import useSetingServer from '@/hooks/useConfigNumber'
import { useLimitAndTotalItems } from '@/hooks/useLimitAndTotalItems'
import usePagination from '@/hooks/usePagination'
import useStatusExprired from '@/hooks/useStatusExprired'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import { useRouter } from 'next/router'
import { useState } from 'react'

const EntryAndExist = (props) => {
  const { dataLang } = props

  const dataSeting = useSetingServer()

  const router = useRouter()

  const { paginate } = usePagination()

  const statusExprired = useStatusExprired()

  const { limit, updateLimit: sLimit, totalItems, updateTotalItems: sTotalItems } = useLimitAndTotalItems()
  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting)
  }

  const initialState = {
    total: {},
    data: [],
    onFetching: false,
  }

  const [isState, setState] = useState(initialState)

  const queryState = (key) => setState((prev) => ({ ...prev, ...key }))

  const filterOptions = [
    {
      options: [{ value: '', label: 'Công đoạn', isDisabled: true }],
      placeholder: 'Công đoạn',
      onChange: () => {},
    },
    // ... các options khác
  ]

  const breadcrumbItems = [
    {
      label: `Báo cáo`,
      href: '/report-statistical',
    },
    {
      label: `Tồn kho`,
    },
  ]

  const headerContent = (
    <>
      <ColumnTable colSpan={2} textAlign={'center'}>
        Mã mặt hàng
      </ColumnTable>
      <ColumnTable colSpan={2} textAlign={'center'}>
        Tên mặt hàng
      </ColumnTable>
      <ColumnTable colSpan={1} textAlign={'center'}>
        ĐVT
      </ColumnTable>
      <ColumnTable colSpan={2} className="grid grid-cols-4  items-center justify-center !px-0">
        <ColumnTable colSpan={4} textAlign={'center'} className="border-b py-0.5">
          Tồn đầu kỳ
        </ColumnTable>
        <ColumnTable colSpan={2} textAlign={'center'} className="pt-1 border-r">
          Số lượng
        </ColumnTable>
        <ColumnTable colSpan={2} textAlign={'center'} className="pt-1 py-0.5">
          Giá trị
        </ColumnTable>
      </ColumnTable>
      <ColumnTable colSpan={2} className="grid grid-cols-4  items-center justify-center !px-0">
        <ColumnTable colSpan={4} textAlign={'center'} className="border-b py-0.5">
          Nhập kho
        </ColumnTable>
        <ColumnTable colSpan={2} textAlign={'center'} className="pt-1 border-r">
          Số lượng
        </ColumnTable>
        <ColumnTable colSpan={2} textAlign={'center'} className="pt-1 py-0.5">
          Giá trị
        </ColumnTable>
      </ColumnTable>
      <ColumnTable colSpan={2} className="grid grid-cols-4  items-center justify-center !px-0">
        <ColumnTable colSpan={4} textAlign={'center'} className="border-b py-0.5">
          Xuất kho
        </ColumnTable>
        <ColumnTable colSpan={2} textAlign={'center'} className="pt-1 border-r">
          Số lượng
        </ColumnTable>
        <ColumnTable colSpan={2} textAlign={'center'} className="pt-1 py-0.5">
          Giá trị
        </ColumnTable>
      </ColumnTable>
      <ColumnTable colSpan={2} className="grid grid-cols-4  items-center justify-center !px-0">
        <ColumnTable colSpan={4} textAlign={'center'} className="border-b py-0.5">
          Tồn cuối kỳ
        </ColumnTable>
        <ColumnTable colSpan={2} textAlign={'center'} className="pt-1 border-r">
          Số lượng
        </ColumnTable>
        <ColumnTable colSpan={2} textAlign={'center'} className="pt-1 py-0.5">
          Giá trị
        </ColumnTable>
      </ColumnTable>
    </>
  )

  const renderRow = (item) => (
    <RowTable gridCols={13} key={item.id.toString()}>
      <RowItemTable colSpan={2} textAlign={'center'}></RowItemTable>
      <RowItemTable colSpan={2} textAlign={'center'}></RowItemTable>
      <RowItemTable colSpan={1} textAlign={'right'}></RowItemTable>
      <RowItemTable colSpan={1} textAlign={'right'}></RowItemTable>
      <RowItemTable colSpan={1} textAlign={'right'}></RowItemTable>
      <RowItemTable colSpan={1} textAlign={'left'} className={'truncate'}></RowItemTable>
      <RowItemTable colSpan={1} className="flex items-center space-x-1"></RowItemTable>
      <RowItemTable colSpan={1}></RowItemTable>
      <RowItemTable colSpan={1} className="mx-auto"></RowItemTable>
      <RowItemTable colSpan={1} className="mx-auto"></RowItemTable>
      <RowItemTable colSpan={1} className="mx-auto"></RowItemTable>
    </RowTable>
  )

  return (
    <ReportLayout
      title="Báo cáo nhập xuất tồn"
      statusExprired={statusExprired}
      breadcrumbItems={breadcrumbItems}
      filterSection={
        <div className="w-full items-center flex justify-between gap-2">
          <div className="flex gap-3 items-center w-full">
            <div className="flex gap-2">
              <SearchComponent
                colSpan={1}
                dataLang={dataLang}
                placeholder={dataLang?.branch_search}
                // onChange={onSearch}
              />
              {filterOptions.map((option, index) => (
                <SelectComponent
                  key={index}
                  options={option.options}
                  placeholder={option.placeholder}
                  isSearchable={true}
                  colSpan={1}
                  onChange={option.onChange}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 space-x-2 items-center">
            {/* <OnResetData sOnFetching={onReset} /> */}
            {/* {onExport && (
              <button
                onClick={onExport}
                className="xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition"
              >
                <span>{dataLang?.client_list_exportexcel}</span>
              </button>
            )} */}
            <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
          </div>
        </div>
      }
      tableSection={
        <div className="2xl:w-[100%] pr-2">
        <HeaderTable>{headerContent}</HeaderTable>
        
        {/* {isLoading ? (
            <Loading className="3xl:h-[620px] 2xl:h-[550px] h-[550px]" color="#0f4f9e" />
        ) : data?.length > 0 ? (
            <div className="min-h-[400px] h-[100%] w-full max-h-[600px]">
                {data.map((item) => renderRow(item))}
            </div>
        ) : (
            <NoData />
        )} */}
    </div>
      }
      // totalSection={
      //   isState?.data?.length > 0 && (
      //     <ContainerTotal>
      //       <ColumnTable colSpan={5} textAlign={'center'} className="p-2">
      //         {dataLang?.productsWarehouse_total || 'productsWarehouse_total'}
      //       </ColumnTable>
      //       <ColumnTable colSpan={1} textAlign={'right'} className="p-2 mr-1">
      //         {formatNumber(isState.total?.total_quantity)}
      //       </ColumnTable>
      //       <ColumnTable colSpan={1} textAlign={'right'} className="p-2 mr-1">
      //         {formatNumber(isState.total?.total_quantity)}
      //       </ColumnTable>
      //       <ColumnTable colSpan={1} textAlign={'right'} className="p-2 mr-1">
      //         {formatNumber(isState.total?.total_quantity)}
      //       </ColumnTable>
      //       <ColumnTable colSpan={1} textAlign={'right'} className="p-2 mr-1">
      //         {formatNumber(isState.total?.total_quantity)}
      //       </ColumnTable>
      //       <ColumnTable colSpan={1} textAlign={'right'} className="p-2 mr-1">
      //         {formatNumber(isState.total?.total_quantity)}
      //       </ColumnTable>
      //       <ColumnTable colSpan={1} textAlign={'right'} className="p-2 mr-1">
      //         {formatNumber(isState.total?.total_quantity)}
      //       </ColumnTable>
      //       <ColumnTable colSpan={1} textAlign={'right'} className="p-2 mr-1">
      //         {formatNumber(isState.total?.total_quantity)}
      //       </ColumnTable>
      //     </ContainerTotal>
      //   )
      // }
      // paginationSection={
      //   isState?.data?.length > 0 && (
      //     <ContainerPagination>
      //       <TitlePagination dataLang={dataLang} totalItems={isState?.total?.iTotalDisplayRecords} />
      //       <Pagination
      //         postsPerPage={isState.limitItemWarehouseDetail}
      //         totalPosts={Number(isState?.total?.iTotalDisplayRecords)}
      //         paginate={paginate}
      //         currentPage={router.query?.page || 1}
      //         className="3xl:text-base text-sm"
      //       />
      //     </ContainerPagination>
      //   )
      // }
    />
  )
}

export default EntryAndExist
