import InputCustom from '@/components/common/input/InputCustom';
import { CalendarIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import { AnimatePresence, motion } from 'framer-motion';
import { useGetQcErrorDetails } from '@/managers/api/qc/useGetQcErrorDetails';
import debounce from 'lodash/debounce';

const ProductRow = ({
  row,
  index,
  showExpiryColumns,
  showSerialColumns,
  formatNumber,
  handleQuantityChange,
  handleChange,
  handleRemove,
  dataProductExpiry,
  dataLang,
  itemsLength,
}) => {
  // State riêng cho mỗi row - khởi tạo từ row object nếu có
  const [errorTags, setErrorTags] = useState(() => row?.error_tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputWidth, setInputWidth] = useState(60);
  const [errorImages, setErrorImages] = useState(() => {
    // Khởi tạo từ row.error_images nếu có, hoặc tạo preview từ file nếu cần
    if (row?.error_images && Array.isArray(row.error_images)) {
      return row.error_images.map(img => {
        if (typeof img === 'string') {
          // Nếu là URL string
          return { preview: img, file: null };
        }
        return img;
      });
    }
    return [];
  });
  
  const [imageError, setImageError] = useState('');
  const isAddingTagRef = useRef(false);
  const fileInputRef = useRef(null);
  const measureRef = useRef(null);

  // Hook lấy danh sách lỗi QC theo sản phẩm/biến thể
  const { getQcErrorDetails, data: qcErrorDetailsData } = useGetQcErrorDetails({
    onSuccess: data => {
      console.log('QC error details response:', data);
    },
    onError: err => {
      console.error('QC error details error:', err);
    },
  });

  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => qcErrorDetailsData?.data || [], [qcErrorDetailsData]);

  const getQcErrorDetailsRef = useRef(getQcErrorDetails);

  useEffect(() => {
    getQcErrorDetailsRef.current = getQcErrorDetails;
  }, [getQcErrorDetails]);

  const debouncedGetQcErrorDetails = useMemo(
    () =>
      debounce(params => {
        getQcErrorDetailsRef.current?.(params);
      }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedGetQcErrorDetails.cancel();
      // Cleanup preview URLs khi unmount
      errorImages.forEach(img => {
        if (img?.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [debouncedGetQcErrorDetails]);

  // Ref để tránh vòng lặp khi sync
  const isInitialMount = useRef(true);
  const rowIdRef = useRef(row?.id);

  // Sync state với row object khi row mới được load (chỉ một lần khi mount hoặc khi row id thay đổi)
  useEffect(() => {
    const currentRowId = row?.id;
    // Chỉ sync khi row id thay đổi (row mới) hoặc lần đầu mount
    if (isInitialMount.current || rowIdRef.current !== currentRowId) {
      if (row?.error_tags && Array.isArray(row.error_tags)) {
        setErrorTags(row.error_tags);
      } else if (!row?.error_tags) {
        setErrorTags([]);
      }
      if (row?.error_images && Array.isArray(row.error_images)) {
        setErrorImages(
          row.error_images.map(img => {
            if (typeof img === 'string') {
              return { preview: img, file: null };
            }
            return img;
          })
        );
      } else if (!row?.error_images) {
        setErrorImages([]);
      }
      rowIdRef.current = currentRowId;
      isInitialMount.current = false;
    }
  }, [row?.id]); // Chỉ sync khi row id thay đổi

  // Cập nhật row object khi errorTags hoặc errorImages thay đổi từ user action
  useEffect(() => {
    // Bỏ qua lần đầu mount để tránh gọi handleChange không cần thiết
    if (isInitialMount.current) return;

    if (handleChange) {
      handleChange({
        table: 'product',
        type: 'error_tags',
        value: errorTags,
        row,
      });
    }
  }, [errorTags]);

  useEffect(() => {
    // Bỏ qua lần đầu mount để tránh gọi handleChange không cần thiết
    if (isInitialMount.current) return;

    if (handleChange) {
      handleChange({
        table: 'product',
        type: 'error_images',
        value: errorImages,
        row,
      });
    }
  }, [errorImages]);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && isInputFocused);
  }, [suggestions, isInputFocused]);

  useEffect(() => {
    if (measureRef.current) {
      const width = Math.max(60, measureRef.current.offsetWidth + 0);
      setInputWidth(width);
    }
  }, [newTagInput]);

  // Handlers riêng cho row này
  const handleAddTag = useCallback(() => {
    if (isAddingTagRef.current) return;
    if (newTagInput.trim()) {
      isAddingTagRef.current = true;
      setErrorTags(prev => [...prev, newTagInput.trim()]);
      setNewTagInput('');
      setInputWidth(60);
      setTimeout(() => {
        isAddingTagRef.current = false;
      }, 100);
    }
  }, [newTagInput]);

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        if (newTagInput.trim()) {
          handleAddTag();
        }
        if (e.key === 'Tab') {
          e.target.focus();
        }
        setNewTagInput('');
      }
    },
    [handleAddTag, newTagInput]
  );

  const handleRemoveTag = useCallback(tagIndex => {
    setErrorTags(prev => prev.filter((_, i) => i !== tagIndex));
  }, []);

  const handleImageUpload = useCallback(e => {
    const files = Array.from(e.target.files || []);
    const MAX_SIZE = 1 * 1024 * 1024; // 5MB
    let hasOversize = false;

    files.forEach(file => {
      if (file.size > MAX_SIZE) {
        hasOversize = true;
        return;
      }
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        setErrorImages(prev => [...prev, { file, preview }]);
      }
    });

    setImageError(hasOversize ? 'Kích thước ảnh không được vượt quá 1MB' : '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleRemoveImage = useCallback(imgIndex => {
    setErrorImages(prev => {
      const next = [...prev];
      const [removed] = next.splice(imgIndex, 1);
      if (removed?.preview && removed.preview.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  }, []);

  const handleSuggestionClick = useCallback(
    code => {
      if (code?.trim()) {
        setErrorTags(prev => [...prev, code.trim()]);
        setNewTagInput('');
        setShowSuggestions(false);
      }
    },
    []
  );

  return (
    <div className='grid grid-cols-25 items-center h-full' key={index}>
      <div className='col-span-1 py-2 px-1 flex justify-center items-center'>
        <p className='responsive-text-sm text-neutral-07 font-semibold'>{index + 1}</p>
      </div>
      <div className={`flex gap-2 p-2 ${showExpiryColumns || showSerialColumns ? 'col-span-4' : 'col-span-6'}`}>
        <Image
          src={row?.images ? row?.images : '/icon/noimagelogo.png'}
          width={100}
          height={100}
          alt={row?.images ? row?.images : '/icon/noimagelogo.png'}
          className='object-cover rounded-md min-w-10 min-h-10 w-10 h-10 max-w-10 max-h-10'
        />
        <div className='flex flex-col gap-1'>
          <p className='responsive-text-sm text-neutral-07 font-semibold'>{row?.item_name}</p>
          <p className='responsive-text-xs text-neutral-03 font-normal'>{row?.product_variation}</p>
          <p className='responsive-text-xs text-typo-blue-2 font-normal'>{row?.reference_no_detail}</p>
        </div>
      </div>

      <h3 className='col-span-2 p-2 responsive-text-sm text-neutral-07 font-semibold'>{row?.unit_name}</h3>
      <div className={`p-2 ${showExpiryColumns || showSerialColumns ? 'col-span-3' : 'col-span-4'}`}>
        <InputCustom
          state={row?.quantityEnterClient || 0}
          setState={value => handleQuantityChange(value, row, 'quantityEnterClient')}
          className={`${!row?.quantityEnterClient && !row?.quantityError ? '!border-red-500' : '!border-gray-200'} !w-full p-1`}
          classNameInput='w-full !responsive-text-sm'
          classNameButton='size-6 2xl:size-8'
          min={0}
          max={Infinity}
          disabled={false}
          isError={false}
          step={1}
          debounceTime={500}
        />
      </div>
      {showSerialColumns && (
        <Customscrollbar className={`col-span-3 py-2 ${itemsLength <= 1 ? 'max-h-[calc(80vh-136px)]' : 'max-h-60'}`}>
          {showSerialColumns ? (
            <div className='flex flex-col gap-1'>
              {[...Array(Math.ceil(Math.max(0, Number(row?.quantityEnterClient) || 0)))].map((_, sIndex) => {
                return (
                  <input
                    key={sIndex}
                    value={row.serial?.[sIndex]?.value || ''}
                    onChange={e => {
                      handleChange({
                        table: 'product',
                        type: 'serial',
                        value: e.target.value.trim(),
                        row,
                        index: sIndex,
                      });
                    }}
                    className={`border text-center py-1 px-1 w-full focus:outline-none rounded-md responsive-text-sm text-neutral-07 font-medium ${
                      row.serial?.[sIndex]?.isDuplicate ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                );
              })}
            </div>
          ) : null}
        </Customscrollbar>
      )}

      <div className={`p-2 ${showExpiryColumns || showSerialColumns ? 'col-span-3' : 'col-span-4'}`}>
        <InputCustom
          state={row?.quantityError || 0}
          setState={value => handleQuantityChange(value, row, 'quantityError')}
          className={`${!row?.quantityEnterClient && !row?.quantityError ? '!border-red-500' : '!border-gray-200'} !w-full p-1`}
          classNameInput='w-full !responsive-text-sm'
          classNameButton='size-6 2xl:size-8'
          min={0}
          max={Infinity}
          disabled={false}
          isError={false}
          step={1}
          debounceTime={500}
        />
      </div>
      {showSerialColumns && (
        <Customscrollbar className={`col-span-3 py-2 ${itemsLength <= 1 ? 'max-h-[calc(80vh-136px)]' : 'max-h-60'}`}>
          <div className='flex flex-col gap-1'>
            {showSerialColumns &&
              [...Array(Math.ceil(Math.max(0, Number(row?.quantityError) || 0)))].map((_, sIndex) => {
                return (
                  <input
                    key={sIndex}
                    value={row.serialError?.[sIndex]?.value || ''}
                    onChange={e => {
                      handleChange({
                        table: 'product',
                        type: 'serialError',
                        value: e.target.value.trim(),
                        row,
                        index: sIndex,
                      });
                    }}
                    className={`border text-center py-1 px-1 w-full focus:outline-none rounded-md responsive-text-sm text-neutral-07 font-medium ${
                      row.serialError?.[sIndex]?.isDuplicate ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                );
              })}
          </div>
        </Customscrollbar>
      )}
      {showExpiryColumns && (
        <>
          <div className='col-span-3'>
            <input
              value={row?.lot || ''}
              disabled={(dataProductExpiry?.is_enable == '1' && false) || (dataProductExpiry?.is_enable == '0' && true)}
              onChange={e => {
                handleChange({
                  table: 'product',
                  type: 'lot',
                  value: e.target.value,
                  row,
                });
              }}
              className='border text-center rounded-lg responsive-text-sm text-neutral-07 font-semibold py-2 px-1 w-full focus:outline-none border-gray-200'
            />
          </div>
          <div className='col-span-3 p-2 text-sm'>
            <div className='relative'>
              <DatePicker
                dateFormat='dd/MM/yyyy'
                placeholderText={dataLang?.warehouses_detail_date ?? 'warehouses_detail_date'}
                selected={row?.date}
                disabled={(dataProductExpiry?.is_enable == '1' && false) || (dataProductExpiry?.is_enable == '0' && true)}
                portalId='menu-time'
                onChange={e => {
                  handleChange({
                    table: 'product',
                    type: 'date',
                    value: e,
                    row,
                  });
                }}
                className='border-gray-200 bg-transparent disabled:bg-gray-100 relative z-1 placeholder:text-slate-300 w-full rounded-lg text-[#52575E] p-2 pl-6 border outline-none responsive-text-sm'
              />
              <CalendarIcon className='size-4 absolute left-1.5 -translate-y-1/2 top-1/2 opacity-60' />
            </div>
          </div>
        </>
      )}
      <h3
        className={`p-2 responsive-text-sm text-neutral-07 font-semibold text-center
          ${showExpiryColumns || showSerialColumns ? 'col-span-2' : 'col-span-3'}
          `}
      >
        {formatNumber(row?.quantity_enter)}
      </h3>
      <h3
        className={`p-2 responsive-text-sm text-neutral-07 font-semibold text-center
          ${showExpiryColumns || showSerialColumns ? 'col-span-2' : 'col-span-3'}
          `}
      >
        {formatNumber(row?.quantity_entered)}
      </h3>
      <div className='col-span-2 p-2 flex justify-center items-center'>
        <button
          onClick={() => handleRemove('product', row)}
          className='group hover:border-red-01 hover:bg-red-02 rounded-lg w-fit p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer'
        >
          <TrashIcon className='size-5 2xl:size-6 text-[#EE1E1E]' />
        </button>
      </div>

<div className=""></div>
      {/* Phần thông tin lỗi (Tag + Ảnh) cho từng dòng, chỉ hiển thị khi SL lỗi của dòng > 0 */}
      <div className='' style={{ gridColumn: 'span 24 / span 24' }}>
        <AnimatePresence>
          {Number(row?.quantityError || 0) > 0 && (
            <motion.div
              key={`row-error-${row?.id || index}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
              className=' mt-2 bg-gray-50 px-4 py-3 flex flex-col gap-3 w-full'
            >
              {/* Tags Section */}
              <div className='flex flex-col gap-2'>
                <div className='flex flex-wrap items-center gap-2'>
                  {errorTags.map((tag, tagIndex) => (
                    <span key={tagIndex} className='inline-flex items-center gap-3 px-2 py-1 leading-[20px] bg-blue-100 text-[#141522] rounded-lg text-xs font-medium'>
                      {tag}
                      <button type='button' onClick={() => handleRemoveTag(tagIndex)} className='hover:text-blue-900 focus:outline-none'>
                        <svg width='10' height='20' viewBox='0 0 7 7' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M6.79406 6.79379C6.68857 6.89928 6.54549 6.95854 6.39631 6.95854C6.24712 6.95854 6.10405 6.89928 5.99856 6.79379L3.47949 4.27472L0.960424 6.79379C0.854935 6.89928 0.711861 6.95854 0.562677 6.95854C0.413492 6.95854 0.270418 6.89928 0.164929 6.79379C0.05944 6.6883 0.000176842 6.54522 0.000177179 6.39604C0.000176842 6.24685 0.05944 6.10378 0.164929 5.99829L2.684 3.47922L0.164929 0.960156C0.05944 0.854667 0.000177137 0.711592 0.000177158 0.562408C0.00017685 0.413224 0.05944 0.27015 0.164929 0.164661C0.270418 0.0591715 0.413492 -9.17209e-05 0.562677 -9.17499e-05C0.711861 -9.1771e-05 0.854935 0.0591714 0.960424 0.164661L3.47949 2.68373L5.99856 0.164661C6.10405 0.0591714 6.24712 -9.1771e-05 6.39631 -9.17499e-05C6.54549 -9.17209e-05 6.68857 0.0591715 6.79406 0.164661C6.89954 0.27015 6.95881 0.413224 6.95881 0.562408C6.95881 0.711592 6.89954 0.854667 6.79406 0.960156L4.27499 3.47922L6.79406 5.99829C6.89954 6.10378 6.95881 6.24685 6.95881 6.39604C6.95881 6.54522 6.89954 6.6883 6.79406 6.79379Z'
                            fill='#003DA0'
                          />
                        </svg>
                      </button>
                    </span>
                  ))}

                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                        isInputFocused ? 'bg-white border border-[#92BFF7] text-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <div className='relative inline-flex items-center gap-1' style={{ width: `${inputWidth}px`, minWidth: '70px' }}>
                        {!isInputFocused && <PlusIcon className='size-3 flex-shrink-0' />}
                        <span ref={measureRef} className='absolute invisible whitespace-pre text-xs leading-[20px] px-0' style={{ font: 'inherit' }}>
                          {newTagInput || 'Nhập lỗi'}
                        </span>
                        <div className='relative flex-1'>
                          <input
                            type='text'
                            value={newTagInput}
                            onChange={e => {
                              const value = e.target.value;
                              setNewTagInput(value);
                              debouncedGetQcErrorDetails({
                                item_id: row?.item_id ?? row?.id ?? '',
                                item_variation_id: row?.item_variation_id ?? row?.item_variation_option_value_id ?? '',
                                search: value || '',
                              });
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => {
                              setIsInputFocused(false);
                            }}
                            placeholder='Nhập lỗi'
                            style={{ width: '100%' }}
                            className='leading-[20px] bg-transparent outline-none text-xs'
                          />
                          {isInputFocused && <div className='absolute -bottom-1.5 left-[125%] text-[10px] text-gray-400 truncate'>(Nhấn Enter để nhập tag)</div>}
                          {showSuggestions && (
                            <div className='absolute -left-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-[60px] overflow-auto min-w-[80px]'>
                              {suggestions.map(item => (
                                <button
                                  key={item.id}
                                  type='button'
                                  className='w-full text-left px-3 py-2 text-xs hover:bg-blue-50 truncate'
                                  onMouseDown={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const code = item.code || '';
                                    if (code.trim()) {
                                      handleSuggestionClick(code.trim());
                                    }
                                    setShowSuggestions(false);
                                  }}
                                >
                                  {item.code || ''}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className='flex flex-wrap items-center gap-2'>
                {errorImages.map((image, imgIndex) => (
                  <div key={imgIndex} className='relative w-[80px] h-[55px] rounded overflow-hidden'>
                    <Image src={image?.preview || '/icon/default/default.png'} alt={`Error ${imgIndex + 1}`} width={80} height={80} className='object-cover w-full h-full' />
                    <button
                      type='button'
                      onClick={() => handleRemoveImage(imgIndex)}
                      className='absolute top-0 right-0 bg-white text-white rounded-full p-1 hover:bg-gray-100'
                    >
                      <svg width='11' height='11' viewBox='0 0 7 7' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path
                          d='M6.79406 6.79379C6.68857 6.89928 6.54549 6.95854 6.39631 6.95854C6.24712 6.95854 6.10405 6.89928 5.99856 6.79379L3.47949 4.27472L0.960424 6.79379C0.854935 6.89928 0.711861 6.95854 0.562677 6.95854C0.413492 6.95854 0.270418 6.89928 0.164929 6.79379C0.05944 6.6883 0.000176842 6.54522 0.000177179 6.39604C0.000176842 6.24685 0.05944 6.10378 0.164929 5.99829L2.684 3.47922L0.164929 0.960156C0.05944 0.854667 0.000177137 0.711592 0.000177158 0.562408C0.00017685 0.413224 0.05944 0.27015 0.164929 0.164661C0.270418 0.0591715 0.413492 -9.17209e-05 0.562677 -9.17499e-05C0.711861 -9.1771e-05 0.854935 0.0591714 0.960424 0.164661L3.47949 2.68373L5.99856 0.164661C6.10405 0.0591714 6.24712 -9.1771e-05 6.39631 -9.17499e-05C6.54549 -9.17209e-05 6.68857 0.0591715 6.79406 0.164661C6.89954 0.27015 6.95881 0.413224 6.95881 0.562408C6.95881 0.711592 6.89954 0.854667 6.79406 0.960156L4.27499 3.47922L6.79406 5.99829C6.89954 6.10378 6.95881 6.24685 6.95881 6.39604C6.95881 6.54522 6.89954 6.6883 6.79406 6.79379Z'
                          fill='#444444'
                        />
                      </svg>
                    </button>
                  </div>
                ))}

                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className=' w-[55px]  h-[55px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors'
                >
                  <svg width='28' height='28' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M8.125 10.8333C8.125 10.336 8.32254 9.85906 8.67417 9.50743C9.02581 9.1558 9.50272 8.95825 10 8.95825C10.4973 8.95825 10.9742 9.1558 11.3258 9.50743C11.6775 9.85906 11.875 10.336 11.875 10.8333C11.875 11.3305 11.6775 11.8074 11.3258 12.1591C10.9742 12.5107 10.4973 12.7083 10 12.7083C9.50272 12.7083 9.02581 12.5107 8.67417 12.1591C8.32254 11.8074 8.125 11.3305 8.125 10.8333Z'
                      fill='#5D5D5D'
                    />
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M6.22817 6.36833C6.22796 6.02443 6.29553 5.68385 6.42704 5.36608C6.55854 5.04831 6.7514 4.75958 6.99458 4.5164C7.23776 4.27323 7.52649 4.08037 7.84426 3.94886C8.16203 3.81736 8.5026 3.74978 8.84651 3.75H11.1532C11.4971 3.74978 11.8377 3.81736 12.1554 3.94886C12.4732 4.08037 12.7619 4.27323 13.0051 4.5164C13.2483 4.75958 13.4411 5.04831 13.5726 5.36608C13.7042 5.68385 13.7717 6.02443 13.7715 6.36833C13.7717 6.37428 13.7739 6.37998 13.7779 6.38441C13.7819 6.38884 13.7873 6.39171 13.7932 6.3925L15.6515 6.5425C16.484 6.61083 17.1682 7.22583 17.324 8.04667C17.7197 10.1405 17.749 12.287 17.4107 14.3908L17.3298 14.8942C17.2557 15.3553 17.029 15.7783 16.6861 16.0954C16.3431 16.4125 15.9037 16.6054 15.4382 16.6433L13.819 16.7742C11.2771 16.9807 8.7226 16.9807 6.18067 16.7742L4.56151 16.6433C4.09584 16.6054 3.65636 16.4123 3.3134 16.0951C2.97045 15.7778 2.74384 15.3546 2.66984 14.8933L2.58901 14.3908C2.24984 12.2867 2.27984 10.1408 2.67567 8.04667C2.75136 7.64751 2.956 7.28425 3.25814 7.01266C3.56029 6.74108 3.94324 6.57619 4.34817 6.54333L6.20651 6.3925C6.2124 6.39171 6.21782 6.38884 6.2218 6.38441C6.22577 6.37998 6.22803 6.37428 6.22817 6.36833ZM9.99984 7.70833C9.17104 7.70833 8.37618 8.03757 7.79013 8.62362C7.20408 9.20968 6.87484 10.0045 6.87484 10.8333C6.87484 11.6621 7.20408 12.457 7.79013 13.043C8.37618 13.6291 9.17104 13.9583 9.99984 13.9583C10.8286 13.9583 11.6235 13.6291 12.2095 13.043C12.7956 12.457 13.1248 11.6621 13.1248 10.8333C13.1248 10.0045 12.7956 9.20968 12.2095 8.62362C11.6235 8.03757 10.8286 7.70833 9.99984 7.70833Z'
                      fill='#5D5D5D'
                    />
                  </svg>

                  <input ref={fileInputRef} type='file' accept='image/*' multiple onChange={handleImageUpload} className='hidden' />
                </button>
              </div>
              {imageError && <p className='text-xs text-red-500 mb-2 -mt-2'>{imageError}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductRow;

