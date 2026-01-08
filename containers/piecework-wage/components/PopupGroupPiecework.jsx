import { CheckIcon, PlusIcon, TrashIcon, UserPlusIcon } from '@/components/icons';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import ResponsibleAvatar from '@/components/UI/common/user/ResponsibleAvatar';
import InputClearable from '@/components/UI/common/input/ClearableInput';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import LoadingButton from '@/components/UI/loading/loadingButton';
import NoData from '@/components/UI/noData/nodata';
import PopupCustom from '@/components/UI/popup';
import ResponsiblePersonComboBox from '@/components/UI/popup/ResponsiblePersonComboBox';
import { useCreateGroupMember, useUpdateGroupMember, useSearchStaffs } from '@/hooks/common/useStaffs';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import useToast from '@/hooks/useToast';
import { Lexend_Deca } from '@next/font/google';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const PopupGroupPiecework = ({ dataLang, className, onRefresh, trigger, buttonClassName, listBranch = [], editData = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openCombo, setOpenCombo] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [errorStaff, setErrorStaff] = useState('');
  const [isConfirmBranchChangeOpen, setIsConfirmBranchChangeOpen] = useState(false);
  const [pendingBranch, setPendingBranch] = useState(null);
  const [shouldFilterAfterBranchChange, setShouldFilterAfterBranchChange] = useState(false);
  const [isPendingClearBranch, setIsPendingClearBranch] = useState(false);

  // Lấy auth state để tự động bắt branch
  const authState = useSelector(state => state.auth);

  // Xác định mode: edit nếu có editData, create nếu không
  const isEditMode = !!editData;

  const form = useForm({
    defaultValues: {
      groupName: '',
      code: '',
      branch: null,
    },
  });

  // Lấy branch_id từ form để filter nhân viên
  const selectedBranchId = form.watch('branch')?.value;

  // Hook lấy danh sách nhân viên theo chi nhánh
  const { data: staffsData } = useSearchStaffs({
    branch_ids: selectedBranchId ? [selectedBranchId] : [],
    enabled: !!selectedBranchId && isOpen, // Chỉ fetch khi có branch_id và popup đang mở
  });

  // Map dữ liệu nhân viên từ API sang format cho ResponsiblePersonComboBox
  const listStaffs = useMemo(() => {
    return (
      staffsData?.data?.staffs?.map(e => ({
        id: e.staffid,
        name: e.full_name,
        avatarUrl: e.profile_image,
      })) || []
    );
  }, [staffsData]);

  const title = isEditMode ? dataLang?.piecework_wage_group_edit || 'Sửa tổ/ nhóm' : dataLang?.piecework_wage_group_create || 'Tạo tổ/ nhóm';
  const isShow = useToast();

  // Hook để tạo tổ/nhóm
  const { mutate: createGroupMember, isLoading: isCreating } = useCreateGroupMember({
    onSuccess: data => {
      // Lấy message từ response và map với dataLang
      const messageKey = data?.message || 'created_successfully';
      isShow('success', dataLang?.[messageKey] || messageKey);
      // Đóng popup
      setIsOpen(false);
      // Reset form
      form.reset({
        groupName: '',
        code: '',
        branch: null,
      });
      setSelectedPeople([]);
      setErrorStaff('');
      // Gọi onRefresh nếu có (để đảm bảo component cha cũng được cập nhật)
      if (onRefresh) onRefresh();
    },
    onError: error => {
      isShow('error', error.message || dataLang?.create_failed || 'Tạo tổ/nhóm thất bại');
    },
  });

  // Hook để cập nhật tổ/nhóm
  const { mutate: updateGroupMember, isLoading: isUpdating } = useUpdateGroupMember({
    onSuccess: data => {
      // Lấy message từ response và map với dataLang
      const messageKey = data?.message || 'updated_successfully';
      const toastType = data?.isSuccess === true || data?.isSuccess === 1 ? 'success' : 'error';
      isShow(toastType, dataLang?.[messageKey] || messageKey);
      // Đóng popup
      setIsOpen(false);
      // Reset form
      form.reset({
        groupName: '',
        code: '',
        branch: null,
      });
      setSelectedPeople([]);
      setErrorStaff('');
      // Gọi onRefresh nếu có (để đảm bảo component cha cũng được cập nhật)
      if (onRefresh) onRefresh();
    },
    onError: error => {
      isShow('error', error.message || dataLang?.update_failed || 'Cập nhật tổ/nhóm thất bại');
    },
  });

  const isLoading = isCreating || isUpdating;

  const handleRemovePerson = id => {
    setSelectedPeople(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = form.handleSubmit(data => {
    // Validate nhân viên không được để trống
    if (selectedPeople.length === 0) {
      setErrorStaff(dataLang?.piecework_wage_group_staff_required || 'Vui lòng chọn ít nhất một nhân viên');
      return;
    }

    // Clear lỗi nếu có nhân viên
    setErrorStaff('');

    // Tạo payload theo format yêu cầu
    const idStaffArray = selectedPeople.map(person => person.id);
    const branchId = data.branch?.value;

    // Tạo payload object để gửi API
    const payload = {
      name: data.groupName,
      code: data.code,
      id_staff: idStaffArray,
      branch_id: branchId,
    };

    // Gửi dữ liệu qua hook tương ứng với mode
    if (isEditMode && editData?.id) {
      updateGroupMember({
        id: editData.id,
        ...payload,
      });
    } else {
      createGroupMember(payload);
    }
  });

  // Hàm xử lý khi thay đổi chi nhánh
  const handleChangeBranch = (newBranch, fieldOnChange) => {
    const currentBranch = form.getValues('branch');

    // Nếu bấm clear (newBranch = null)
    if (!newBranch) {
      // Nếu chưa chọn nhân viên nào thì clear luôn, không cần xác nhận
      if (!selectedPeople.length) {
        fieldOnChange(null);
        form.clearErrors('branch');
        setPendingBranch(null);
        setIsPendingClearBranch(false);
        setIsConfirmBranchChangeOpen(false);
        setShouldFilterAfterBranchChange(false);
        setSelectedPeople([]);
        setErrorStaff('');
        return;
      }

      // Nếu đã chọn nhân viên thì hỏi xác nhận trước khi clear
      setPendingBranch(null);
      setIsPendingClearBranch(true);
      setIsConfirmBranchChangeOpen(true);
      return;
    }

    setIsPendingClearBranch(false);

    // Nếu chưa có nhân viên nào được chọn hoặc chưa có branch hiện tại thì cho đổi luôn
    if (!selectedPeople.length || !currentBranch || !currentBranch?.value) {
      fieldOnChange(newBranch);
      return;
    }

    // Nếu chọn lại cùng chi nhánh cũ thì cho đổi luôn
    if (newBranch?.value === currentBranch?.value) {
      fieldOnChange(newBranch);
      return;
    }

    // Đổi sang chi nhánh mới khi đã có nhân viên -> hỏi xác nhận
    setPendingBranch(newBranch);
    setIsConfirmBranchChangeOpen(true);
  };

  // Điền dữ liệu vào form khi ở mode edit hoặc set branch mặc định khi create
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && editData) {
      // Mode edit: Điền dữ liệu từ editData
      form.setValue('groupName', editData.name || '');
      form.setValue('code', editData.code || '');

      // Điền branch - ưu tiên từ branch array, sau đó branch_id
      let branchId = null;
      if (editData.branch && Array.isArray(editData.branch) && editData.branch.length > 0) {
        branchId = editData.branch[0]?.id;
      } else if (editData.branch_id) {
        branchId = editData.branch_id;
      }

      if (branchId && listBranch?.length > 0) {
        const branchOption = listBranch.find(branch => branch.value === branchId || branch.value === String(branchId) || branch.value === parseInt(branchId));
        if (branchOption) {
          form.setValue('branch', branchOption);
        }
      }

      // Điền danh sách nhân viên - ưu tiên từ staff, sau đó employees
      let staffsArray = [];
      if (editData.staff && Array.isArray(editData.staff)) {
        staffsArray = editData.staff;
      } else if (editData.employees && Array.isArray(editData.employees)) {
        staffsArray = editData.employees;
      }

      if (staffsArray.length > 0) {
        const staffs = staffsArray.map(staff => ({
          id: staff.id || staff.staffid || (staff.id ? String(staff.id) : ''),
          name: staff.full_name || staff.name || '',
          avatarUrl: staff.profile_image || staff.avatar || null,
        }));
        setSelectedPeople(staffs);
      }
    } else {
      // Mode create: Tự động set branch từ auth khi popup mở
      const currentBranch = form.getValues('branch');
      if (currentBranch) return;

      // Tìm branch trong listBranch dựa trên authState.branch_id hoặc authState.branch[0]
      let defaultBranchOption = null;

      if (authState?.branch_id && listBranch?.length > 0) {
        // Tìm branch theo branch_id
        defaultBranchOption = listBranch.find(branch => branch.value === authState.branch_id || branch.value === String(authState.branch_id));
      } else if (authState?.branch?.length > 0 && listBranch?.length > 0) {
        // Tìm branch theo branch[0].id
        const authBranchId = authState.branch[0]?.id;
        if (authBranchId) {
          defaultBranchOption = listBranch.find(branch => branch.value === authBranchId || branch.value === String(authBranchId));
        }
      }

      if (defaultBranchOption) {
        form.setValue('branch', defaultBranchOption);
      }
    }
  }, [isOpen, isEditMode, editData, authState, listBranch, form]);

  // Sau khi người dùng xác nhận đổi chi nhánh, chỉ giữ lại những nhân viên thuộc chi nhánh mới
  useEffect(() => {
    if (!isOpen) return;
    if (!shouldFilterAfterBranchChange) return;

    const branchValue = form.getValues('branch')?.value;
    if (!branchValue) {
      setShouldFilterAfterBranchChange(false);
      return;
    }

    // Nếu chi nhánh mới không có dữ liệu nhân viên -> clear toàn bộ
    if (!listStaffs || listStaffs.length === 0) {
      setSelectedPeople([]);
      setShouldFilterAfterBranchChange(false);
      return;
    }

    setSelectedPeople(prev => {
      if (!prev || prev.length === 0) return prev;
      const validIds = new Set(listStaffs.map(s => String(s.id)));
      return prev.filter(p => validIds.has(String(p.id)));
    });

    setShouldFilterAfterBranchChange(false);
  }, [isOpen, shouldFilterAfterBranchChange, listStaffs, form]);

  // Reset form when popup closes
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        groupName: '',
        code: '',
        branch: null,
      });
      setSelectedPeople([]);
      setErrorStaff('');
      setIsConfirmBranchChangeOpen(false);
      setPendingBranch(null);
      setShouldFilterAfterBranchChange(false);
      setIsPendingClearBranch(false);
    }
  }, [isOpen, form]);

  const handleConfirmBranchChange = () => {
    if (isPendingClearBranch) {
      form.setValue('branch', null);
      form.clearErrors('branch');
      setSelectedPeople([]);
      setErrorStaff('');
      setShouldFilterAfterBranchChange(false);
    } else if (pendingBranch) {
      form.setValue('branch', pendingBranch);
      setShouldFilterAfterBranchChange(true);
    }
    setIsConfirmBranchChangeOpen(false);
    setPendingBranch(null);
    setIsPendingClearBranch(false);
  };

  return (
    <>
      <PopupCustom
        title={''}
        button={
          trigger ? (
            trigger
          ) : (
            <p className='flex flex-row justify-center items-center gap-x-1 responsive-text-sm text-sm font-normal'>
              <PlusIcon className='size-4' /> {dataLang?.branch_popup_create_new || '+ Tạo mới'}
            </p>
          )
        }
        onClickOpen={() => setIsOpen(true)}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        type='popupGroupPiecework'
        classNameBtn={buttonClassName || className}
        classNameModeltime={`max-w-[654px]- !w-[654px] p-6 rounded-[24px]`}
        classNameTittle='items-start'
      >
        <div className={`${deca.className} w-full flex flex-col gap-6`}>
          {/* Header */}
          <div className='flex items-center justify-between gap-4'>
            <h2 className='text-[24px] leading-[20px] font-bold text-[#141522] capitalize'>{title}</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={() => setIsOpen(false)}
              className='flex items-center justify-center w-7 h-7 rounded-full hover:opacity-80 transition-opacity'
            >
              <CloseXIcon className='size-full' />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            {/* Tên tổ/nhóm và Mã nhóm */}
            <div className='flex flex-col gap-4'>
              <div className='flex items-start gap-4'>
                {/* Mã nhóm */}
                <div className='flex flex-col gap-2 flex-1'>
                  <label className='text-[16px] leading-5 font-semibold text-[#141522] flex items-center gap-1'>
                    {dataLang?.piecework_wage_group_code || 'Mã tổ/ nhóm'}
                    <span className='text-[#EE1E1E]'>*</span>
                  </label>
                  <Controller
                    name='code'
                    control={form.control}
                    rules={{
                      required: {
                        value: true,
                        message: dataLang?.piecework_wage_group_code_required || 'Vui lòng nhập mã tổ/ nhóm',
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div className='flex flex-col gap-1'>
                        <InputClearable type='text' {...field} placeholder={dataLang?.piecework_wage_group_code_placeholder || 'Nhập mã tổ/ nhóm'} error={fieldState.error} />
                        {fieldState.error && <span className='text-xs text-[#EE1E1E]'>{fieldState.error.message}</span>}
                      </div>
                    )}
                  />
                </div>
                {/* Tên tổ/nhóm */}
                <div className='flex flex-col gap-2 flex-1'>
                  <label className='text-[16px] leading-5 font-semibold text-[#141522] flex items-center gap-1'>
                    {dataLang?.piecework_wage_group_name || 'Tên tổ/ nhóm'}
                    <span className='text-[#EE1E1E]'>*</span>
                  </label>
                  <Controller
                    name='groupName'
                    control={form.control}
                    rules={{
                      required: {
                        value: true,
                        message: dataLang?.piecework_wage_group_name_required || 'Vui lòng nhập tên tổ/ nhóm',
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div className='flex flex-col gap-1'>
                        <InputClearable type='text' {...field} placeholder={dataLang?.piecework_wage_group_name_placeholder || 'Nhập tên tổ/ nhóm'} error={fieldState.error} />
                        {fieldState.error && <span className='text-xs text-[#EE1E1E]'>{fieldState.error.message}</span>}
                      </div>
                    )}
                  />
                </div>
              </div>
              {/* Chi nhánh */}
              <div className='grid grid-cols-2 gap-4 items-end-'>
                <div className='flex flex-col gap-2 '>
                  <label className='text-[16px] leading-5 font-semibold text-[#141522] flex items-center gap-1'>
                    {dataLang?.price_quote_branch || 'Chi nhánh'}
                    <span className='text-[#EE1E1E]'>*</span>
                  </label>
                  <Controller
                    name='branch'
                    control={form.control}
                    rules={{
                      required: {
                        value: true,
                        message: dataLang?.price_quote_branch_required || 'Vui lòng chọn chi nhánh',
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div className='flex flex-col gap-1'>
                        <SelectComponent
                          options={[...listBranch]}
                          className='!rounded-lg'
                          value={field.value}
                          onChange={option => handleChangeBranch(option, field.onChange)}
                          placeholder={dataLang?.price_quote_branch || 'Chọn chi nhánh'}
                          isClearable={true}
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              borderRadius: '8px',
                              borderColor: fieldState.error ? '#EE1E1E' : state.isFocused ? '#003DA0' : '#D0D5DD',
                              boxShadow: fieldState.error ? 'none' : state.isFocused ? '0 0 0 1px #003DA0' : 'none',
                              '&:hover': {
                                borderColor: fieldState.error ? '#EE1E1E' : '#003DA0',
                              },
                            }),
                          }}
                        />
                        {fieldState.error && <span className='text-xs text-[#EE1E1E]'>{fieldState.error.message}</span>}
                      </div>
                    )}
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <div className='h-[20px]'></div>

                  <ResponsiblePersonComboBox
                    open={openCombo}
                    onClose={() => setOpenCombo(false)}
                    onConfirm={newSelected => {
                      setSelectedPeople(newSelected || []);
                      setOpenCombo(false);
                      // Clear lỗi khi chọn nhân viên
                      if (newSelected && newSelected.length > 0) {
                        setErrorStaff('');
                      }
                    }}
                    selected={selectedPeople}
                    data={listStaffs}
                    hideSelected={false}
                    emptyMessage={dataLang?.piecework_wage_group_no_staff_in_branch || 'Không có nhân viên thuộc chi nhánh này'}
                  >
                    <button
                      type='button'
                      onClick={() => setOpenCombo(true)}
                      className={`inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#E2EFFF] text-[#25387A] text-sm font-medium hover:bg-[#D4E4FF] hover:shadow-sm transition-colors w-fit ${
                        errorStaff ? 'border border-[#EE1E1E]' : ''
                      }`}
                    >
                      <UserPlusIcon className='size-5 text-[#25387A]' />
                      <span>{dataLang?.piecework_wage_group_add_staff || 'Thêm nhân viên'}</span>
                    </button>
                  </ResponsiblePersonComboBox>
                  {errorStaff && <span className='text-xs text-[#EE1E1E]'>{errorStaff}</span>}
                </div>
              </div>
            </div>

            {/* Thêm nhân viên */}
            <div className='flex flex-col gap-3'>
              {/* Table header */}
              <div className='flex items-center px-4 py-3'>
                <div className='flex-1'>
                  <span className='text-[14px] font-semibold leading-[20px] text-[#9295A4]'>{dataLang?.piecework_wage_group_employees || 'Nhân viên'}</span>
                </div>
                <div className='flex-1 text-end'>
                  <span className='text-[14px] font-semibold leading-[20px] text-[#9295A4]'>{dataLang?.branch_popup_properties || 'Tác vụ'}</span>
                </div>
              </div>
              <div className='border-b border-[#E7EAEE] mx-4' />

              {/* Body */}
              {selectedPeople.length === 0 ? (
                <div className='mx-4 h-[200px] flex items-center justify-center'>
                  <NoData type='report' classNameImage='w-[245px]' titleText={dataLang?.nodata || 'Chưa có dữ liệu'} />
                </div>
              ) : (
                <div className='mx-4 h-[200px] max-h-[200px] overflow-y-auto'>
                  <div className='divide-y divide-[#E7EAEE]'>
                    {selectedPeople.map(person => (
                      <div key={person.id} className='flex items-center justify-between py-4'>
                        <div className='flex items-center gap-3'>
                          <ResponsibleAvatar avatarUrl={person.avatarUrl} fullName={person.name} size={32} />
                          <span className='text-sm font-medium text-[#101828]'>{person.name}</span>
                        </div>
                        <button
                          type='button'
                          onClick={() => handleRemovePerson(person.id)}
                          className='inline-flex items-center justify-center p-2 rounded-full hover:bg-red-50 transition-colors'
                          title={dataLang?.delete || 'Xoá'}
                        >
                          <TrashIcon className='size-5 text-[#EE1E1E]' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className='flex items-center justify-end w-full pt-2'>
              <button
                type='submit'
                disabled={isLoading}
                className='flex items-center gap-4 bg-[#0375F3] text-white px-7 py-3 rounded-[8px] font-medium transition-colors hover:bg-[#0375F3]/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? (
                  <>
                    <LoadingButton hiddenTitle className='w-4 h-4 text-white' />
                    <span>{dataLang?.processing || 'Đang xử lý...'}</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className='size-4' />
                    <span>{dataLang?.branch_popup_save || 'Lưu'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </PopupCustom>

      <PopupConfim
        type='warning'
        nameModel='piecework_wage_group'
        isOpen={isConfirmBranchChangeOpen}
        title={dataLang?.piecework_wage_group_change_branch_title || 'Thay đổi chi nhánh?'}
        subtitle={dataLang?.piecework_wage_group_change_branch_subtitle || 'Danh sách nhân viên đã chọn có thể không thuộc chi nhánh mới. Bạn có muốn tiếp tục không?'}
        forceConfirm
        save={handleConfirmBranchChange}
        cancel={() => {
          setIsConfirmBranchChangeOpen(false);
          setPendingBranch(null);
        }}
        onClose={() => {
          setIsConfirmBranchChangeOpen(false);
          setPendingBranch(null);
        }}
      />
    </>
  );
};

export default PopupGroupPiecework;
