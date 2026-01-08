import apiWarehouseTransfer from '@/Api/apiManufacture/warehouse/warehouseTransfer/apiWarehouseTransfer';
import { BtnAction } from '@/components/UI/BtnAction';
import TabFilter from '@/components/UI/TabFilter';
import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom';
import OnResetData from '@/components/UI/btnResetData/btnReset';
import ButtonWarehouse from '@/components/UI/btnWarehouse/btnWarehouse';
import ButtonAddNew from '@/components/UI/button/buttonAddNew';
import ContainerPagination from '@/components/UI/common/ContainerPagination/ContainerPagination';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table';
import { TagColorOrange, TagColorSky } from '@/components/UI/common/Tag/TagStatus';
import { ContainerTotal, LayOutTableDynamic } from '@/components/UI/common/layout';
import CustomAvatar from '@/components/UI/common/user/CustomAvatar';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import Pagination from '@/components/UI/pagination';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import { CONFIRMATION_OF_CHANGES, TITLE_STATUS } from '@/constants/changeStatus/changeStatus';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { WARNING_STATUS_ROLE } from '@/constants/warningStatus/warningStatus';
import { useBranchList } from '@/hooks/common/useBranch';
import { useWarehouseByBranch } from '@/hooks/common/useWarehouses';
import useSetingServer from '@/hooks/useConfigNumber';
import { useLimitAndTotalItems } from '@/hooks/useLimitAndTotalItems';
import usePagination from '@/hooks/usePagination';
import useActionRole from '@/hooks/useRole';
import useStatusExprired from '@/hooks/useStatusExprired';
import useTab from '@/hooks/useTab';
import useToast from '@/hooks/useToast';
import { useToggle } from '@/hooks/useToggle';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatMoneyConfig from '@/utils/helpers/formatMoney';
import { Grid6 } from 'iconsax-react';
import { debounce } from 'lodash';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { routerWarehouseTransfer } from 'routers/manufacture';
import LinkWarehouse from '../components/linkWarehouse';
import PopupStatus from '../components/popupStatus';
import PopupDetailWarehouseTransfer from './components/pupup';
import { useWarehouseTransferCombobox } from './hooks/useWarehouseTransferCombobox';
import { useWarehouseTransferFilterbar } from './hooks/useWarehouseTransferFilterbar';
import { useWarehouseTransferList } from './hooks/useWarehouseTransferList';

const initialState = {
  onSending: false,
  keySearch: '',
  keySearchCode: '',
  idExportWarehouse: null,
  idReceivingWarehouse: null,
  idCode: null,
  idSupplier: null,
  idBranch: null,
  valueDate: { startDate: null, endDate: null },
  dataExport: [],
  refreshing: false,
};
const WarehouseTransfer = props => {
  const dataLang = props.dataLang;

  const isShow = useToast();

  const router = useRouter();

  const { paginate } = usePagination();

  const dataSeting = useSetingServer();

  const statusExprired = useStatusExprired();

  const { handleTab: _HandleSelectTab } = useTab('all');

  const [isState, sIsState] = useState(initialState);

  const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

  const { isOpen, isKeyState, handleQueryId } = useToggle();

  const queryState = key => sIsState(prve => ({ ...prve, ...key }));

  const { is_admin: role, permissions_current: auth } = useSelector(state => state.auth);

  const { checkAdd, checkExport } = useActionRole(auth, 'warehouseTransfer');

  const params = {
    search: isState.keySearch,
    limit: limit,
    page: router.query?.page || 1,
    'filter[status_bar]': router.query?.tab ?? null,
    'filter[id]': isState.idCode != null ? isState.idCode?.value : null,
    'filter[branch_id]': isState.idBranch != null ? isState.idBranch.value : null,
    'filter[start_date]': isState.valueDate?.startDate != null ? isState.valueDate?.startDate : null,
    'filter[end_date]': isState.valueDate?.endDate != null ? isState.valueDate?.endDate : null,
    'filter[warehouses_id]': isState.idExportWarehouse != null ? isState.idExportWarehouse?.value : null,
    'filter[warehouses_to]': isState.idReceivingWarehouse != null ? isState.idReceivingWarehouse?.value : null,
  };

  // danh sách chi nhánh
  const { data: dataBranch = [] } = useBranchList();

  // danh sách kho
  const { data: dataWarehouse = [] } = useWarehouseByBranch();

  // danh sách chuyển kho
  const { data, isFetching, refetch } = useWarehouseTransferList(params);

  // danh sách mã chứng từ
  const { data: dataCode = [] } = useWarehouseTransferCombobox(isState.keySearchCode);

  // danh sách tab lọc
  const { data: dataFilterbar, refetch: refetchFilterBar } = useWarehouseTransferFilterbar(params);

  // tìm kiếm mã chứng từ
  const _HandleSeachApi = debounce(async inputValue => {
    queryState({ keySearchCode: inputValue });
  }, 500);

  const formatMoney = number => {
    return formatMoneyConfig(+number, dataSeting);
  };

  const renderMoneyOrDash = value => {
    return value === undefined || value === null || Number(value) === 0 ? (
      '-'
    ) : (
      <>
        {formatMoney(value)} <span className='underline'>đ</span>
      </>
    );
  };

  // tìm kiếm table
  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    queryState({ keySearch: value });
    router.replace({
      pathname: router.route,
      query: {
        tab: router.query?.tab,
      },
    });
  }, 500);

  // đổi trạng thái duyệt thủ kho
  const handleSaveStatus = () => {
    if (isKeyState?.type === 'browser') {
      const checked = isKeyState.value.target.checked;
      const warehousemanId = isKeyState.value.target.value;
      const dataChecked = {
        checked: checked,
        warehousemanId: warehousemanId,
        id: isKeyState?.id,
        checkedpost: isKeyState?.checkedUn,
      };
      _ServerSending(dataChecked);
    }
    handleQueryId({ status: false });
  };

  // đổi trạng thái duyệt thủ kho
  const _HandleChangeInput = (id, checkedUn, type, value) => {
    handleQueryId({
      status: true,
      initialKey: { id, checkedUn, type, value },
    });
  };

  // đổi trạng thái duyệt thủ kho nếu data_export có thì mở popup show dữ liệu data_export
  const _ServerSending = async checkedWare => {
    let data = new FormData();

    data.append('warehouseman_id', checkedWare?.checkedpost != '0' ? checkedWare?.checkedpost : '');

    data.append('id', checkedWare?.id);

    try {
      const { isSuccess, message, alert_type, data_export } = await apiWarehouseTransfer.apiHandingStatusTransfer(data);

      if (isSuccess) {
        isShow(alert_type, dataLang[message] || message);
        queryState({ refreshing: true });
        await refetch();
        await refetchFilterBar();
        queryState({ onSending: false, refreshing: false });
      } else {
        isShow('error', dataLang[message] || message);
      }

      if (data_export?.length > 0) {
        queryState({ dataExport: data_export });
      }
    } catch (error) {}
  };

  // xuất excel
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
          title: `${dataLang?.import_day_vouchers || 'import_day_vouchers'}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_code_vouchers || 'import_code_vouchers'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.production_warehouse_orderNumber || 'production_warehouse_orderNumber'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.warehouseTransfer_transferWarehouse || 'warehouseTransfer_transferWarehouse'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.warehouseTransfer_receivingWarehouse || 'warehouseTransfer_receivingWarehouse'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.production_warehouse_Total_value || 'production_warehouse_Total_value'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.warehouses_localtion_status || 'warehouses_localtion_status'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_from_note || 'import_from_note'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.production_warehouse_creator || 'production_warehouse_creator'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_brow_storekeepers || 'import_brow_storekeepers'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_branch || 'import_branch'}`,
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
        { value: `${'Số LSX chi tiết'}` },
        { value: `${e?.warehouses_id_name ? e?.warehouses_id_name : ''}` },
        { value: `${e?.warehouses_to_name ? e?.warehouses_to_name : ''}` },
        { value: `${e?.grand_total ? formatMoney(e?.grand_total) : ''}` },
        { value: `${e?.order_id != 0 ? 'Đã giữ kho' : 'Chưa giữ kho'}` },
        { value: `${e?.note ? e?.note : ''}` },
        { value: `${e?.staff_create?.full_name ? e?.staff_create?.full_name : ''}` },
        { value: `${e?.warehouseman_id === '0' ? 'Chưa duyệt kho' : 'Đã duyệt kho'}` },
        { value: `${e?.branch_name_id ? e?.branch_name_id : ''}` },
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
      label: `${dataLang?.warehouseTransfer_list || 'warehouseTransfer_list'}`,
    },
  ];

  return (
    <React.Fragment>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{dataLang?.warehouseTransfer_title || 'warehouseTransfer_title'}</title>
          </Head>
        }
        breadcrumb={
          <>
            {statusExprired ? (
              <EmptyExprired />
            ) : (
              <React.Fragment>
                <Breadcrumb items={breadcrumbItems} className='3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]' />
              </React.Fragment>
            )}
          </>
        }
        titleButton={
          <>
            <h2 className='text-title-section text-[#52575E] capitalize font-medium'>{dataLang?.warehouseTransfer_title || 'warehouseTransfer_title'}</h2>
            <ButtonAddNew
              onClick={() => {
                if (role) {
                  router.push(routerWarehouseTransfer.form);
                } else if (checkAdd) {
                  router.push(routerWarehouseTransfer.form);
                } else {
                  isShow('error', WARNING_STATUS_ROLE);
                }
              }}
              dataLang={dataLang}
            />
          </>
        }
        fillterTab={
          <>
            {dataFilterbar &&
              dataFilterbar?.map(e => {
                return (
                  <TabFilter style={{ backgroundColor: '#e2f0fe' }} dataLang={dataLang} key={e?.id} onClick={_HandleSelectTab.bind(this, `${e?.id}`)} total={e?.count} active={e?.id}>
                    {dataLang[e?.name] || e?.name}
                  </TabFilter>
                );
              })}
          </>
        }
        pagination={
          <div className='flex items-center justify-between gap-2'>
            {data?.rResult.length != 0 && (
              <ContainerPagination>
                {/* <TitlePagination dataLang={dataLang} totalItems={data?.output?.iTotalDisplayRecords} /> */}
                <Pagination postsPerPage={limit} totalPosts={Number(data?.output?.iTotalDisplayRecords)} paginate={paginate} currentPage={router.query?.page || 1} />
              </ContainerPagination>
            )}
            <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
          </div>
        }
        table={
          <div className='flex flex-col h-full'>
            <div className='w-full items-center flex justify-between gap-2'>
              <div className='flex gap-3 items-center w-full'>
                <SearchComponent colSpan={1} dataLang={dataLang} placeholder={dataLang?.branch_search} onChange={_HandleOnChangeKeySearch.bind(this)} />
                <DateToDateComponent colSpan={1} value={isState.valueDate} onChange={e => queryState({ valueDate: e })} />
                <SelectComponent
                  options={[
                    {
                      value: '',
                      label: dataLang?.purchase_order_table_branch || 'purchase_order_table_branch',
                      isDisabled: true,
                    },
                    ...dataBranch,
                  ]}
                  onChange={e => queryState({ idBranch: e })}
                  value={isState.idBranch}
                  placeholder={dataLang?.purchase_order_table_branch || 'purchase_order_table_branch'}
                  isClearable={true}
                  colSpan={1}
                  className={'min-w-[140px]'}
                />
                <SelectComponent
                  colSpan={1}
                  onInputChange={event => {
                    _HandleSeachApi(event);
                  }}
                  options={[
                    {
                      value: '',
                      label: dataLang?.purchase_order_table_code || 'purchase_order_table_code',
                      isDisabled: true,
                    },
                    ...dataCode,
                  ]}
                  onChange={e => queryState({ idCode: e })}
                  value={isState.idCode}
                  placeholder={dataLang?.purchase_order_table_code || 'purchase_order_table_code'}
                  isClearable={true}
                  className={'min-w-[140px]'}
                />
                <SelectComponent
                  colSpan={1}
                  options={[
                    {
                      value: '',
                      label: dataLang?.warehouseTransfer_transferWarehouse || 'warehouseTransfer_transferWarehouse',
                      isDisabled: true,
                    },
                    ...dataWarehouse,
                  ]}
                  onChange={e => queryState({ idExportWarehouse: e })}
                  value={isState.idExportWarehouse}
                  placeholder={dataLang?.warehouseTransfer_transferWarehouse || 'warehouseTransfer_transferWarehouse'}
                  isClearable={true}
                  className={'min-w-[170px]'}
                />
                <SelectComponent
                  colSpan={1}
                  options={[
                    {
                      value: '',
                      label: dataLang?.warehouseTransfer_receivingWarehouse || 'warehouseTransfer_receivingWarehouse',
                      isDisabled: true,
                    },
                    ...dataWarehouse,
                  ]}
                  onChange={e => queryState({ idReceivingWarehouse: e })}
                  value={isState.idReceivingWarehouse}
                  placeholder={dataLang?.warehouseTransfer_receivingWarehouse || 'warehouseTransfer_receivingWarehouse'}
                  isClearable={true}
                  className={'min-w-[170px]'}
                />
              </div>
              <div className='col-span-1 xl:col-span-2 lg:col-span-2'>
                <div className='flex items-center justify-end gap-2'>
                  <OnResetData sOnFetching={e => {}} onClick={() => refetch()} />

                  {role == true || checkExport ? (
                    <div className={``}>
                      {data?.rResult?.length > 0 && (
                        <ExcelFileComponent dataLang={dataLang} filename={dataLang?.warehouseTransfer_list || 'warehouseTransfer_list'} title='DSCK' multiDataSet={multiDataSet} />
                      )}
                    </div>
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
                <HeaderTable gridCols={12} display={'grid'}>
                  <ColumnTable colSpan={0.5} textAlign={'center'}>
                    {dataLang?.stt || 'stt'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.import_day_vouchers || 'import_day_vouchers'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.import_code_vouchers || 'import_code_vouchers'}
                  </ColumnTable>
                  <ColumnTable colSpan={1.5} textAlign={'left'}>
                    {dataLang?.warehouseTransfer_transferWarehouse || 'warehouseTransfer_transferWarehouse'}
                  </ColumnTable>
                  <ColumnTable colSpan={1.5} textAlign={'left'}>
                    {dataLang?.warehouseTransfer_receivingWarehouse || 'warehouseTransfer_receivingWarehouse'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.production_warehouse_Total_value || 'production_warehouse_Total_value'}
                  </ColumnTable>
                  {/* <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.warehouses_localtion_status || 'warehouses_localtion_status'}
                  </ColumnTable> */}
                  <ColumnTable colSpan={1.5} textAlign={'left'}>
                    {dataLang?.production_warehouse_note || 'production_warehouse_note'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.production_warehouse_creator || 'production_warehouse_creator'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.production_warehouse_browse || 'production_warehouse_browse'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.import_branch || 'import_branch'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {dataLang?.import_action || 'import_action'}
                  </ColumnTable>
                </HeaderTable>
                {isFetching && !isState.refreshing ? (
                  <Loading className='h-full' color='#0f4f9e' />
                ) : data?.rResult.length > 0 ? (
                  <>
                    <div className='h-full divide-y divide-slate-200'>
                      {data?.rResult.map((e, index) => (
                        <RowTable gridCols={12} key={e.id.toString()}>
                          <RowItemTable colSpan={0.5} textAlign={'center'}>
                            {index + 1}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'}>
                            {e?.date != null ? formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'}>
                            <PopupDetailWarehouseTransfer
                              dataLang={dataLang}
                              className='responsive-text-sm font-medium text-blue-fmrp hover:text-[#5599EC] transition-all ease-linear cursor-pointer '
                              name={e?.code}
                              id={e?.id}
                            />
                          </RowItemTable>
                          <RowItemTable colSpan={1.5} textAlign={'left'}>
                            <LinkWarehouse colSpan={1} disbleClick={true} warehouse_id={e?.warehouses_id} warehouse_name={e?.warehouses_id_name} />
                          </RowItemTable>
                          <RowItemTable colSpan={1.5} textAlign={'left'}>
                            <LinkWarehouse disbleClick={true} colSpan={1} warehouse_id={e?.warehouses_to} warehouse_name={e?.warehouses_to_name} color='text-neutral-07' />
                          </RowItemTable>

                          <RowItemTable colSpan={1} textAlign={'left'}>
                            {renderMoneyOrDash(e?.grand_total)}
                          </RowItemTable>
                          {/* <RowItemTable colSpan={1} className='flex'>
                            {e?.order_id != 0 || e?.plan_id != 0 ? <TagColorOrange name={'Đã giữ kho'} /> : <TagColorSky name={'Chưa giữ kho'} />}
                          </RowItemTable> */}
                          <RowItemTable colSpan={1.5} textAlign={'left'} className={'truncate'}>
                            {e?.note}
                          </RowItemTable>
                          <RowItemTable colSpan={1} className={'flex items-center gap-2'}>
                            <CustomAvatar fullName={e?.staff_create?.full_name} profileImage={e?.staff_create?.profile_image} />
                            {/* <div className="relative">
                                                                <ModalImage
                                                                    small={e?.staff_create?.profile_image ? e?.staff_create?.profile_image : "/user-placeholder.jpg"}
                                                                    large={e?.staff_create?.profile_image ? e?.staff_create?.profile_image : "/user-placeholder.jpg"}
                                                                    className="object-cover w-6 h-6 rounded-full "
                                                                >
                                                                    <div className="">
                                                                        <ImageErrors
                                                                            src={e?.staff_create?.profile_image}
                                                                            width={25}
                                                                            height={25}
                                                                            defaultSrc="/user-placeholder.jpg"
                                                                            alt="Image"
                                                                            className="object-cover min-w-6 max-w-6 min-h-6 max-h-6 h-6 w-6  rounded-[100%] text-left cursor-pointer"
                                                                        />
                                                                    </div>
                                                                </ModalImage>
                                                                <span className="h-2 w-2 absolute 3xl:bottom-full 3xl:translate-y-[150%] 3xl:left-1/2  3xl:translate-x-[100%] 2xl:bottom-[80%] 2xl:translate-y-full 2xl:left-1/2 bottom-[50%] left-1/2 translate-x-full translate-y-full">
                                                                    <span className="relative inline-flex w-2 h-2 rounded-full bg-lime-500">
                                                                        <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-lime-400"></span>
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <h6 className="capitalize">{e?.staff_create?.full_name}</h6> */}
                          </RowItemTable>
                          <RowItemTable colSpan={1}>
                            <ButtonWarehouse warehouseman_id={e?.warehouseman_id} _HandleChangeInput={_HandleChangeInput} id={e?.id} />
                          </RowItemTable>
                          <RowItemTable colSpan={1}>{e?.branch_name_id}</RowItemTable>
                          <RowItemTable colSpan={1} className='flex justify-center'>
                            <BtnAction
                              onRefresh={refetch.bind(this)}
                              onRefreshGroup={refetchFilterBar.bind(this)}
                              dataLang={dataLang}
                              warehouseman_id={e?.warehouseman_id}
                              status_pay={e?.status_pay}
                              id={e?.id}
                              type='warehouseTransfer'
                              className='bg-slate-100 xl:px-4 px-2 xl:py-1.5 py-1 rounded 2xl:text-base xl:text-xs text-[9px]'
                            />
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
        showTotal={true}
        total={
          <>
            <ContainerTotal className='!grid-cols-24'>
              <RowItemTable colSpan={4.5} textAlign={'right'} className='p-2'></RowItemTable>
              <RowItemTable colSpan={1} textAlign={'left'} className='p-2'>
                {dataLang?.import_total || 'import_total'}
              </RowItemTable>
              <RowItemTable colSpan={1} textAlign={'left'} className={'text-right'}>
                {formatMoney(data?.rTotal?.amount)}
              </RowItemTable>
            </ContainerTotal>
          </>
        }
      />
      {isState.dataExport?.length > 0 && <PopupStatus type='warehouseTransfer' className='hidden' dataExport={isState.dataExport} dataLang={dataLang} />}
      <PopupConfim
        dataLang={dataLang}
        type='warning'
        nameModel={'warehouseTransfer'}
        title={TITLE_STATUS}
        subtitle={CONFIRMATION_OF_CHANGES}
        isOpen={isOpen}
        save={handleSaveStatus}
        cancel={() => handleQueryId({ status: false })}
      />
    </React.Fragment>
  );
};

export default WarehouseTransfer;
