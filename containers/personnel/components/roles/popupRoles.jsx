import apiRoles from '@/Api/apiPersonnel/apiRoles';
import { PlusIcon } from '@/components/icons';
import EditIcon from '@/components/icons/common/EditIcon';
import RolePermissionLayout from '@/components/common/permissions/RolePermissionLayout';
import TabSwitcherWithSlidingBackground from '@/components/common/tab/TabSwitcherWithSlidingBackground';
import useRolePermissionLayoutState from '@/hooks/common/useRolePermissionLayoutState';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import Loading from '@/components/UI/loading/loading';
import PopupCustom from '@/components/UI/popup';
import SelectOptionLever from '@/components/UI/selectOptionLever/selectOptionLever';
import useToast from '@/hooks/useToast';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

const initalState = {
  open: false,
  dataOption: [],
  onSending: false,
  name: '',
  position: '',
  department: '',
  valueBranch: [],
  errBranch: false,
  errName: false,
  errDepartment: false,
  activeTab: { id: 'info', name: '' },
  dataPower: [],
  valueSearch: '',
};
const PopupRoles = React.memo(props => {
  const isShow = useToast();

  // danh sách chi nhánh
  const dataOptBranch = useSelector(state => state.branch);
  const authState = useSelector(state => state.auth);
  // danh sách phòng ban
  const dataOptDepartment = useSelector(state => state.department_staff);
  // sách sách vị trí
  const dataOptPosition = useSelector(state => state.position_staff);

  const [isState, setIsState] = useState(initalState);

  const queryState = key => setIsState(prev => ({ ...prev, ...key }));

  useEffect(() => {
    isState.open && props?.id && queryState({ open: true });
  }, [isState.open]);

  // tự chọn chi nhánh mặc định khi tạo mới
  useEffect(() => {
    if (!isState.open || props.id) return;
    if (isState.valueBranch?.length > 0) return;
    if (authState?.branch?.length > 0) {
      const defaultBranch = {
        label: authState.branch[0].name,
        value: authState.branch[0].id,
      };
      queryState({ valueBranch: [defaultBranch] });
    }
  }, [isState.open, props.id, authState?.branch]);

  // convert lại data quyền hạn
  const transformData = data => {
    const transformedData = {};
    data.forEach(item => {
      const { key, is_check, name, child } = item;
      const transformedChild = {};

      if (child) {
        child.forEach(childItem => {
          const { key: childKey, name: childName, permissions } = childItem;
          const transformedPermissions = {};
          if (permissions) {
            permissions.forEach(permission => {
              transformedPermissions[permission.key] = {
                name: permission.name,
                is_check: permission.is_check,
              };
            });
          }
          transformedChild[childKey] = {
            name: childName,
            permissions: transformedPermissions,
          };
        });
      }
      transformedData[key] = {
        is_check,
        name,
        child: transformedChild,
      };
    });

    return transformedData;
  };

  // lấy danh sách quyền
  useQuery({
    queryKey: ['api_permissions'],
    queryFn: async () => {
      const { data, isSuccess, message } = await apiRoles.apiPermissions(props?.id);
      if (isSuccess == 1) {
        const permissionsArray = Object.entries(data.permissions)?.map(([key, value]) => ({
          key,
          ...value,
          child: Object.entries(value?.child)?.map(([childKey, childValue]) => ({
            key: childKey,
            ...childValue,
            permissions: Object.entries(childValue?.permissions)?.map(([permissionsKey, permissionsValue]) => ({
              key: permissionsKey,
              ...permissionsValue,
            })),
          })),
        }));
        queryState({ dataPower: permissionsArray });
      }
    },
    enabled: isState.open,
    // enabled: isState.open && !!props?.id
  });

  // lưu chức vụ
  const handingRoles = useMutation({
    mutationFn: data => {
      return apiRoles.apiHandingRoles(data, props?.id);
    },
  });

  const _ServerSending = () => {
    let formData = new FormData();
    const transformedResult = transformData(isState.dataPower);
    formData.append('name', isState.name ? isState.name : '');
    formData.append('position_parent_id', isState.position?.value ? isState.position?.value : '');
    formData.append('department_id', isState.department?.value ? isState.department?.value : '');
    isState.valueBranch.forEach(e => formData.append('branch_id[]', e?.value));
    const utf8Bytes = JSON.stringify(transformedResult);
    formData.append('permissions', utf8Bytes);

    handingRoles.mutate(formData, {
      onSuccess: ({ isSuccess, message }) => {
        if (isSuccess) {
          isShow('success', props.dataLang[message] || message);
          setIsState(initalState);
          props.onRefresh && props.onRefresh();
          props.onRefreshSub && props.onRefreshSub();
        } else {
          isShow('error', props.dataLang[message] || message);
        }
      },
      onError: error => {},
    });
    queryState({ onSending: false });
  };

  useEffect(() => {
    isState.onSending && _ServerSending();
  }, [isState.onSending]);

  const _HandleSubmit = e => {
    e.preventDefault();
    if (isState.name == '' || isState.department == '' || isState.valueBranch?.length == 0) {
      isState.name == '' && queryState({ errName: true });
      isState.department == '' && queryState({ errDepartment: true });
      isState.valueBranch?.length == 0 && queryState({ errBranch: true });
      isShow('error', props.dataLang?.required_field_null);
    } else {
      queryState({ onSending: true });
    }
  };

  useEffect(() => {
    queryState({ errName: false });
  }, [isState.name != '']);

  useEffect(() => {
    queryState({ errDepartment: false });
  }, [isState.department != '']);

  useEffect(() => {
    queryState({ errBranch: false });
  }, [isState.valueBranch?.length > 0]);

  /// danh sách vị trí
  useQuery({
    queryKey: ['api_position'],
    queryFn: async () => {
      const list = await apiRoles.apiPosition(props?.id);
      queryState({
        name: list?.name,
        department: {
          value: list?.department_id,
          label: list?.department_name,
        },
        position:
          list?.position_parent_id == 0
            ? null
            : {
                value: list?.position_parent_id,
                label: list?.position_parent_name,
              },
        valueBranch: list?.branch.map(e => ({
          label: e.name,
          value: e.id,
        })),
      });
      return list;
    },
    enabled: isState.open && !!props?.id,
  });

  // dnah sách chức
  const { isFetching } = useQuery({
    queryKey: ['api_position_option'],
    queryFn: async () => {
      const { rResult } = await apiRoles.apiDetailPositionOption(props?.id);
      queryState({
        dataOption: rResult.map(x => ({
          label: x.name,
          value: x.id,
          level: x.level,
        })),
      });
      return rResult;
    },
    enabled: isState.open && !!props?.id,
  });

  // Hàm normalize hỗ trợ search tiếng Việt (bỏ dấu, unicode-safe)
  const normalizeText = text =>
    (text || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // change modlue
  const handleChange = (parent, child = null, permissions = null) => {
    const newData = isState.dataPower?.map(e => {
      if (child == null && e?.key == parent?.key) {
        // Click vào group (mục cha)
        return {
          ...e,
          child: e?.child?.map(x => {
            return {
              ...x,
              permissions: x?.permissions?.map(y => {
                return {
                  ...y,
                  is_check: parent.is_check == 0 ? 1 : 0,
                };
              }),
            };
          }),
          is_check: parent.is_check == 0 ? 1 : 0,
        };
      } else if (child != null && e?.key == parent) {
        // Click vào permission (mục con)
        // Nếu group chưa được tick, tự động tick group
        const shouldCheckGroup = e?.is_check != 1;
        
        return {
          ...e,
          is_check: shouldCheckGroup ? 1 : e?.is_check, // Tự động tick group nếu chưa tick
          child: e?.child?.map(x => {
            if (x?.key == child) {
              return {
                ...x,
                permissions: x?.permissions?.map(y => {
                  if (y?.key == permissions?.key) {
                    return {
                      ...y,
                      is_check: y.is_check === 0 ? 1 : 0,
                    };
                  }
                  return y;
                }),
              };
            }
            return x;
          }),
        };
      }
      return e;
    });

    queryState({ dataPower: newData });
  };

  // ẩn hiện module khi tìm kiếm (hỗ trợ tiếng Việt, bỏ dấu)
  useEffect(() => {
    const searchValue = normalizeText(isState.valueSearch);

    // Nếu không có từ khóa tìm kiếm thì hiện toàn bộ
    if (!searchValue) {
      const resetData = isState.dataPower.map(item => ({
        ...item,
        hidden: false,
      }));
      queryState({ dataPower: resetData });
      return;
    }

    const filteredData = isState.dataPower.filter(item => normalizeText(item.name).includes(searchValue));
    const newdb = isState.dataPower.map(item => {
      const itemChecked = filteredData.find(x => item.key == x.key);
      if (itemChecked) {
        return {
          ...item,
          ...itemChecked,
          hidden: false,
        };
      }
      return {
        ...item,
        hidden: true,
      };
    });
    queryState({ dataPower: newdb });
  }, [isState.valueSearch]);

  // Khi clear input (value rỗng), active lại tab đầu tiên và scroll đến group đầu tiên
  // useEffect(() => {
  //   if (isState.activeTab?.id !== 'power') return;
    
  //   // Chỉ chạy khi valueSearch rỗng hoặc chỉ có khoảng trắng
  //   if (isState.valueSearch && isState.valueSearch.trim() !== '') return;

  //   // Tìm group đầu tiên không bị hidden
  //   const firstVisibleGroup = isState.dataPower?.find(e => !e?.hidden);
    
  //   if (firstVisibleGroup && scrollContainerRef.current) {
  //     // Set activeGroupKey về group đầu tiên
  //     setActiveGroupKey(firstVisibleGroup.key);
      
  //     // Scroll đến group đầu tiên (cách mép trên 200px như logic handleScrollToSection)
  //     const section = sectionRefs.current[firstVisibleGroup.key];
  //     if (section) {
  //       const container = scrollContainerRef.current;
  //       const sectionTop = section.offsetTop;
  //       const targetScrollTop = sectionTop - 200;
        
  //       container.scrollTo({
  //         top: targetScrollTop,
  //         behavior: 'smooth',
  //       });
  //     }
  //   }
  // }, [isState.valueSearch, isState.activeTab?.id, isState.dataPower]);

  const styleSelect = {
    theme: theme => ({
      ...theme,
      colors: {
        ...theme.colors,
        primary25: '#EBF5FF',
        primary50: '#92BFF7',
        primary: '#0F4F9E',
      },
    }),
    styles: {
      placeholder: base => ({
        ...base,
        color: '#cbd5e1',
      }),
    },
  };

  const tabList = useMemo(
    () => [
      { id: 'info', name: props.dataLang?.personnels_staff_popup_info || 'Thông tin' },
      { id: 'power', name: props.dataLang?.personnels_staff_popup_power || 'Quyền hạn' },
    ],
    [props.dataLang?.personnels_staff_popup_info, props.dataLang?.personnels_staff_popup_power]
  );

  // Initialize activeTab when popup opens
  useEffect(() => {
    if (isState.open && (!isState.activeTab?.id || isState.activeTab?.id === 'info' && !isState.activeTab?.name)) {
      queryState({ activeTab: tabList[0] });
    }
  }, [isState.open, tabList]);

  const {
    activeGroupKey,
    scrollContainerRef,
    sidebarRef,
    sidebarButtonRefs,
    sectionRefs,
    handleScrollToSection,
  } = useRolePermissionLayoutState({
    dataPower: isState.dataPower,
    isActivePowerTab: isState.activeTab?.id === 'power',
  });

  return (
    <PopupCustom
      title={
        props?.id
          ? `${props.dataLang?.category_personnel_position_edit || 'category_personnel_position_edit'}`
          : `${props.dataLang?.category_personnel_position_addnew || 'category_personnel_position_addnew'}`
      }
      // button={props?.id ? <IconEdit /> : `${props.dataLang?.branch_popup_create_new}`}
      button={
        props.id ? (
          <div className='group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer hover:border-[#064E3B] hover:bg-[#064E3B]/10'>
            <EditIcon className={`size-5 transition-all duration-300 `} />
          </div>
        ) : (
          <p className='flex flex-row justify-center items-center gap-x-1 responsive-text-sm text-sm font-normal'>
            <PlusIcon /> {props.dataLang?.branch_popup_create_new}
          </p>
        )
      }
      onClickOpen={() => queryState({ open: true })}
      open={isState.open}
      onClose={() => queryState({ open: false })}
      classNameBtn={props.className}
    >
      <div className='my-3'>
        <TabSwitcherWithSlidingBackground
          tabs={tabList}
          activeTab={isState.activeTab}
          onChange={tab => queryState({ activeTab: tab })}
          className='!p-1 flex-shrink-0 !overflow-visible'
          buttonClassName='!py-1.5 !px-3 !responsive-text-sm'
          buttonActiveClassName='!top-1 !bottom-1'
        />
      </div>
      <div className={`py-4 space-y-4 ${isState.activeTab?.id === 'info' ? 'w-[600px]' : 'w-[900px]'}`}>
        {isFetching ? (
          <Loading className='h-80' color='#0f4f9e' />
        ) : (
          <React.Fragment>
            {isState.activeTab?.id === 'info' && (
              <div className='space-y-2'>
                <div className='space-y-1'>
                  <label className='text-[#344054] font-normal text-base'>
                    {props.dataLang?.client_list_brand || 'client_list_brand'} <span className='text-red-500'>*</span>
                  </label>
                  <SelectComponent
                    classParent={'m-0'}
                    options={dataOptBranch}
                    value={isState.valueBranch}
                    onChange={value => queryState({ valueBranch: value })}
                    isClearable={true}
                    placeholder={props.dataLang?.client_list_brand || 'client_list_brand'}
                    isMulti
                    noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                    closeMenuOnSelect={false}
                    className={`${
                      isState.errBranch ? 'border-red-500' : 'border-transparent'
                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border p-0 z-50`}
                    {...styleSelect}
                  />
                  {isState.errBranch && <label className='text-sm text-red-500'>{props.dataLang?.client_list_bran || 'client_list_bran'}</label>}
                </div>
                <div className='space-y-1'>
                  <label className='text-[#344054] font-normal text-base'>
                    {props.dataLang?.category_personnel_position_department || 'category_personnel_position_department'} <span className='text-red-500'>*</span>
                  </label>
                  <SelectComponent
                    classParent={'m-0'}
                    options={dataOptDepartment}
                    value={isState.department}
                    onChange={value => queryState({ department: value })}
                    noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                    isClearable={true}
                    placeholder={props.dataLang?.category_personnel_position_department || 'category_personnel_position_department'}
                    className={`${
                      isState.errDepartment ? 'border-red-500' : 'border-transparent'
                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border p-0`}
                    isSearchable={true}
                    {...styleSelect}
                  />
                  {isState.errDepartment && (
                    <label className='text-sm text-red-500'>{props.dataLang?.category_personnel_position_err_department || 'category_personnel_position_err_department'}</label>
                  )}
                </div>
                <div className='space-y-1'>
                  <label className='text-[#344054] font-normal text-base'>
                    {props.dataLang?.category_personnel_position_name || 'category_personnel_position_name'} <span className='text-red-500'>*</span>
                  </label>
                  <input
                    value={isState.name}
                    onChange={e => queryState({ name: e.target.value })}
                    type='text'
                    placeholder={props.dataLang?.category_material_group_name}
                    className={`${
                      isState.errName ? 'border-red-500' : 'focus:border-[#92BFF7] border-[#d0d5dd] '
                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-1.5 border outline-none `}
                  />
                  {isState.errName && <label className='text-sm text-red-500'>{props.dataLang?.category_personnel_position_err_name || 'category_personnel_position_err_name'}</label>}
                </div>
                <div className='space-y-1 '>
                  <label className='text-[#344054] font-normal text-base'>{props.dataLang?.category_personnel_position_manage_position || 'category_personnel_position_manage_position'}</label>
                  <SelectComponent
                    classParent={'m-0'}
                    options={props?.id ? isState.dataOption : dataOptPosition}
                    formatOptionLabel={SelectOptionLever}
                    noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                    defaultValue={isState.position}
                    value={isState.position}
                    onChange={value => queryState({ position: value })}
                    isClearable={true}
                    placeholder={props.dataLang?.category_personnel_position_manage_position || 'category_personnel_position_manage_position'}
                    className='placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none p-0'
                    isSearchable={true}
                    {...styleSelect}
                  />
                </div>
              </div>
            )}
            {isState.activeTab?.id === 'power' && (
              <RolePermissionLayout
                dataPower={isState.dataPower}
                activeGroupKey={activeGroupKey}
                valueSearch={isState.valueSearch}
                onChangeSearch={value => queryState({ valueSearch: value })}
                searchPlaceholder={props.dataLang?.search_placeholder || 'Tìm kiếm'}
                sidebarRef={sidebarRef}
                sidebarButtonRefs={sidebarButtonRefs}
                scrollContainerRef={scrollContainerRef}
                sectionRefs={sectionRefs}
                onScrollToSection={handleScrollToSection}
                onToggleGroup={handleChange}
                onTogglePermission={(parentKey, childKey, permission) => handleChange(parentKey, childKey, permission)}
              />
            )}
            <div className='flex justify-end space-x-2'>
              <button onClick={() => queryState({ open: false })} className='px-4 py-2 text-base transition rounded-lg bg-slate-200 hover:opacity-90 hover:scale-105'>
                {props.dataLang?.branch_popup_exit}
              </button>
              <button onClick={_HandleSubmit.bind(this)} className='text-[#FFFFFF] text-base py-2 px-4 rounded-lg bg-[#003DA0] hover:opacity-90 hover:scale-105 transition'>
                {props.dataLang?.branch_popup_save}
              </button>
            </div>
          </React.Fragment>
        )}
      </div>
    </PopupCustom>
  );
});
export default PopupRoles;
