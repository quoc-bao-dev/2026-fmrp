import BreadcrumbCustom from '@/components/UI/breadcrumb/BreadcrumbCustom';
import OnResetData from '@/components/UI/btnResetData/btnReset';
import ContainerPagination from '@/components/UI/common/ContainerPagination/ContainerPagination';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table';
import { AvatarStack } from '@/components/UI/common/user';
import { LayOutTableDynamic } from '@/components/UI/common/layout';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import Loading from '@/components/UI/loading/loading';
import LoadingButton from '@/components/UI/loading/loadingButton';
import NoData from '@/components/UI/noData/nodata';
import Pagination from '@/components/UI/pagination';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import { WARNING_STATUS_ROLE } from '@/constants/warningStatus/warningStatus';
import { CONFIRM_DELETION, TITLE_DELETE } from '@/constants/delete/deleteTable';
import { useBranchList } from '@/hooks/common/useBranch';
import { useLimitAndTotalItems } from '@/hooks/useLimitAndTotalItems';
import usePagination from '@/hooks/usePagination';
import useActionRole from '@/hooks/useRole';
import useStatusExprired from '@/hooks/useStatusExprired';
import useToast from '@/hooks/useToast';
import { TrashIcon } from '@/components/icons';
import EditIcon from '@/components/icons/common/EditIcon';
import PopupGroupPiecework from './components/PopupGroupPiecework';
import { Grid6 } from 'iconsax-react';
import MultiValue from '@/components/UI/mutiValue/multiValue';
import { debounce } from 'lodash';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGroupMembers, useDeleteGroupMember } from '@/hooks/common/useStaffs';

const initialState = {
  keySearch: '',
  idBranch: [],
  idGroup: [],
};

const PieceworkWage = props => {
  const dataLang = props.dataLang;
  const isShow = useToast();
  const router = useRouter();
  const statusExprired = useStatusExprired();
  const { paginate } = usePagination();
  const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

  const [isState, sIsState] = useState(initialState);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryState = key => sIsState(prev => ({ ...prev, ...key }));

  // Hook để xóa tổ/nhóm
  const { mutate: deleteGroupMember, isLoading: isDeleting } = useDeleteGroupMember({
    onSuccess: data => {
      // Lấy message từ response và map với dataLang
      const messageKey = data?.message || 'deleted_successfully';
      // Kiểm tra isSuccess để quyết định toast type
      const toastType = data?.isSuccess === true || data?.isSuccess === 1 ? 'success' : 'error';
      isShow(toastType, dataLang?.[messageKey] || messageKey);
    },
    onError: error => {
      // Lấy message từ error hoặc response nếu có
      const messageKey = error?.response?.data?.message || error?.message || 'delete_failed';
      isShow('error', dataLang?.[messageKey] || messageKey);
    },
  });

  const { is_admin: role, permissions_current: auth } = useSelector(state => state.auth);

  const { checkExport, checkEdit, checkAdd, checkDelete } = useActionRole(auth, 'piecework_wage_group');

  // Danh sách chi nhánh
  const { data: listBranch = [] } = useBranchList();

  const branchIds = useMemo(() => (isState.idBranch || []).map(item => item?.value).filter(v => v !== '' && v !== null && v !== undefined), [isState.idBranch]);

  const groupIds = useMemo(() => (isState.idGroup || []).map(item => item?.value).filter(v => v !== '' && v !== null && v !== undefined), [isState.idGroup]);

  const effectiveLimit = useMemo(() => (limit && Number(limit) > 0 ? Number(limit) : 15), [limit]);

  const currentPage = useMemo(() => Number(router.query?.page) || 1, [router.query?.page]);

  const filterParams = useMemo(
    () => ({
      branch_id: branchIds,
      id_group_members: groupIds,
      search: isState.keySearch || '',
      limit: effectiveLimit,
      page: currentPage,
    }),
    [branchIds, groupIds, isState.keySearch, effectiveLimit, currentPage]
  );

  // Dữ liệu tổ nhóm theo bộ lọc (server pagination)
  const { data: groupMembersData, isLoading: isLoadingGroups, isFetching: isFetchingGroups, refetch: refetchGroupMembers } = useGroupMembers({ params: filterParams });

  // Danh sách tổ nhóm đầy đủ phục vụ combobox (không filter)
  const { data: fullGroupMembersData } = useGroupMembers();

  const branchOptions = useMemo(
    () => [
      // {
      //     value: "",
      //     label: dataLang?.price_quote_branch || "Chi nhánh",
      //     isDisabled: true,
      // },
      ...listBranch,
    ],
    [dataLang?.price_quote_branch, listBranch]
  );

  const groupOptions = useMemo(() => {
    const options =
      fullGroupMembersData?.rResult?.map(group => ({
        value: parseInt(group.id) || group.id,
        label: group.name,
      })) || [];

    return [
      // {
      //     value: "",
      //     label: dataLang?.piecework_wage_group || "Tổ nhóm",
      //     isDisabled: true,
      // },
      ...options,
    ];
  }, [dataLang?.piecework_wage_group, fullGroupMembersData]);

  const totalRecords = useMemo(() => Number(groupMembersData?.output?.iTotalDisplayRecords) || Number(groupMembersData?.output?.iTotalRecords) || 0, [groupMembersData]);

  // Hook useMemo để map dữ liệu từ API (không phân trang client)
  const tableData = useMemo(() => {
    // Map dữ liệu từ API response sang format của table
    const mappedData = (groupMembersData?.rResult || []).map(group => {
      // Lấy branch đầu tiên (hoặc có thể xử lý nhiều branch)
      const firstBranch = group.branch?.[0] || {};

      // Map staff sang format employees
      const employees = (group.staff || []).map(staff => ({
        id: parseInt(staff.id) || staff.id,
        name: staff.full_name?.split(' ').pop() || staff.full_name,
        full_name: staff.full_name,
        avatar: staff.profile_image,
        profile_image: staff.profile_image,
      }));

      return {
        id: parseInt(group.id) || group.id,
        name: group.name,
        code: group.code,
        quantity: group.staff?.length || 0,
        employees: employees,
        branch_name: firstBranch.name || '',
        branch_id: parseInt(firstBranch.id) || firstBranch.id,
        // Giữ nguyên dữ liệu gốc từ API để dùng cho edit
        branch: group.branch, // Giữ nguyên branch array từ API
        staff: group.staff, // Giữ nguyên staff array từ API
      };
    });

    return {
      rResult: mappedData,
      output: {
        iTotalDisplayRecords: groupMembersData?.output?.iTotalDisplayRecords ?? mappedData.length,
      },
    };
  }, [groupMembersData]);

  // Sử dụng dữ liệu từ API
  const data = tableData;
  const isFetching = isLoadingGroups || isFetchingGroups;
  const refetch = () => {
    // Gọi refetch từ react-query để tải lại dữ liệu
    refetchGroupMembers();
  };

  // Nếu đổi limit làm trang hiện tại vượt quá tổng trang, tự điều chỉnh về trang 1
  useEffect(() => {
    if (!effectiveLimit || effectiveLimit <= 0) return;
    // Chờ fetch xong rồi mới xét redirect để tránh chuyển trang sớm khi dữ liệu chưa về
    if (isFetching) return;

    const totalPages = Math.max(1, Math.ceil(totalRecords / effectiveLimit));
    if (currentPage > totalPages) {
      paginate(1);
    }
  }, [effectiveLimit, totalRecords, currentPage, paginate, isFetching]);

  // Hàm tìm kiếm
  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    queryState({ keySearch: value });
    router.replace('/piecework-wage');
  }, 500);

  // Xuất Excel
  const multiDataSet = [
    {
      columns: [
        {
          // STT
          title: `${dataLang?.stt || 'STT'}`,
          width: { wch: 6 },
          style: {
            fill: { fgColor: { rgb: 'EFF6FF' } }, // nền xanh nhạt
            font: {
              bold: true,
              name: 'Lexend Deca',
              color: { rgb: '111827' }, // text đậm
            },
          },
        },
        {
          // Tên tổ nhóm
          title: `${dataLang?.piecework_wage_group_name || 'Tên tổ nhóm'}`,
          width: { wpx: 160 },
          style: {
            fill: { fgColor: { rgb: 'EFF6FF' } }, // nền xanh nhạt
            font: {
              bold: true,
              name: 'Lexend Deca',
              color: { rgb: '111827' }, // text đậm
            },
          },
        },
        {
          // Số lượng
          title: `${dataLang?.piecework_wage_group_quantity || 'Số lượng'}`,
          width: { wch: 10 },
          style: {
            fill: { fgColor: { rgb: 'EFF6FF' } },
            font: {
              bold: true,
              name: 'Lexend Deca',
              color: { rgb: '111827' },
            },
          },
        },
        {
          // Nhân viên
          title: `${dataLang?.piecework_wage_group_employees || 'Nhân viên'}`,
          width: { wpx: 320 },
          style: {
            fill: { fgColor: { rgb: 'EFF6FF' } },
            font: {
              bold: true,
              name: 'Lexend Deca',
              color: { rgb: '111827' },
            },
          },
        },
        {
          // Chi nhánh
          title: `${dataLang?.piecework_wage_group_branch || 'Chi nhánh'}`,
          width: { wch: 24 },
          style: {
            fill: { fgColor: { rgb: 'EFF6FF' } },
            font: {
              bold: true,
              name: 'Lexend Deca',
              color: { rgb: '111827' },
            },
          },
        },
      ],
      data:
        data?.rResult?.map((e, index) => {
          const employeesNames = Array.isArray(e.employees)
            ? e.employees
                .map(emp => emp?.full_name || emp?.name)
                .filter(Boolean)
                .join(', ')
            : '';

          return [
            {
              value: index + 1,
              style: {
                numFmt: '0',
                font: { name: 'Lexend Deca' },
              },
            }, // STT
            {
              value: `${e.name ? e.name : ''}`,
              style: { font: { name: 'Lexend Deca' } },
            },
            {
              value: `${e.quantity ? e.quantity : ''}`,
              style: { font: { name: 'Lexend Deca' } },
            },
            {
              value: employeesNames,
              style: { font: { name: 'Lexend Deca' } },
            },
            {
              value: `${e.branch_name ? e.branch_name : ''}`,
              style: { font: { name: 'Lexend Deca' } },
            },
          ];
        }) || [],
    },
  ];

  const breadcrumbItems = [
    {
      label: `${dataLang?.piecework_wage || 'Lương sản lượng'}`,
    },
    {
      label: `${dataLang?.piecework_wage_group_list || 'Danh sách tổ/ nhóm'}`,
    },
  ];

  // TODO: Thay thế bằng hàm xử lý thực tế
  const handleEdit = id => {
    console.log('Edit', id);
  };

  const handleOpenDeletePopup = id => {
    if (isDeleting) return;
    setDeleteTarget(id);
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;
    // Đóng modal ngay khi bấm xác nhận
    const targetId = deleteTarget;
    setDeleteTarget(null);
    // Gọi mutation để xóa tổ/nhóm
    deleteGroupMember(targetId);
  };

  const popupSubtitle = isDeleting ? (
    <span className='inline-flex items-center gap-2 text-[#003DA0]'>
      <LoadingButton hiddenTitle className='w-4 h-4 text-[#003DA0]' />
      <span>{dataLang?.processing || 'Đang xử lý...'}</span>
    </span>
  ) : (
    CONFIRM_DELETION
  );

  return (
    <div className='min-h-screen relative'>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{dataLang?.piecework_wage_group_list || 'Danh sách tổ/ nhóm'}</title>
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
            <h2 className='text-title-section text-[#52575E] capitalize font-medium'>{dataLang?.piecework_wage_group_list || 'Danh sách tổ/ nhóm'}</h2>
            <div className='flex items-center justify-end gap-2'>
              {role == true || checkAdd ? (
                <PopupGroupPiecework
                  dataLang={dataLang}
                  onRefresh={refetch}
                  listBranch={listBranch}
                  className='responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal rounded-md bg-blue-fmrp text-white btn-animation hover:scale-105'
                />
              ) : (
                <button
                  type='button'
                  onClick={() => {
                    isShow('error', WARNING_STATUS_ROLE);
                  }}
                  className='responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal bg-blue-fmrp text-white rounded-lg btn-animation hover:scale-105'
                >
                  {dataLang?.branch_popup_create_new || '+ Tạo mới'}
                </button>
              )}
            </div>
          </>
        }
        table={
          <div className='flex flex-col h-full'>
            <div className='w-full items-center flex justify-between gap-2'>
              <div className='flex gap-3 items-center w-full'>
                <SearchComponent dataLang={dataLang} onChange={_HandleOnChangeKeySearch.bind(this)} colSpan={1} />
                <SelectComponent
                  options={branchOptions}
                  colSpan={1}
                  onChange={selected => queryState({ idBranch: selected || [] })}
                  value={isState.idBranch}
                  placeholder={dataLang?.price_quote_branch || 'Chi nhánh'}
                  isClearable={true}
                  isMulti={true}
                  closeMenuOnSelect={false}
                  components={{ MultiValue }}
                />
                <SelectComponent
                  options={groupOptions}
                  colSpan={1}
                  onChange={selected => queryState({ idGroup: selected || [] })}
                  value={isState.idGroup}
                  placeholder={dataLang?.piecework_wage_group || 'Tổ nhóm'}
                  isClearable={true}
                  isMulti={true}
                  closeMenuOnSelect={false}
                  components={{ MultiValue }}
                />
              </div>

              <div className='flex items-center justify-end space-x-2'>
                <OnResetData sOnFetching={e => {}} onClick={() => refetch()} />
                {role == true || checkExport ? (
                  <div className={``}>{data?.rResult?.length > 0 && <ExcelFileComponent multiDataSet={multiDataSet} filename='Danh sách tổ/ nhóm' title='DSTN' dataLang={dataLang} />}</div>
                ) : (
                  <button
                    onClick={() => isShow('error', WARNING_STATUS_ROLE)}
                    className={`xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition`}
                  >
                    <Grid6 className='scale-75 2xl:scale-100 xl:scale-100' size={18} />
                    <span>{dataLang?.client_list_exportexcel || 'Xuất Excel'}</span>
                  </button>
                )}
              </div>
            </div>
            <Customscrollbar className='h-full overflow-y-auto'>
              <div className='w-full'>
                <HeaderTable gridCols={13}>
                  <ColumnTable colSpan={0.5} textAlign={'center'}>
                    {dataLang?.stt || 'STT'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.piecework_wage_group_code || 'Mã tổ nhóm'}
                  </ColumnTable>
                  <ColumnTable colSpan={2.5} textAlign={'left'}>
                    {dataLang?.piecework_wage_group_name || 'Tên tổ nhóm'}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={'center'}>
                    {dataLang?.piecework_wage_group_quantity || 'Số lượng'}
                  </ColumnTable>
                  <ColumnTable colSpan={2.5} textAlign={'left'}>
                    {dataLang?.piecework_wage_group_employees || 'Nhân viên'}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={'left'}>
                    {dataLang?.piecework_wage_group_branch || 'Chi nhánh'}
                  </ColumnTable>
                  <ColumnTable colSpan={2.5} textAlign={'center'}>
                    {dataLang?.branch_popup_properties || 'Tác vụ'}
                  </ColumnTable>
                </HeaderTable>

                {isFetching ? (
                  <Loading className='h-80' color='#0f4f9e' />
                ) : data?.rResult?.length > 0 ? (
                  <>
                    <div className='divide-y divide-slate-200 h-[100%]'>
                      {data?.rResult?.map((e, index) => {
                        // Format employees data for AvatarStack
                        const employeesData =
                          e?.employees?.map(emp => ({
                            id: emp?.id,
                            name: emp?.full_name || emp?.full_name,
                            avatarUrl: emp?.avatar || emp?.profile_image,
                          })) || [];

                        return (
                          <RowTable gridCols={13} key={e.id.toString()}>
                            <RowItemTable colSpan={0.5} textAlign={'center'}>
                              {index + 1}
                            </RowItemTable>
                            <RowItemTable colSpan={1} textAlign={'left'}>
                              {role == true || checkEdit ? (
                                <PopupGroupPiecework
                                  dataLang={dataLang}
                                  onRefresh={refetch}
                                  listBranch={listBranch}
                                  editData={e}
                                  trigger={
                                    <span className='text-blue-fmrp cursor-pointer hover:underline'>{e.code || ''}</span>
                                  }
                                  buttonClassName='inline-flex'
                                />
                              ) : (
                                <span className='text-blue-fmrp'>{e.code || ''}</span>
                              )}
                            </RowItemTable>
                            <RowItemTable colSpan={2.5} textAlign={'left'}>
                              {e.name}
                            </RowItemTable>
                            <RowItemTable colSpan={2} textAlign={'center'}>
                              <span className='text-blue-fmrp'>{e.quantity || 0}</span>
                            </RowItemTable>
                            <RowItemTable colSpan={2.5} textAlign={'left'}>
                              {employeesData.length > 0 ? (
                                <PopupGroupPiecework
                                  dataLang={dataLang}
                                  onRefresh={refetch}
                                  listBranch={listBranch}
                                  editData={e}
                                  trigger={
                                    <div className='inline-flex cursor-pointer'>
                                      <AvatarStack people={employeesData} size={32} />
                                    </div>
                                  }
                                  buttonClassName='inline-flex'
                                />
                              ) : (
                                <span className='text-sm text-[#9295A4]'>Chưa có nhân viên</span>
                              )}
                            </RowItemTable>
                            <RowItemTable colSpan={2} textAlign={'left'}>
                              {e.branch_name || ''}
                            </RowItemTable>
                            <RowItemTable colSpan={2.5} className='flex items-center justify-center space-x-2 text-center'>
                              {role == true || checkEdit ? (
                                <PopupGroupPiecework
                                  dataLang={dataLang}
                                  onRefresh={refetch}
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
                              ) : (
                                <EditIcon className='cursor-pointer size-5 text-gray-400' onClick={() => isShow('error', WARNING_STATUS_ROLE)} />
                              )}
                              {role == true || checkDelete ? (
                                <button
                                  onClick={() => handleOpenDeletePopup(e.id)}
                                  className='group hover:border-red-01 hover:bg-red-02 rounded-lg w-fit p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer'
                                  title='Xóa'
                                >
                                  <TrashIcon className='size-5 text-[#EE1E1E]' />
                                </button>
                              ) : (
                                <TrashIcon className='cursor-pointer size-5 text-gray-400' onClick={() => isShow('error', WARNING_STATUS_ROLE)} />
                              )}
                            </RowItemTable>
                          </RowTable>
                        );
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
              <Pagination postsPerPage={effectiveLimit} totalPosts={Number(data?.output?.iTotalDisplayRecords)} paginate={paginate} currentPage={currentPage} />
            </ContainerPagination>

            <DropdowLimit sLimit={sLimit} limit={effectiveLimit} dataLang={dataLang} />
          </div>
        }
      />
      {deleteTarget && (
        <PopupConfim
          dataLang={dataLang}
          type='warning'
          nameModel='piecework_wage_group'
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
    </div>
  );
};

export default PieceworkWage;
