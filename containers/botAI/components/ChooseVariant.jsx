/* eslint-disable react/prop-types */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { _ServerInstance as axiosCustom } from '@/services/axios';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { useHandleChatbotResponse } from '@/utils/helpers/handleChatbotResponse';

const mapVariantGroupsFromResponse = response => {
  if (!response) return [];

  const fromEvent = Array.isArray(response.options) ? response.options : [];
  const fromData = Array.isArray(response.data?.options) ? response.data.options : [];
  const fromArray = Array.isArray(response.data_array?.[0]?.options) ? response.data_array[0].options : [];

  const groups = fromEvent.length ? fromEvent : fromData.length ? fromData : fromArray;

  return Array.isArray(groups) ? groups : [];
};

const buildSelectOptions = groups =>
  groups.map(group => ({
    value: group.id,
    label: group.name,
  }));

const findGroupById = (groups, id) => {
  if (!id) return null;
  return groups.find(g => `${g.id}` === `${id}`);
};

const ChooseVariant = ({ response, disabled = false }) => {
  const { nextWait, dataPost } = useSelector(state => state.stateBoxChatAi);
  const variantGroups = useMemo(() => mapVariantGroupsFromResponse(response), [response]);

  const [variantMain, setVariantMain] = useState(null);
  const [variantSub, setVariantSub] = useState(null);
  const [selectedMainOptions, setSelectedMainOptions] = useState([]);
  const [selectedSubOptions, setSelectedSubOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasAutoSelected = useRef(false);

  const handleChatbotResponse = useHandleChatbotResponse();

  const selectOptions = useMemo(() => buildSelectOptions(variantGroups), [variantGroups]);
  const subSelectOptions = useMemo(() => selectOptions.filter(option => `${option.value}` !== `${variantMain}`), [selectOptions, variantMain]);

  const mainGroup = useMemo(() => findGroupById(variantGroups, variantMain), [variantGroups, variantMain]);
  const subGroup = useMemo(() => findGroupById(variantGroups, variantSub), [variantGroups, variantSub]);

  // Đếm số lượng variant groups có options để quyết định có hiện Sub variant hay không
  const groupsWithOptionsCount = useMemo(() => {
    return variantGroups.filter(group => group.options && group.options.length > 0).length;
  }, [variantGroups]);

  const eventShow = response?.event_show ?? response?.data?.event_show;

  /**
   * Tự động chọn variant chỉ 1 lần khi component mount lần đầu (khi có dữ liệu):
   * - Nếu có trên 2 biến thể (có options) → không tự động chọn
   * - Nếu có 2 hoặc 1 biến thể (có options) → mới tự động chọn
   * - Nếu có 1 biến thể → chỉ active biến thể chính, không hiện biến thể phụ
   * - Nếu có 2 biến thể → active cả 2 (variant đầu tiên → main, variant thứ 2 → sub)
   * Sau đó không tự động active nữa, để user tự chọn
   */
  useEffect(() => {
    // Chỉ chạy 1 lần khi có dữ liệu và chưa auto-select
    if (hasAutoSelected.current || !variantGroups.length) return;

    // Lọc các variant groups có options (length > 0)
    const groupsWithOptions = variantGroups.filter(group => group.options && group.options.length > 0);

    // Nếu không có variant nào có options, không auto-select
    if (groupsWithOptions.length === 0) {
      hasAutoSelected.current = true;
      return;
    }

    // Nếu có trên 2 biến thể → không tự động chọn
    if (groupsWithOptions.length > 2) {
      hasAutoSelected.current = true;
      return;
    }

    // Nếu có 1 biến thể → chỉ active biến thể chính
    if (groupsWithOptions.length === 1) {
      setVariantMain(groupsWithOptions[0].id);
      hasAutoSelected.current = true;
      return;
    }

    // Nếu có 2 biến thể → active cả 2
    // Variant đầu tiên → biến thể chính
    // Variant thứ 2 → biến thể phụ
    if (groupsWithOptions.length === 2) {
      setVariantMain(groupsWithOptions[0].id);
      setVariantSub(groupsWithOptions[1].id);
      hasAutoSelected.current = true;
      return;
    }
  }, [variantGroups]);

  if (eventShow !== 'choose_variant' || !variantGroups.length) {
    return null;
  }

  const handleChangeMainGroup = option => {
    const value = option?.value ?? null;
    setVariantMain(value);
    setSelectedMainOptions([]);
    // Nếu clear variant main (value = null) hoặc chọn variant trùng với variant sub
    if (!value || (value && `${value}` === `${variantSub}`)) {
      setVariantSub(null);
      setSelectedSubOptions([]);
    }
  };

  const handleChangeSubGroup = option => {
    const value = option?.value ?? null;
    setVariantSub(value);
    setSelectedSubOptions([]);
  };

  const toggleOption = (type, option) => {
    if (disabled) return;

    if (type === 'main') {
      setSelectedMainOptions(prev => {
        const exists = prev.some(item => `${item.id}` === `${option.id}`);
        if (exists) {
          return prev.filter(item => `${item.id}` !== `${option.id}`);
        }
        return [...prev, option];
      });
    } else {
      setSelectedSubOptions(prev => {
        const exists = prev.some(item => `${item.id}` === `${option.id}`);
        if (exists) {
          return prev.filter(item => `${item.id}` !== `${option.id}`);
        }
        return [...prev, option];
      });
    }
  };

  const handleSelectAll = type => {
    if (disabled) return;

    if (type === 'main' && mainGroup?.options?.length) {
      setSelectedMainOptions(mainGroup.options);
    }
    if (type === 'sub' && subGroup?.options?.length) {
      setSelectedSubOptions(subGroup.options);
    }
  };

  const isChecked = (type, option) => {
    const list = type === 'main' ? selectedMainOptions : selectedSubOptions;
    return list.some(item => `${item.id}` === `${option.id}`);
  };

  const canSubmit = variantMain && selectedMainOptions.length > 0;

  const sendVariantRequest = async () => {
    if (!nextWait) {
      // eslint-disable-next-line no-console
      console.error('[ChooseVariant] nextWait is required');
      return null;
    }

    // Tạo FormData
    const formData = new FormData();

    // Thêm các field từ data_post (spread)
    if (dataPost && typeof dataPost === 'object') {
      Object.keys(dataPost).forEach(key => {
        formData.append(key, dataPost[key]);
      });
    }

    // Thêm variation_main (ID của variant group chính)
    formData.append('variation_main', variantMain);

    // Thêm variation_sub chỉ nếu có giá trị
    if (variantSub) {
      formData.append('variation_sub', variantSub);
    }

    // Thêm variation[0][option_id][j] cho variant main (index 0)
    if (selectedMainOptions.length > 0) {
      selectedMainOptions.forEach((option, index) => {
        formData.append(`variation[0][option_id][${index}]`, option.id);
      });
    }

    // Thêm variation[1][option_id][j] cho variant sub (index 1) nếu có
    if (variantSub && selectedSubOptions.length > 0) {
      selectedSubOptions.forEach((option, index) => {
        formData.append(`variation[1][option_id][${index}]`, option.id);
      });
    }

    try {
      // Gửi POST request
      const res = await axiosCustom('POST', nextWait, formData);

      // Log response
      // eslint-disable-next-line no-console
      console.log('[ChooseVariant] Response:', res.data);
      // eslint-disable-next-line no-console
      console.log('[ChooseVariant] Response status:', res.status);

      handleChatbotResponse({ response: res.data });

      return res.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[ChooseVariant] Error:', error);
      if (error.response) {
        // eslint-disable-next-line no-console
        console.error('[ChooseVariant] Error response:', error.response.data);
        // eslint-disable-next-line no-console
        console.error('[ChooseVariant] Error status:', error.response.status);
      }
      throw error;
    }
  };

  const handleConfirm = async () => {
    if (!canSubmit || isSubmitting || !nextWait) return;

    setIsSubmitting(true);
    try {
      await sendVariantRequest();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }} className='mt-4 w-full min-w-[550px]'>
      <div className={`flex flex-col gap-4 w-full bg-white rounded-lg p-4 min-h-[400px]`}>
        <div className={`grid grid-cols-1 gap-4 ${groupsWithOptionsCount >= 2 ? 'md:grid-cols-2' : ''} w-full flex-1 items-stretch`}>
          {/* Main variant */}
          <div className='flex flex-col space-y-3 h-full'>
            <div className='space-y-1'>
              <label className='text-sm font-medium text-[#344054]'>Biến thể chính</label>
              <Select
                options={selectOptions}
                value={
                  variantMain
                    ? {
                        value: variantMain,
                        label: selectOptions.find(e => `${e.value}` === `${variantMain}`)?.label,
                      }
                    : null
                }
                onChange={handleChangeMainGroup}
                isClearable
                isDisabled={disabled}
                placeholder='Chọn biến thể chính'
                noOptionsMessage={() => 'Không có dữ liệu'}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                className='placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border'
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary25: '#EBF5FF',
                    primary50: '#92BFF7',
                    primary: '#0F4F9E',
                  },
                })}
                styles={{
                  placeholder: base => ({
                    ...base,
                    color: '#cbd5e1',
                  }),
                  menuPortal: base => ({
                    ...base,
                    zIndex: 9999,
                    position: 'absolute',
                  }),
                }}
              />
            </div>

            <div className='flex items-center justify-between'>
              <h5 className='text-sm text-slate-400'>Tùy chọn biến thể</h5>
              {mainGroup?.options?.length > 0 && (
                <button type='button' onClick={() => handleSelectAll('main')} className='text-sm font-medium text-primary disabled:opacity-50' disabled={disabled}>
                  Chọn tất cả
                </button>
              )}
            </div>

            <Customscrollbar className='flex-1 min-h-0 w-full'>
              <div className='flex flex-col'>
                {mainGroup?.options?.map(option => (
                  <div key={option.id?.toString() ?? option.name} className='flex items-center'>
                    <label
                      className={`relative flex items-center p-2 rounded-full ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      htmlFor={`main-${option.id}`}
                      data-ripple-dark='true'
                    >
                      <input
                        type='checkbox'
                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border transition-all before:absolute before:top-2/4 before:left-2/4 before:block  before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 hover:before:opacity-10 disabled:cursor-not-allowed disabled:opacity-50"
                        id={`main-${option.id}`}
                        value={option.name}
                        checked={isChecked('main', option)}
                        onChange={() => toggleOption('main', option)}
                        disabled={disabled}
                      />
                      <div className='pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-3.5 w-3.5' viewBox='0 0 20 20' fill='currentColor' stroke='currentColor' strokeWidth='1'>
                          <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd'></path>
                        </svg>
                      </div>
                    </label>
                    <label htmlFor={`main-${option.id}`} className={`text-sm font-normal text-[#344054] ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                      {option.name}
                    </label>
                  </div>
                ))}
              </div>
            </Customscrollbar>
          </div>

          {/* Sub variant - chỉ hiện khi có >= 2 biến thể có options */}
          {groupsWithOptionsCount >= 2 && (
            <div className='flex flex-col space-y-3 h-full'>
              <div className='space-y-1'>
                <label className='text-sm font-medium text-[#344054]'>Biến thể phụ</label>
                <Select
                  options={subSelectOptions}
                  value={
                    variantSub
                      ? {
                          value: variantSub,
                          label: selectOptions.find(e => `${e.value}` === `${variantSub}`)?.label,
                        }
                      : null
                  }
                  onChange={handleChangeSubGroup}
                  isClearable
                  isDisabled={disabled}
                  placeholder='Chọn biến thể phụ'
                  noOptionsMessage={() => 'Không có dữ liệu'}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                  className='placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border'
                  theme={theme => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary25: '#EBF5FF',
                      primary50: '#92BFF7',
                      primary: '#0F4F9E',
                    },
                  })}
                  styles={{
                    placeholder: base => ({
                      ...base,
                      color: '#cbd5e1',
                    }),
                    menuPortal: base => ({
                      ...base,
                      zIndex: 9999,
                      position: 'absolute',
                    }),
                  }}
                />
              </div>

              <div className='flex items-center justify-between'>
                <h5 className='text-sm text-slate-400'>Tùy chọn biến thể</h5>
                {subGroup?.options?.length > 0 && (
                  <button type='button' onClick={() => handleSelectAll('sub')} className='text-sm font-medium text-primary disabled:opacity-50' disabled={disabled}>
                    Chọn tất cả
                  </button>
                )}
              </div>

              <Customscrollbar className='flex-1 min-h-0 w-full'>
                <div className='flex flex-col space-y-0.5'>
                  {subGroup?.options?.map(option => (
                    <div key={option.id?.toString() ?? option.name} className='flex items-center'>
                      <label
                        className={`relative flex items-center p-2 rounded-full ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        htmlFor={`sub-${option.id}`}
                        data-ripple-dark='true'
                      >
                        <input
                          type='checkbox'
                          className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 hover:before:opacity-10 disabled:cursor-not-allowed disabled:opacity-50"
                          id={`sub-${option.id}`}
                          value={option.name}
                          checked={isChecked('sub', option)}
                          onChange={() => toggleOption('sub', option)}
                          disabled={disabled}
                        />
                        <div className='pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100'>
                          <svg xmlns='http://www.w3.org/2000/svg' className='h-3.5 w-3.5' viewBox='0 0 20 20' fill='currentColor' stroke='currentColor' strokeWidth='1'>
                            <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd'></path>
                          </svg>
                        </div>
                      </label>
                      <label htmlFor={`sub-${option.id}`} className={`text-sm font-normal text-[#344054] ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                        {option.name}
                      </label>
                    </div>
                  ))}
                </div>
              </Customscrollbar>
            </div>
          )}
        </div>
        <div className='w-full mt-auto'>
          {!canSubmit && <p className='mb-2 text-xs text-[#0F4F9E]/80 italic'>Vui lòng chọn biến thể chính trước khi tiếp tục.</p>}
          <button
            type='button'
            onClick={handleConfirm}
            disabled={!canSubmit || disabled || isSubmitting}
            className='w-full px-5 py-2 rounded-lg font-semibold text-white bg-[#0F4F9E] hover:bg-[#0d4284] transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChooseVariant;
