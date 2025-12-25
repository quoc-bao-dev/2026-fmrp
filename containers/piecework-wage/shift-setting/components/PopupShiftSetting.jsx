import { CheckIcon } from '@/components/icons';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import CustomInput from '@/components/UI/common/input/CustomInput';
import CustomSelect from '@/components/UI/common/select/CustomSelect';
import TimeSelect from '@/components/UI/common/TimeSelect';
import LoadingButton from '@/components/UI/loading/loadingButton';
import PopupCustom from '@/components/UI/popup';
import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import { useBranchList } from '@/hooks/common/useBranch';
import useToast from '@/hooks/useToast';
import { Lexend_Deca } from '@next/font/google';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const daysOfWeek = [
  { id: 1, label: 'Thứ hai', value: 'monday' },
  { id: 2, label: 'Thứ ba', value: 'tuesday' },
  { id: 3, label: 'Thứ tư', value: 'wednesday' },
  { id: 4, label: 'Thứ năm', value: 'thursday' },
  { id: 5, label: 'Thứ sáu', value: 'friday' },
  { id: 6, label: 'Thứ bảy', value: 'saturday' },
  { id: 7, label: 'Chủ nhật', value: 'sunday' },
];

const PopupShiftSetting = ({ dataLang, className, onRefresh, trigger, buttonClassName, editData = null, listBranch = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const isEditMode = !!editData;
  const isShow = useToast();

  // Lấy danh sách chi nhánh nếu không truyền vào
  const { data: branchList = [] } = useBranchList();
  const branchOptions = listBranch.length > 0 ? listBranch : branchList;

  // Lấy auth state để tự động bắt branch
  const authState = useSelector(state => state.auth);

  const form = useForm({
    defaultValues: {
      shiftName: '',
      startHour: '08',
      startMinute: '00',
      endHour: '17',
      endMinute: '30',
      branch: null,
    },
  });

  // Điền dữ liệu vào form khi ở mode edit hoặc set branch mặc định khi create
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && editData) {
      // Mode edit: Điền dữ liệu từ editData
      form.setValue('shiftName', editData.name || '');

      // Parse timeFrame (ví dụ: "7:00h - 11:00")
      if (editData.timeFrame) {
        const [startTime, endTime] = editData.timeFrame.split(' - ');
        if (startTime) {
          const startMatch = startTime.match(/(\d+):(\d+)/);
          if (startMatch) {
            form.setValue('startHour', startMatch[1].padStart(2, '0'));
            form.setValue('startMinute', startMatch[2].padStart(2, '0'));
          }
        }
        if (endTime) {
          const endMatch = endTime.match(/(\d+):(\d+)/);
          if (endMatch) {
            form.setValue('endHour', endMatch[1].padStart(2, '0'));
            form.setValue('endMinute', endMatch[2].padStart(2, '0'));
          }
        }
      }

      // Điền branch
      if (editData.branch_id && branchOptions?.length > 0) {
        const branchOption = branchOptions.find(branch => branch.value === editData.branch_id || branch.value === String(editData.branch_id));
        if (branchOption) {
          form.setValue('branch', branchOption);
        }
      }

      // Điền days of week
      if (editData.daysOfWeek && Array.isArray(editData.daysOfWeek)) {
        // Map từ label sang value (ví dụ: "Thứ 2" -> "monday")
        const mappedDays = editData.daysOfWeek
          .map(dayLabel => {
            const day = daysOfWeek.find(d => d.label === dayLabel);
            return day?.value;
          })
          .filter(Boolean);
        setSelectedDays(mappedDays);
      }
    } else {
      // Mode create: Tự động set branch từ auth khi popup mở
      const currentBranch = form.getValues('branch');
      if (currentBranch) return;

      let defaultBranchOption = null;

      if (authState?.branch_id && branchOptions?.length > 0) {
        defaultBranchOption = branchOptions.find(branch => branch.value === authState.branch_id || branch.value === String(authState.branch_id));
      } else if (authState?.branch?.length > 0 && branchOptions?.length > 0) {
        const authBranchId = authState.branch[0]?.id;
        if (authBranchId) {
          defaultBranchOption = branchOptions.find(branch => branch.value === authBranchId || branch.value === String(authBranchId));
        }
      }

      if (defaultBranchOption) {
        form.setValue('branch', defaultBranchOption);
      }
    }
  }, [isOpen, isEditMode, editData, authState, branchOptions, form]);

  // Reset form when popup closes
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        shiftName: '',
        startHour: '08',
        startMinute: '00',
        endHour: '17',
        endMinute: '30',
        branch: null,
      });
      setSelectedDays([]);
    }
  }, [isOpen, form]);

  const handleToggleDay = dayValue => {
    setSelectedDays(prev => {
      if (prev.includes(dayValue)) {
        return prev.filter(d => d !== dayValue);
      } else {
        return [...prev, dayValue];
      }
    });
  };

  const handleSubmit = form.handleSubmit(data => {
    // Validate selected days
    if (selectedDays.length === 0) {
      isShow('error', dataLang?.shift_days_required || 'Vui lòng chọn ít nhất một ngày trong tuần');
      return;
    }

    // Format time
    const startTime = `${data.startHour}:${data.startMinute}`;
    const endTime = `${data.endHour}:${data.endMinute}`;
    const timeFrame = `${startTime}h - ${endTime}`;

    // Map selected days back to labels
    const daysLabels = selectedDays
      .map(dayValue => {
        const day = daysOfWeek.find(d => d.value === dayValue);
        return day?.label;
      })
      .filter(Boolean);

    // Create payload
    const payload = {
      name: data.shiftName,
      timeFrame: timeFrame,
      daysOfWeek: daysLabels,
      branch_id: data.branch?.value,
    };

    // TODO: Gọi API create/update ở đây
    console.log('Payload:', payload);

    // Mock success
    isShow('success', isEditMode ? dataLang?.updated_successfully || 'Cập nhật thành công' : dataLang?.created_successfully || 'Tạo thành công');
    setIsOpen(false);
    if (onRefresh) onRefresh();
  });

  const title = isEditMode ? dataLang?.shift_edit || 'Sửa ca làm' : dataLang?.shift_create || 'Tạo Ca Làm';
  const isLoading = false; // TODO: Set từ API call

  return (
    <PopupCustom
      title={''}
      button={
        trigger ? (
          trigger
        ) : (
          <button type='button' className='flex flex-row justify-center items-center gap-x-1 responsive-text-sm text-sm font-normal'>
            {dataLang?.branch_popup_create_new || '+ Tạo mới'}
          </button>
        )
      }
      onClickOpen={() => setIsOpen(true)}
      open={isOpen}
      onClose={() => setIsOpen(false)}
      type='popupGroupPiecework'
      classNameBtn={buttonClassName || className}
      classNameModeltime={`max-w-[800px] !w-[800px] p-8 rounded-[16px]`}
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
        <form onSubmit={handleSubmit} className='flex flex-col gap-[40px] pt-5'>
          {/* Tên ca làm */}
          <div className='flex  gap-2 w-full'>
            <label className='w-[150px] text-[14px] leading-5 font-semibold text-[#141522] flex items-center gap-1'>
              {dataLang?.shift_name || 'Tên ca làm'}
              <span className='text-[#EE1E1E]'>*</span>
            </label>
            <Controller
              name='shiftName'
              control={form.control}
              rules={{
                required: {
                  value: true,
                  message: dataLang?.shift_name_required || 'Vui lòng nhập tên ca làm',
                },
              }}
              render={({ field, fieldState }) => (
                <div className='flex flex-col gap-1 flex-1'>
                  <CustomInput type='text' {...field} placeholder={dataLang?.shift_name_placeholder || 'Ví dụ: Ca hành chính'} error={fieldState.error} />
                  {fieldState.error && <span className='text-xs text-[#EE1E1E]'>{fieldState.error.message}</span>}
                </div>
              )}
            />
          </div>

          {/* Bắt đầu và Kết thúc */}
          <div className='flex gap-2 w-full items-center'>
            {/* Bắt đầu */}
            <div className='flex flex-col gap-2 w-[150px]'>
              <label className='text-[14px] leading-5 font-semibold text-[#141522] flex items-center gap-1'>
                {dataLang?.shift_start || 'Bắt đầu'}
                <span className='text-[#EE1E1E]'>*</span>
              </label>
            </div>

            <div className='flex-1 flex gap-[13px]'>
              <div className='flex items-center gap-[13px]'>
                <Controller
                  name='startHour'
                  control={form.control}
                  rules={{
                    required: {
                      value: true,
                      message: dataLang?.shift_start_required || 'Vui lòng chọn giờ bắt đầu',
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TimeSelect value={field.value} onChange={field.onChange} type='hour' placeholder='08' error={fieldState.error} label={dataLang?.hour || 'giờ'} className='z-[999]' />
                  )}
                />
                <span className='text-lg font-semibold text-[#8EC5FF]'>:</span>
                <Controller
                  name='startMinute'
                  control={form.control}
                  rules={{
                    required: {
                      value: true,
                      message: dataLang?.shift_start_minute_required || 'Vui lòng chọn phút bắt đầu',
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TimeSelect value={field.value} onChange={field.onChange} type='minute' placeholder='00' error={fieldState.error} label={dataLang?.minute || 'phút'} className='z-[999]' />
                  )}
                />
              </div>
              <div className='flex gap-[13px] items-center'>
                <label className='text-[14px] leading-5 font-semibold- text-[#141522]'>{dataLang?.shift_end || 'Kết thúc'}</label>
                <div className='flex items-center gap-2'>
                  <Controller
                    name='endHour'
                    control={form.control}
                    render={({ field }) => <TimeSelect value={field.value} onChange={field.onChange} type='hour' placeholder='17' label={dataLang?.hour || 'giờ'} className='z-[999]' />}
                  />
                  <span className='text-lg font-semibold text-[#8EC5FF]'>:</span>
                  <Controller
                    name='endMinute'
                    control={form.control}
                    render={({ field }) => <TimeSelect value={field.value} onChange={field.onChange} type='minute' placeholder='30' label={dataLang?.minute || 'phút'} className='z-[999]' />}
                  />
                </div>
              </div>
            </div>
            {/* Kết thúc */}
          </div>

          {/* Chi nhánh */}
          <div className='flex gap-2'>
            <label className='w-[150px] text-[14px] leading-5 font-semibold text-[#141522] flex items-center gap-1'>
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
                  <CustomSelect
                    options={[...branchOptions]}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={dataLang?.price_quote_branch_placeholder || 'Chọn Chi nhánh'}
                    isClearable={true}
                    error={fieldState.error}
                  />
                  {fieldState.error && <span className='text-xs text-[#EE1E1E]'>{fieldState.error.message}</span>}
                </div>
              )}
            />
          </div>

          {/* Lặp lại hằng tuần */}
          <div className='flex flex-col gap-2'>
            <label className='text-[14px] leading-5 font-semibold text-[#141522]'>{dataLang?.shift_repeat_weekly || 'Lặp lại hằng tuần'}</label>
            <div className='grid grid-cols-7 gap-2 pt-2'>
              {daysOfWeek.map(day => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <CheckboxDefault
                    key={day.id}
                    label={day.label}
                    checked={isSelected}
                    onChange={checked => {
                      // Sử dụng logic tương tự handleToggleDay
                      if (checked && !isSelected) {
                        setSelectedDays(prev => [...prev, day.value]);
                      } else if (!checked && isSelected) {
                        setSelectedDays(prev => prev.filter(d => d !== day.value));
                      }
                    }}
                    className='flex items-center py-2'
                  />
                );
              })}
            </div>
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
                  <span>{'Lưu'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PopupCustom>
  );
};

export default PopupShiftSetting;
