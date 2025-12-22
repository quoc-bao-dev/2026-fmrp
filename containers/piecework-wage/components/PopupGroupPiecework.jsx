import { PlusIcon, UserPlusIcon, CheckIcon, TrashIcon } from '@/components/icons';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import PopupCustom from '@/components/UI/popup';
import NoData from '@/components/UI/noData/nodata';
import ResponsiblePersonComboBox from '@/components/UI/popup/ResponsiblePersonComboBox';
import ResponsibleAvatar from '@/components/UI/common/user/ResponsibleAvatar';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import { Lexend_Deca } from '@next/font/google';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const PopupGroupPiecework = ({ dataLang, className, onRefresh, trigger, buttonClassName, listBranch = [], defaultBranch = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openCombo, setOpenCombo] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const mockStaffs = [
    { id: 1, name: 'Nguyễn Văn A', avatarUrl: null },
    { id: 2, name: 'Trần Thị B', avatarUrl: null },
    { id: 3, name: 'Lê Văn C', avatarUrl: null },
    { id: 4, name: 'Phạm Thị D', avatarUrl: null },
    { id: 5, name: 'Vũ Văn E', avatarUrl: null },
    { id: 6, name: 'Hoàng Thị F', avatarUrl: null },
  ];

  const form = useForm({
    defaultValues: {
      groupName: '',
      branch: defaultBranch,
    },
  });

  const title = dataLang?.piecework_wage_group_create || 'Tạo tổ/ nhóm';

  const handleRemovePerson = id => {
    setSelectedPeople(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = form.handleSubmit((data) => {
    // TODO: call API tạo tổ/nhóm với data.groupName và data.branch
    console.log('Form data:', data);
    if (onRefresh) onRefresh();
    setIsOpen(false);
  });

  // Set default branch when popup opens for creating new
  useEffect(() => {
    if (isOpen && defaultBranch) {
      form.setValue('branch', defaultBranch);
    }
  }, [isOpen, defaultBranch, form]);

  // Reset form when popup closes
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        groupName: '',
        branch: defaultBranch,
      });
      setSelectedPeople([]);
    }
  }, [isOpen, defaultBranch, form]);

  return (
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
          {/* Tên tổ/nhóm và Chi nhánh */}
          <div className='flex flex-col gap-4'>
            <div className='flex items-start gap-4'>
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
                      <input
                        type='text'
                        {...field}
                        placeholder={dataLang?.piecework_wage_group_name_placeholder || 'Nhập tên tổ/ nhóm'}
                        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#141522] outline-none hover:border-[#003DA0] focus:shadow-[0_0_0_1px_#003DA0] ${
                          fieldState.error
                            ? 'border-[#EE1E1E] focus:border-[#EE1E1E]'
                            : 'border-[#D0D5DD] focus:border-[#003DA0]'
                        }`}
                      />
                      {fieldState.error && (
                        <span className='text-xs text-[#EE1E1E]'>{fieldState.error.message}</span>
                      )}
                    </div>
                  )}
                />
              </div>
              {/* Chi nhánh */}
              <div className='flex flex-col gap-2 flex-1'>
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
                        options={[
                          {
                            value: "",
                            label: dataLang?.price_quote_branch || "Chi nhánh",
                            isDisabled: true,
                          },
                          ...listBranch,
                        ]}
                        {...field}
                        className="!rounded-lg"
                        onChange={(e) => field.onChange(e)}
                        placeholder={dataLang?.price_quote_branch || "Chọn chi nhánh"}
                        isClearable={true}
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderRadius: '8px',
                            borderColor: fieldState.error
                              ? '#EE1E1E'
                              : state.isFocused
                              ? '#003DA0'
                              : '#D0D5DD',
                            boxShadow: fieldState.error
                              ? 'none'
                              : state.isFocused
                              ? '0 0 0 1px #003DA0'
                              : 'none',
                            '&:hover': {
                              borderColor: fieldState.error ? '#EE1E1E' : '#003DA0',
                            },
                          }),
                        }}
                      />
                      {fieldState.error && (
                        <span className='text-xs text-[#EE1E1E]'>{fieldState.error.message}</span>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Thêm nhân viên */}
          <div className='flex flex-col gap-3'>
            <ResponsiblePersonComboBox
              open={openCombo}
              onClose={() => setOpenCombo(false)}
              onConfirm={newSelected => {
                setSelectedPeople(newSelected || []);
                setOpenCombo(false);
              }}
              selected={selectedPeople}
              data={mockStaffs}
              hideSelected={false}
            >
            <button
              type='button'
                onClick={() => setOpenCombo(true)}
                className='inline-flex items-center gap-2 px-3 py-3 rounded-lg bg-[#E2EFFF] text-[#25387A] text-sm font-medium hover:bg-[#D4E4FF] hover:shadow-sm transition-colors w-fit'
            >
              <UserPlusIcon className='size-5 text-[#25387A]' />
              <span>{dataLang?.piecework_wage_group_add_staff || 'Thêm nhân viên'}</span>
            </button>
            </ResponsiblePersonComboBox>

            {/* Table header */}
            <div className='flex items-center px-4 py-3 mt-4'>
              <div className='flex-1'>
                <span className='text-[14px] font-semibold leading-[20px] text-[#9295A4]'>
                  {dataLang?.piecework_wage_group_employees || 'Nhân viên'}
                </span>
              </div>
              <div className='flex-1 text-end'>
                <span className='text-[14px] font-semibold leading-[20px] text-[#9295A4]'>
                  {dataLang?.branch_popup_properties || 'Tác vụ'}
                </span>
              </div>
            </div>
            <div className='border-b border-[#E7EAEE] mx-4' />

            {/* Body */}
            {selectedPeople.length === 0 ? (
              <div className='mx-4 h-[240px] flex items-center justify-center'>
                <NoData type='report' classNameImage='w-[245px]' titleText={dataLang?.nodata || 'Chưa có dữ liệu'} />
              </div>
            ) : (
              <div className='mx-4 h-[240px] max-h-[240px] overflow-y-auto'>
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
          <div className='flex items-center justify-center pt-2'>
            <button
              type='submit'
              className='flex items-center gap-4 bg-[#0375F3] text-white px-7 py-3 rounded-[8px] font-medium transition-colors hover:bg-[#0375F3]/90 cursor-pointer'
            >
              <CheckIcon className='size-4' />
              <span>{dataLang?.branch_popup_save || 'Lưu'}</span>
            </button>
          </div>
        </form>
      </div>
    </PopupCustom>
  );
};

export default PopupGroupPiecework;
