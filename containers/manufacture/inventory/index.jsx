import apiComons from '@/Api/apiComon/apiComon';
import apiInventory from '@/Api/apiManufacture/warehouse/inventory/apiInventory';
import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom';
import OnResetData from '@/components/UI/btnResetData/btnReset';
import ButtonAddNew from '@/components/UI/button/buttonAddNew';
import ContainerPagination from '@/components/UI/common/ContainerPagination/ContainerPagination';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table';
import { LayOutTableDynamic } from '@/components/UI/common/layout';
import CustomAvatar from '@/components/UI/common/user/CustomAvatar';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import { PrinterIcon, TrashIcon } from '@/components/icons';
import { CONFIRM_DELETION, TITLE_DELETE } from '@/constants/delete/deleteTable';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { WARNING_STATUS_ROLE } from '@/constants/warningStatus/warningStatus';
import { useBranchList } from '@/hooks/common/useBranch';
import useSetingServer from '@/hooks/useConfigNumber';
import { useLimitAndTotalItems } from '@/hooks/useLimitAndTotalItems';
import usePagination from '@/hooks/usePagination';
import useActionRole from '@/hooks/useRole';
import useStatusExprired from '@/hooks/useStatusExprired';
import useToast from '@/hooks/useToast';
import { useToggle } from '@/hooks/useToggle';
import { routerInventory } from '@/routers/manufacture';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { PopupParent } from '@/utils/lib/Popup';
import { Grid6 } from 'iconsax-react';
import { debounce } from 'lodash';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import PopupPrintTemInventory from './components/PopupPrintTemInventory';
import PopupDetail from './components/popupDetail';
import PopupStatus from './components/popupStatus';
import { useInventoryList } from './hooks/useInventoryList';
import Pagination from '/components/UI/pagination';

const initialState = {
  keySearch: '',
  idBranch: null,
  valueDate: { startDate: null, endDate: null },
  dataExport: [],
};

const Inventory = props => {
  const dataLang = props.dataLang;

  const router = useRouter();

  const isShow = useToast();

  const dataSeting = useSetingServer();

  const { paginate } = usePagination();

  const statusExprired = useStatusExprired();

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  const [isState, sIsState] = useState(initialState);

  const queryState = key => sIsState(prev => ({ ...prev, ...key }));

  const { isOpen, isId, handleQueryId } = useToggle();
  const { isOpen: isOpenPrint, isId: printId, handleQueryId: handlePrintId } = useToggle();

  const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

  const { is_admin: role, permissions_current: auth } = useSelector(state => state.auth);

  const { checkAdd, checkExport } = useActionRole(auth, 'inventory');

  const params = {
    search: isState.keySearch,
    limit: limit,
    page: router.query?.page || 1,
    'filter[branch_id]': isState.idBranch?.value != null ? isState.idBranch?.value : null,
    'filter[start_date]': isState.valueDate?.startDate != null ? isState.valueDate?.startDate : null,
    'filter[end_date]': isState.valueDate?.endDate != null ? isState.valueDate?.endDate : null,
  };

  const { data: listBranch = [] } = useBranchList();

  const { data, isFetching, refetch } = useInventoryList(params);

  const handleDelete = async () => {
    try {
      const { isSuccess, message, data_export } = await apiInventory.apiDeleteInventory(isId);
      if (isSuccess) {
        isShow('success', dataLang[message] || message);
      } else {
        isShow('error', dataLang[message] || message);

        if (data_export?.length > 0) {
          queryState({ dataExport: data_export || [] });
        }
      }
      await refetch();
      handleQueryId({ status: false });
    } catch (error) {
      throw error;
    }
  };

  const _ServerFetching_filter = async () => {
    try {
      const { result } = await apiComons.apiBranchCombobox();
      queryState({
        listBr: result?.map(e => ({ label: e?.name, value: e?.id } || [])),
        onFetching_filter: false,
      });
    } catch (error) {}
  };

  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    queryState({ keySearch: value });
    router.replace('/manufacture/inventory');
    queryState({ onFetching: true });
  }, 500);

  useEffect(() => {
    isState.onFetching_filter && _ServerFetching_filter();
  }, [isState.onFetching_filter]);

  useEffect(() => {
    queryState({ onFetching_filter: true });
  }, []);

  const multiDataSet = [
    {
      columns: [
        {
          title: 'ID',
          width: { wch: 4 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Ngày chứng từ'}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Mã chứng từ'}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Kho hàng'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Tổng mặt hàng'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Tình trạng'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Người tạo'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Chi nhánh'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Ghi chú'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: data?.rResult?.map(e => [
        { value: `${e?.id ? e.id : ''}`, style: { numFmt: '0' } },
        { value: `${e?.date ? e?.date : ''}` },
        { value: `${e?.code ? e?.code : ''}` },
        { value: `${e?.waidname ? e?.waidname : ''}` },
        { value: `${e?.total_item ? formatNumber(e?.total_item) : ''}` },
        {
          value: `${
            e?.adjusted
              ? e?.adjusted
                  ?.split('|||')
                  ?.map(item => item?.split('--')[1])
                  ?.map(e => e)
                  .join(', ')
              : ''
          }`,
        },
        { value: `${e?.staff_create_name ? e?.staff_create_name : ''}` },
        { value: `${e?.branch_name ? e?.branch_name : ''}` },
        { value: `${e?.note ? e?.note : ''}` },
      ]),
    },
  ];

  // breadcrumb
  const breadcrumbItems = [
    {
      label: `${dataLang?.Warehouse_title || 'Warehouse_title'}`,
      // href: "/",
    },
    {
      label: `${dataLang?.inventory_title || 'inventory_title'}`,
    },
  ];
  return (
    <>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{dataLang?.inventory_title || 'inventory_title'}</title>
          </Head>
        }
        breadcrumb={
          <>
            {statusExprired ? (
              <EmptyExprired />
            ) : (
              <Breadcrumb items={breadcrumbItems} className='3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]' />
              // <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
              //     <h6 className="text-[#141522]/40">
              //         {dataLang?.inventory_title_head || "inventory_title_head"}
              //     </h6>
              //     <span className="text-[#141522]/40">/</span>
              //     <h6>{dataLang?.inventory_title || "inventory_title"}</h6>
              // </div>
            )}
          </>
        }
        titleButton={
          <>
            <h2 className='text-title-section text-[#52575E] capitalize font-medium'>{dataLang?.inventory_title || 'inventory_title'}</h2>
            <ButtonAddNew
              onClick={() => {
                if (role) {
                  router.push(routerInventory.form);
                } else if (checkAdd) {
                  router.push(routerInventory.form);
                } else {
                  isShow('error', WARNING_STATUS_ROLE);
                }
              }}
              dataLang={dataLang}
            />
          </>
        }
        table={
          <div className='flex flex-col h-full'>
            <div className='w-full items-center flex justify-between gap-2'>
              <div className='flex gap-3 items-center w-full'>
                <SearchComponent dataLang={dataLang} onChange={_HandleOnChangeKeySearch.bind(this)} colSpan={3} />
                <SelectComponent
                  options={[
                    {
                      value: '',
                      label: dataLang?.inventory_choosebranch || 'inventory_choosebranch',
                      isDisabled: true,
                    },
                    ...listBranch,
                  ]}
                  onChange={e => queryState({ idBranch: e })}
                  value={isState.idBranch}
                  placeholder={dataLang?.client_list_filterbrand}
                  hideSelectedOptions={false}
                  isClearable={true}
                  colSpan={3}
                />
                <DateToDateComponent value={isState.valueDate} onChange={e => queryState({ valueDate: e })} colSpan={3} />
              </div>
              <div className='col-span-2'>
                <div className='flex items-center justify-end space-x-2'>
                  <OnResetData sOnFetching={e => {}} onClick={() => refetch()} />
                  {role == true || checkExport ? (
                    <div className={``}>{data?.rResult?.length > 0 && <ExcelFileComponent multiDataSet={multiDataSet} filename='Danh sách kiểm kê kho' title='Dskkk' dataLang={dataLang} />}</div>
                  ) : (
                    <button
                      onClick={() => isShow('error', WARNING_STATUS_ROLE)}
                      className={`xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition`}
                    >
                      <Grid6 className='scale-75 2xl:scale-100 xl:scale-100' size={18} />
                      <span>{dataLang?.client_list_exportexcel}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <Customscrollbar className='h-full overflow-y-auto'>
              <div className='w-full'>
                <HeaderTable gridCols={11} display={'grid'}>
                  <ColumnTable colSpan={0.5} textAlign={'center'}>
                    {dataLang?.stt || 'stt'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.inventory_dayvouchers || 'inventory_dayvouchers'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.inventory_vouchercode || 'inventory_vouchercode'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.inventory_warehouse || 'inventory_warehouse'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {dataLang?.inventory_total_item || 'inventory_total_item'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {dataLang?.inventory_status || 'inventory_status'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.inventory_creator || 'inventory_creator'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.inventory_branch || 'inventory_branch'}
                  </ColumnTable>
                  <ColumnTable colSpan={2.5} textAlign={'center'}>
                    {dataLang?.inventory_note || 'inventory_note'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {dataLang?.inventory_operatione || 'inventory_operatione'}
                  </ColumnTable>
                </HeaderTable>
                {isFetching ? (
                  <Loading className='h-full' color='#0f4f9e' />
                ) : data?.rResult?.length > 0 ? (
                  <>
                    <div className='divide-y divide-slate-200 h-[100%]'>
                      {data?.rResult?.map((e, index) => (
                        <RowTable gridCols={11} key={e?.id.toString()}>
                          <RowItemTable colSpan={0.5} textAlign={'center'}>
                            {index + 1}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'}>
                            {e?.date != null ? formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'}>
                            <PopupDetail
                              dataLang={dataLang}
                              className='responsive-text-sm font-semibold text-center text-[#003DA0] hover:text-blue-600 transition-all ease-linear cursor-pointer '
                              name={e?.code}
                              id={e?.id}
                            />
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'}>
                            {e?.waidname}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'center'}>
                            {formatNumber(e?.total_item)}
                          </RowItemTable>
                          <RowItemTable colSpan={1} className={'mx-auto'}>
                            <PopupParent
                              className='dropdown-avt '
                              key={e?.staff_create_id}
                              trigger={open => <span className='p-1 text-orange-500 border border-orange-500 rounded-md'> {e?.adjusted?.split('|||').length + ' ' + ' Điều chỉnh'}</span>}
                              position='top center'
                              on={['hover']}
                              arrow={false}
                            >
                              <span className='bg-[#003DA0] text-white rounded p-1.5 '>
                                {e?.adjusted
                                  ?.split('|||')
                                  ?.map(item => item?.split('--')[1])
                                  ?.map(e => e)
                                  .join(', ')}{' '}
                              </span>
                            </PopupParent>
                          </RowItemTable>
                          <RowItemTable>
                            <CustomAvatar data={e} fullName={e?.staff_create_name} profileImage={e?.staff_create_image} />
                          </RowItemTable>
                          <RowItemTable colSpan={1}>{e?.branch_name}</RowItemTable>
                          <RowItemTable colSpan={2.5} textAlign={'left'}>
                            {e?.note}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'center'} className={'mx-auto'}>
                            <div className='flex items-center justify-center gap-2'>
                              <button
                                onClick={() => handlePrintId({ id: e.id, status: true })}
                                className='group hover:border-blue-500 hover:bg-blue-50 rounded-lg w-fit p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer'
                                title='In tem'
                              >
                                <PrinterIcon className='size-5 text-[#003DA0]' />
                              </button>
                              <button
                                onClick={() => handleQueryId({ id: e.id, status: true })}
                                className='group hover:border-red-01 hover:bg-red-02 rounded-lg w-fit p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer'
                              >
                                <TrashIcon className='size-5 text-[#EE1E1E]' />
                              </button>
                            </div>
                          </RowItemTable>
                        </RowTable>
                      ))}
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
            {data?.rResult?.length != 0 && (
              <ContainerPagination>
                <Pagination postsPerPage={limit} totalPosts={Number(data?.output?.iTotalDisplayRecords)} paginate={paginate} currentPage={router.query?.page || 1} />
              </ContainerPagination>
            )}
            <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
          </div>
        }
      />
      {isState.dataExport?.length > 0 && <PopupStatus className='hidden' dataExport={isState.dataExport} dataLang={dataLang} />}

      <PopupConfim
        dataLang={dataLang}
        type='warning'
        title={TITLE_DELETE}
        subtitle={CONFIRM_DELETION}
        isOpen={isOpen}
        nameModel={'inventory'}
        save={handleDelete}
        cancel={() => handleQueryId({ status: false })}
      />

      {isOpenPrint && printId && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <PopupPrintTemInventory id={printId} onClose={() => handlePrintId({ status: false })} />
        </div>
      )}
    </>
  );
};

export default Inventory;
