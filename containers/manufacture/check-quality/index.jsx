import { TrashIcon } from '@/components/icons';
import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom';
import OnResetData from '@/components/UI/btnResetData/btnReset';
import ContainerPagination from '@/components/UI/common/ContainerPagination/ContainerPagination';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table';
import { LayOutTableDynamic } from '@/components/UI/common/layout';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import Loading from '@/components/UI/loading/loading';
import LoadingButton from '@/components/UI/loading/loadingButton';
import NoData from '@/components/UI/noData/nodata';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
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
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { Grid6 } from 'iconsax-react';
import { debounce } from 'lodash';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { Fragment, useState } from 'react';
import 'react-phone-input-2/lib/style.css';
import { useSelector } from 'react-redux';
import { _ServerInstance as Axios } from '@/services/axios';
import PopupDetailWarehouseTransfer from '../warehouse-transfer/components/pupup';
import PopupCheckQuality from './components/popup';
import PopupState from './components/popupState';
import { useCheckQualityList } from './hooks/useCheckQualityList';
import Pagination from '/components/UI/pagination';
import CameraFlashIcon from '@/components/icons/common/CameraFlashIcon';
import { Tooltip } from 'react-tippy';
import PopupErrorInformation from './components/PopupErrorInformation';

const initilaState = {
  data: [],
  data_ex: [],
  keySearch: '',
  onFetching: false,
  onFetchingBranch: false,
  idBranch: [],
  popupResponse: null,
};

const CheckQuality = props => {
  const router = useRouter();

  const isShow = useToast();

  const dataLang = props.dataLang;

  const statusExprired = useStatusExprired();

  const [isState, sIsState] = useState(initilaState);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorPopupData, setErrorPopupData] = useState(null);

  const dataSeting = useSetingServer();

  const formatNumber = num => formatNumberConfig(+num, dataSeting);

  const { paginate } = usePagination();

  const queryState = key => sIsState(prev => ({ ...prev, ...key }));

  const { is_admin: role, permissions_current: auth } = useSelector(state => state.auth);

  const { checkExport, checkEdit, checkAdd } = useActionRole(auth, 'client_group');

  // đổi type

  const { limit, updateLimit: sLimit, totalItems: totalItem, updateTotalItems } = useLimitAndTotalItems();

  const { data: listBranch = [] } = useBranchList();

  const params = {
    search: isState.keySearch,
    limit: limit,
    page: router.query?.page || 1,
    branch_id: isState.idBranch?.value ?? '',
  };

  const { data, isFetching, isLoading, refetch } = useCheckQualityList(params);

  const handleShowPopupState = response => {
    if (!response) return;
    queryState({ popupResponse: response });
  };

  const handleClosePopupState = () => {
    queryState({ popupResponse: null });
  };

  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    queryState({ keySearch: value });
    router.replace('/manufacture/check-quality');
  }, 500);

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);

    try {
      const transferList = deleteTarget?.transfers || [];
      const hasTransfer = transferList.length > 0;

      if (hasTransfer) {
        await revertTransfersToPending(transferList);
        await deleteWarehouseTransfers(transferList);
      }

      await deleteCheckQualityVoucher(deleteTarget.id);
      isShow('success', dataLang?.deleted_successfully || 'Xóa thành công');
      refetch();
      setDeleteTarget(null);
    } catch (error) {
      console.error('Delete QC error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const stringMap = {
    0: 'Chưa Duyệt',
    1: 'Đã duyệt',
    2: 'Không Duyệt',
  };

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
          title: `${'Ngày'}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Số phiếu QC'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Số lệnh sản xuất'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Số phiếu CK'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Số lượng QC'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Số lượng đạt'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Số lượng lỗi'}`,
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
        {
          title: `${'Trạng thái'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: data?.rResult?.map(e => [
        { value: `${e.id}`, style: { numFmt: '0' } },
        { value: `${formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG)}` },
        { value: `${e.reference_no ? e.reference_no : ''}` },
        { value: `${e.reference_no_po ? e.reference_no_po : ''}` },
        {
          value: `${e.transfer_warehouse ? e.transfer_warehouse?.map(e => e?.code).join(',') : ''}`,
        },
        { value: `${e.total_quantity ? formatNumber(e.total_quantity) : ''}` },
        {
          value: `${e.total_quantity_success ? formatNumber(e.total_quantity_success) : ''}`,
        },
        {
          value: `${e.total_quantity_error ? formatNumber(e.total_quantity_error) : ''}`,
        },
        { value: `${e.note ? e.note : ''}` },
        { value: `${e?.status ? stringMap[e?.status] : ''}` },
      ]),
    },
  ];

  // breadcrumb
  const breadcrumbItems = [
    {
      label: `QC`,
      // href: "/",
    },
    {
      label: `Phiếu kiểm tra chất lượng`,
    },
  ];

  const StatusTag = ({ status }) => {
    return (
      <div
        className={`${status == '0' ? 'bg-neutral-01 text-neutral-05 border-border-gray-1' : 'bg-green-02 text-green-00 border-green-01'} 
          border rounded-lg px-1.5 py-1 2xl:px-2 2xl:py-1.5 3xl:px-3 3xl:py-2 flex items-center gap-2 ease-in-out transition-all`}
      >
        <span className='3xl:text-sm 2xl:text-13 xl:text-xs text-11 font-medium whitespace-nowrap'>{status == '0' ? 'Chưa duyệt' : 'Đã duyệt'}</span>
      </div>
    );
  };

  const ActionButton = ({ onClick, onViewErrors, hasError }) => {
    return (
      <div className='flex gap-2 items-center'>
        {hasError && (
          <Tooltip title='Xem lỗi' arrow theme='dark' disabled={isDeleting}>
            <button
              type='button'
              onClick={onViewErrors}
              disabled={isDeleting}
              className={`group rounded-lg p-1 border border-transparent transition-all ease-in-out flex items-center justify-center hover:border-[#C25705] hover:bg-[#FFECDD] ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <CameraFlashIcon className='size-5' />
            </button>
          </Tooltip>
        )}
        <Tooltip title='Xoá phiếu' arrow theme='dark' disabled={isDeleting}>
          <button
            type='button'
            onClick={onClick}
            disabled={isDeleting}
            className={`group rounded-lg p-1 border border-transparent transition-all ease-in-out flex items-center justify-center hover:border-red-01 hover:bg-red-02 ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <TrashIcon className='size-5 text-[#EE1E1E]' />
          </button>
        </Tooltip>
      </div>
    );
  };

  // Gọi API đổi trạng thái phiếu chuyển về "chưa duyệt"
  const revertTransferStatus = transferId =>
    new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('warehouseman_id', '1');
      formData.append('id', transferId);

      Axios('POST', `/api_web/Api_transfer/confirmWarehouse?csrf_protection=true&is_delete_qc=true`, formData, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response?.data);
      });
    });

  // Gọi API xóa phiếu chuyển kho
  const removeWarehouseTransfer = transferId =>
    new Promise((resolve, reject) => {
      Axios('DELETE', `/api_web/Api_transfer/transfer/${transferId}?csrf_protection=true&is_delete_qc=true`, {}, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response?.data);
      });
    });

  // Gọi API xóa phiếu kiểm tra chất lượng
  const removeCheckQuality = qcId =>
    new Promise((resolve, reject) => {
      Axios('DELETE', `/api_web/Api_Qc/delete/${qcId}?csrf_protection=true`, {}, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response?.data);
      });
    });

  // Chuẩn hóa lỗi trả về từ API chuyển kho để hiển thị
  const handleTransferFailureResponse = response => {
    const exportData = Array.isArray(response?.data_export) ? response.data_export : [];
    const messageKey = response?.message || 'import_not_approval_warehouse';
    const translatedMessage = dataLang?.[messageKey] || messageKey;
    isShow('error', translatedMessage || 'Có lỗi xảy ra');
    handleShowPopupState({
      message: translatedMessage,
      data_export: exportData,
    });
  };

  // Đổi trạng thái tất cả phiếu chuyển sang chưa duyệt
  const revertTransfersToPending = async transferList => {
    for (const transfer of transferList) {
      const response = await revertTransferStatus(transfer?.id);
      //   const response = await revertTransferStatus(160);
      if (!response?.isSuccess) {
        setDeleteTarget(null);
        handleTransferFailureResponse(response);
        throw new Error(response?.message || 'REVERT_TRANSFER_FAILED');
      }
    }
  };

  // Xóa toàn bộ phiếu chuyển kho sau khi đã hủy duyệt
  const deleteWarehouseTransfers = async transferList => {
    for (const transfer of transferList) {
      const response = await removeWarehouseTransfer(transfer?.id);
      if (!response?.isSuccess) {
        setDeleteTarget(null);
        isShow('error', dataLang?.[response?.message] || response?.message || 'Không thể xóa phiếu chuyển kho');
        throw new Error(response?.message || 'DELETE_TRANSFER_FAILED');
      }
    }
  };

  // Xóa phiếu kiểm tra chất lượng
  const deleteCheckQualityVoucher = async qcId => {
    const response = await removeCheckQuality(qcId);
    if (!response?.isSuccess) {
      isShow('error', dataLang?.[response?.message] || response?.message || 'Không thể xóa phiếu kiểm tra chất lượng');
      throw new Error(response?.message || 'DELETE_QC_FAILED');
    }
  };

  const handleOpenDeletePopup = ({ id, soPhieuCK, transfers }) => {
    if (isDeleting) return;
    setDeleteTarget({ id, soPhieuCK, transfers });
  };

  const handleOpenErrorPopup = record => {
    setErrorPopupData(record);
  };

  const handleCloseErrorPopup = () => {
    setErrorPopupData(null);
  };

  const buildProductInfo = record => {
    if (!record) return null;
    const statusMap = {
      0: 'Chưa thực hiện',
      1: 'Đang thực hiện',
      2: 'Tạm dừng',
    };
    const statusLabel = record.status_label || statusMap[record.status] || record.stage_name || null;
    const resolvedImage = (Array.isArray(record.error_images) && record.error_images.length > 0 && record.error_images[0]) || record.product_image || record.image || null;

    return {
      name: record.product_name || record.item_name || record.name || 'Sản phẩm 1',
      variant: record.product_variation || record.item_variation || '(none)',
      status: statusLabel,
      quantity: record.quantity ?? record.total_quantity ?? record.total_quantity_error ?? null,
      unit: record.unit_name || record.unit || 'cái',
      code: record.product_code || record.code || record.reference_no || '',
      image: resolvedImage,
    };
  };

  const placeholderImages = Array.from({ length: 10 }).map(() => '/icon/default/default.png');

  const errorPopupProps = errorPopupData
    ? {
        id: errorPopupData?.id,
        stage: errorPopupData?.stage_name || 'Vắt sổ',
        errorCount: errorPopupData?.total_quantity_error ?? 0,
        tags: Array.isArray(errorPopupData?.error_tags) && errorPopupData.error_tags.length > 0 ? errorPopupData.error_tags : ['sanphamloi', 'sanphamloi'],
        images: Array.isArray(errorPopupData?.error_images) && errorPopupData.error_images.length > 0 ? errorPopupData.error_images : placeholderImages,
        product: buildProductInfo(errorPopupData),
      }
    : null;
  const popupSubtitle = isDeleting ? (
    <span className='inline-flex items-center gap-2 text-[#003DA0]'>
      <LoadingButton hiddenTitle className='w-4 h-4 text-[#003DA0]' />
      <span>{dataLang?.processing || 'Đang xử lý...'}</span>
    </span>
  ) : (
    CONFIRM_DELETION
  );

  return (
    <React.Fragment>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{'Phiếu kiểm tra chất lượng'}</title>
          </Head>
        }
        breadcrumb={<>{statusExprired ? <EmptyExprired /> : <Breadcrumb items={breadcrumbItems} className='3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]' />}</>}
        titleButton={
          <>
            <h2 className='text-title-section text-[#52575E] capitalize font-medium'>{'Phiếu kiểm tra chất lượng'}</h2>
            {/* <ButtonAddNew
                                onClick={() => {
                                    // if (role) {
                                    //     router.push(routerExportToOther.form)
                                    // } else if (checkAdd) {
                                    //     router.push(routerExportToOther.form)
                                    // }
                                    // else {
                                    //     isShow("error", WARNING_STATUS_ROLE)
                                    // }
                                    router.push(routerQc.form);
                                }}
                                dataLang={dataLang}
                            /> */}
            {/* <div className="flex items-center justify-end">
                                {role == true || checkAdd ? (
                                    <Popup_groupKh
                                        listBr={isState.listBr}
                                        onRefresh={_ServerFetching.bind(this)}
                                        dataLang={dataLang}
                                        className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-blue-fmrp text-white rounded-lg btn-animation hover:scale-105"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            isShow("error", WARNING_STATUS_ROLE);
                                        }}
                                        className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-blue-fmrp text-white rounded-lg btn-animation hover:scale-105"
                                    >
                                        {dataLang?.branch_popup_create_new}
                                    </button>
                                )}
                            </div> */}
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
                      label: dataLang?.price_quote_branch || 'price_quote_branch',
                      isDisabled: true,
                    },
                    ...listBranch,
                  ]}
                  isClearable={true}
                  onChange={e => queryState({ idBranch: e })}
                  value={isState.idBranch}
                  placeholder={dataLang?.price_quote_branch || 'price_quote_branch'}
                  colSpan={2}
                  closeMenuOnSelect={true}
                />
              </div>
              <div className='flex items-center justify-end space-x-2'>
                <OnResetData sOnFetching={e => {}} onClick={refetch.bind(this)} />
                {role == true || checkExport ? (
                  <div className={``}>{data?.rResult?.length > 0 && <ExcelFileComponent multiDataSet={multiDataSet} filename='Phiếu kiểm tra chất lượng' title='KTTCL' dataLang={dataLang} />}</div>
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
            <Customscrollbar className='3xl:h-[90%] 2xl:h-[95%] xl:h-[85%] lg:h-[90%] pb-2'>
              <div className='w-full'>
                <HeaderTable gridCols={11}>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {'Ngày'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {'Số phiếu QC'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {'Số lệnh sản xuất'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {'Số phiếu CK'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {'Số lượng QC'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {'Số lượng đạt'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {'Số lượng lỗi'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {'Trạng thái'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {'Ghi chú'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {'Chi nhánh'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {'Tác vụ'}
                  </ColumnTable>
                </HeaderTable>
                {isLoading || isFetching ? (
                  <Loading className='h-80' color='#0f4f9e' />
                ) : data?.rResult?.length > 0 ? (
                  <div className='h-full divide-y divide-slate-200'>
                    {data?.rResult?.map(e => {
                      const transferWarehouseCodes = e?.transfer_warehouse?.map(i => i?.code) || [];
                      const soPhieuCK = transferWarehouseCodes.length ? transferWarehouseCodes.join(', ') : '';
                      return (
                        <RowTable gridCols={11} key={e.id.toString()}>
                          <RowItemTable colSpan={1} textAlign={'center'}>
                            {formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG)}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'center'}>
                            <PopupCheckQuality
                              name={e?.reference_no}
                              dataLang={dataLang}
                              className='3xl:text-base 2xl:text-[12.5px] xl:text-[11px] font-medium text-[9px] px-2 text-center text-[#0F4F9E] hover:text-[#5599EC] transition-all ease-linear cursor-pointer '
                              id={e?.id}
                            />
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'center'}>
                            {e?.reference_no_po}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'center'}>
                            {e?.transfer_warehouse?.map(i => (
                              <Fragment key={i?.id}>
                                <PopupDetailWarehouseTransfer
                                  dataLang={dataLang}
                                  className='3xl:text-base 2xl:text-[12.5px] xl:text-[11px] font-medium text-[9px] px-2 text-[#0F4F9E] hover:text-[#5599EC] transition-all ease-linear cursor-pointer '
                                  name={i?.code}
                                  id={i?.id}
                                />
                              </Fragment>
                            ))}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'center'}>
                            {e?.total_quantity > 0 ? formatNumber(e?.total_quantity) : '-'}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'center'}>
                            {e?.total_quantity_success > 0 ? formatNumber(e?.total_quantity_success) : '-'}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'center'} className={'!text-red-500'}>
                            {e?.total_quantity_error > 0 ? formatNumber(e?.total_quantity_error) : '-'}
                          </RowItemTable>
                          <RowItemTable colSpan={1} className={'flex justify-center items-center'}>
                            <StatusTag status={e?.status} />
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'}>
                            {e?.note}
                          </RowItemTable>
                          <RowItemTable colSpan={1} className={'w-full flex flex-row justify-start items-center'}>
                            {e?.branch_name}
                          </RowItemTable>
                          <RowItemTable colSpan={1} className={'flex justify-center items-center'}>
                            <ActionButton
                              onViewErrors={() => handleOpenErrorPopup(e)}
                              onClick={() => handleOpenDeletePopup({ id: e?.id, soPhieuCK, transfers: e?.transfer_warehouse || [] })}
                              hasError={e?.has_error}
                            />
                          </RowItemTable>
                        </RowTable>
                      );
                    })}
                  </div>
                ) : (
                  <NoData />
                )}
              </div>
            </Customscrollbar>
            {isDeleting && (
              <div className='mt-3 flex justify-center'>
                <Loading className='h-12' color='#0f4f9e' />
              </div>
            )}
          </div>
        }
        pagination={
          <div className='flex items-center justify-between gap-2'>
            {data?.rResult?.length != 0 && (
              <ContainerPagination>
                {/* <TitlePagination dataLang={dataLang} totalItems={data?.output?.iTotalDisplayRecords} /> */}
                <Pagination postsPerPage={limit} totalPosts={Number(data?.output?.iTotalDisplayRecords)} paginate={paginate} currentPage={router.query?.page || 1} />
              </ContainerPagination>
            )}
            <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
          </div>
        }
      />
      {isState.popupResponse && <PopupState dataLang={dataLang} response={isState.popupResponse} onClose={handleClosePopupState} />}
      {errorPopupProps && (
        <div className='fixed inset-0 z-[1100] flex items-center justify-center bg-[#25387A50] backdrop-blur-[2.5px]'>
          <PopupErrorInformation onClose={handleCloseErrorPopup} qcId={errorPopupProps.id} />
        </div>
      )}
      {deleteTarget && (
        <PopupConfim
          dataLang={dataLang}
          type='warning'
          nameModel='check_quality'
          title={TITLE_DELETE}
          subtitle={popupSubtitle}
          isOpen={!!deleteTarget}
          save={() => {
            if (!isDeleting) {
              handleDelete();
            }
          }}
          cancel={() => {
            if (!isDeleting) {
              setDeleteTarget(null);
            }
          }}
          onClose={() => {
            if (!isDeleting) {
              setDeleteTarget(null);
            }
          }}
        />
      )}
    </React.Fragment>
  );
};

export default CheckQuality;
