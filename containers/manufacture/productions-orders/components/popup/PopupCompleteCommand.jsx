import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import Loading from '@/components/common/loading/loading/LoadingComponent';
import { MagnifyingGlassIcon, PlusIcon, WarningIcon } from '@/components/icons';
import CheckIcon from '@/components/icons/common/CheckIcon';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import NoData from '@/components/UI/noData/nodata';
import { StateContext } from '@/context/_state/productions-orders/StateContext';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { useHandlingProductCompleted, useProductCompleted } from '@/managers/api/productions-order/useProductCompleted';
import { useQRCodProductCompleted } from '@/managers/api/productions-order/useQR';
import { useGetQcErrorDetails } from '@/managers/api/qc/useGetQcErrorDetails';
import { default as formatNumber, default as formatNumberConfig } from '@/utils/helpers/formatnumber';
import { Lexend_Deca } from '@next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { PiWarehouseLight } from 'react-icons/pi';
import { Tooltip } from 'react-tippy';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const InputNumberCustom = memo(
  ({
    state = 0,
    setState,
    className,
    classNameButton,
    classNameInput,
    min = 0,
    max = Infinity,
    disabled = false,
    isError = false,
    allowDecimal = true, // Thêm prop cho phép nhập số thập phân
    skipBlurSetState = false, // Nếu true thì blur sẽ không gọi setState ra ngoài (tránh trigger API thêm lần nữa)
  }) => {
    const [inputValue, setInputValue] = useState(state || 0);
    const [formattedValue, setFormattedValue] = useState(formatNumber(state || 0));

    useEffect(() => {
      setInputValue(state || 0);
      setFormattedValue(formatNumber(state || 0));
    }, [state]);

    const dataSeting = useSetingServer();

    const handleInputChange = useCallback(
      e => {
        if (disabled) return;
        const value = e.target.value;

        if (value === '') {
          setInputValue('');
          setFormattedValue('');
          return;
        }

        // Xử lý chuỗi đầu vào dựa vào allowDecimal
        let numericValue;
        if (allowDecimal) {
          // Cho phép nhập số thập phân - Chỉ chấp nhận dấu chấm (.) làm dấu thập phân
          // Loại bỏ tất cả ký tự không phải số hoặc dấu chấm
          numericValue = value.replace(/[^\d.]/g, '');

          // Đảm bảo chỉ có một dấu chấm
          const countDecimal = (numericValue.match(/\./g) || []).length;
          if (countDecimal > 1) {
            const lastIndex = numericValue.lastIndexOf('.');
            numericValue = numericValue.substring(0, lastIndex) + numericValue.charAt(lastIndex) + numericValue.substring(lastIndex + 1).replace(/\./g, '');
          }
        } else {
          // Chỉ nhận số nguyên
          numericValue = value.replace(/\D/g, '');
        }

        if (numericValue === '') {
          setInputValue('');
          setFormattedValue('');
          return;
        }

        // Chuyển đổi chuỗi thành số
        const numValue = allowDecimal ? parseFloat(numericValue) : parseInt(numericValue);

        // Cập nhật state nội bộ
        setInputValue(numValue);

        // Cập nhật state ra ngoài ngay khi nhập, để parent nhận được giá trị theo thời gian thực
        setState(numValue);

        // Khi đang nhập, hiển thị giá trị đúng định dạng
        // Với số thập phân, giữ nguyên dạng để người dùng tiếp tục nhập
        if (numericValue.endsWith('.')) {
          setFormattedValue(numericValue);
        } else {
          setFormattedValue(formatNumber(numValue));
        }
      },
      [disabled, allowDecimal, dataSeting]
    );

    const parseToNumber = useCallback(
      value => {
        if (allowDecimal) {
          // Cho phép nhập số thập phân - chỉ xử lý với dấu chấm
          const cleaned = value.toString().replace(/[^\d.]/g, '');
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? min : parsed;
        } else {
          // Chỉ nhận số nguyên
          const cleaned = value.toString().replace(/\D/g, '');
          const parsed = parseInt(cleaned);
          return isNaN(parsed) ? min : parsed;
        }
      },
      [min, allowDecimal]
    );

    const handleChange = useCallback(
      type => {
        if (disabled) return;
        const current = parseToNumber(state);
        let result = current;
        if (type === 'increment' && current < max) result = current + 1;
        if (type === 'decrement' && current > min) result = current - 1;
        setState(result);
      },
      [disabled, state, parseToNumber, max, min, setState]
    );

    const handleBlur = useCallback(() => {
      if (inputValue === '') {
        const finalValue = min;
        if (!skipBlurSetState) {
          setState(finalValue);
        }
        setInputValue(finalValue);
        setFormattedValue(formatNumber(finalValue));
        return;
      }

      const number = parseToNumber(inputValue);
      let finalValue = number;

      if (number < min) {
        finalValue = min;
      } else if (number > max) {
        finalValue = max;
      }

      if (!skipBlurSetState) {
        setState(finalValue);
      }
      setInputValue(finalValue);
      setFormattedValue(formatNumber(finalValue));
    }, [inputValue, min, max, parseToNumber, setState, skipBlurSetState, formatNumber]);

    const handleButtonClick = useCallback(
      (e, type) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        } else if (document.selection) {
          document.selection.empty();
        }

        handleChange(type);
      },
      [handleChange]
    );

    return (
      <div
        className={twMerge('p-1 flex items-center border rounded-full shadow-sm border-[#D0D5DD] w-fit h-fit overflow-hidden', disabled ? 'opacity-50 cursor-not-allowed' : '', className)}
        onMouseDown={e => e.preventDefault()}
        onClick={e => e.stopPropagation()}
      >
        <div
          onClick={e => handleButtonClick(e, 'decrement')}
          onMouseDown={e => e.preventDefault()}
          className={twMerge('size-9 rounded-full cursor-pointer bg-primary-05 flex justify-center items-center flex-row', classNameButton)}
        >
          <FaMinus className='text-[#25387A] hover:text-green-1' size={11} />
        </div>
        <input
          disabled={disabled}
          type='text'
          value={formattedValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          className={twMerge('w-20 text-center outline-none text-lg font-normal text-secondary-09 bg-transparent', isError && inputValue > 0 ? 'text-red-500' : '', classNameInput)}
        />
        <div
          onClick={e => handleButtonClick(e, 'increment')}
          onMouseDown={e => e.preventDefault()}
          className={twMerge('size-9 rounded-full cursor-pointer bg-primary-05 flex justify-center items-center flex-row', classNameButton)}
        >
          <FaPlus className='text-[#25387A] hover:text-green-1' size={10} />
        </div>
      </div>
    );
  }
);

InputNumberCustom.displayName = 'InputNumberCustom';

const ProductRow = memo(({ product, index, updateProductQuantity, updateProductError, handleSelectProduct, errorTags, errorImages, onAddTag, onRemoveTag, onAddImage, onRemoveImage }) => {
  const handleToggleRowSelect = useCallback(() => {
    handleSelectProduct(index, !product.selected);
  }, [index, product.selected, handleSelectProduct]);

  const [newTagInput, setNewTagInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputWidth, setInputWidth] = useState(60);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);
  const measureRef = useRef(null);
  const isAddingTagRef = useRef(false);
  const errorValue = product.error === undefined ? 0 : product.error;
  const hasError = errorValue > 0;

  // Hook lấy danh sách lỗi QC theo sản phẩm/biến thể, log dữ liệu khi thành công
  const { getQcErrorDetails, data: qcErrorDetailsData } = useGetQcErrorDetails({
    onSuccess: data => {
      console.log('QC error details response:', data);
    },
    onError: err => {
      console.error('QC error details error:', err);
    },
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (hasError) {
      setNewTagInput('');
      setInputWidth(60);
      setIsInputFocused(false);
      setImageError('');
    }
  }, [hasError]);

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
    };
  }, [debouncedGetQcErrorDetails]);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && isInputFocused);
  }, [suggestions, isInputFocused]);

  const handleAddTag = useCallback(() => {
    // Ngăn double trigger
    if (isAddingTagRef.current) return;

    if (newTagInput.trim()) {
      isAddingTagRef.current = true;
      onAddTag(index, newTagInput.trim());
      handleSelectProduct(index, true);
      setNewTagInput('');
      setInputWidth(60);
      // Reset flag sau một chút
      setTimeout(() => {
        isAddingTagRef.current = false;
      }, 100);
    }
  }, [index, newTagInput, onAddTag]);

  useEffect(() => {
    if (measureRef.current) {
      const width = Math.max(60, measureRef.current.offsetWidth + 0);
      setInputWidth(width);
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
        // Với Tab, giữ focus ở input
        if (e.key === 'Tab') {
          e.target.focus();
        }
        // e.target.value = '';
        setNewTagInput('');
      }
    },
    [handleAddTag, newTagInput]
  );

  const handleImageUpload = useCallback(
    e => {
      const files = Array.from(e.target.files || []);
      const MAX_SIZE = 1 * 1024 * 1024; // 1MB
      let hasOversize = false;

      files.forEach(file => {
        if (file.size > MAX_SIZE) {
          hasOversize = true;
          return;
        }
        if (file.type.startsWith('image/')) {
          const preview = URL.createObjectURL(file);
          onAddImage(index, { file, preview });
          handleSelectProduct(index, true);
        }
      });

      setImageError(hasOversize ? 'Kích thước ảnh không được vượt quá 1MB' : '');
      // Reset input để có thể chọn lại file giống nhau
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [index, onAddImage]
  );

  return (
    <>
      <tr className='hover:bg-gray-50 cursor-pointer' onClick={handleToggleRowSelect}>
        <td className='py-2 px-3 text-center border-b border-[#F3F3F4]'>
          <div onClick={e => e.stopPropagation()}>
            <Tooltip title='Chọn' position='bottom' arrow={true}>
              <CheckboxDefault checked={product.selected} onChange={checked => handleSelectProduct(index, checked)} />
            </Tooltip>
          </div>
        </td>
        <td className='py-2 px-3 text-center border-b border-[#F3F3F4] text-sm font-semibold'>{index + 1}</td>
        <td className='py-2 px-3 text-left border-b border-[#F3F3F4]'>
          <div className='flex gap-2'>
            <div className='w-16 h-16 rounded flex items-center justify-center'>
              <Image src={product.images || '/icon/default/default.png'} alt={product.name} width={64} height={64} className='object-cover rounded' />
            </div>
            <div className='flex flex-col gap-1'>
              <h3 className='text-sm font-semibold text-neutral-07 truncate'>{product.item_name}</h3>
              <div className='flex flex-col gap-0.5'>
                <p className='text-[10px] font-normal text-neutral-03'>{product.product_variation}</p>
                <p className='text-xs font-normal text-typo-blue-2'>{product.item_code}</p>
                <p className='text-xs font-normal text-typo-blue-2'>{product.reference_no_detail}</p>
              </div>
            </div>
          </div>
        </td>
        <td className='py-2 px-3 text-center border-b border-[#F3F3F4]'>
          <div className='flex justify-center'>
            <InputNumberCustom state={product.quantity_success} setState={value => updateProductQuantity(index, value)} allowDecimal={true} />
          </div>
        </td>
        <td className='py-2 px-3 text-center border-b border-[#F3F3F4]'>
          <div className='flex justify-center'>
            <InputNumberCustom state={errorValue} setState={value => updateProductError(index, value)} isError={true} allowDecimal={true} />
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {hasError && (
          <tr className='border-l border-b border-[#DBEBFF]'>
            <td></td>
            <td></td>
            <td colSpan={3} className='px-3 py-0 bg-gray-50' style={{ paddingTop: 0, paddingBottom: 0 }}>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
                className='flex flex-col gap-3 '
                onClick={e => e.stopPropagation()}
              >
                {/* Tags Section */}
                <div className='flex flex-col gap-2 pt-3'>
                  <div className='flex flex-wrap items-center gap-2'>
                    {errorTags &&
                      errorTags[index]?.map((tag, tagIndex) => (
                        <span key={tagIndex} className='inline-flex items-center gap-3 px-2 py-1 leading-[20px] bg-blue-100 text-[#141522] rounded-lg text-xs font-medium'>
                          {tag}
                          <button type='button' onClick={() => onRemoveTag(index, tagIndex)} className='hover:text-blue-900 focus:outline-none'>
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
                        {!isInputFocused && <PlusIcon className='size-3' />}
                        <div className='relative inline-block' style={{ width: `${inputWidth}px`, minWidth: '60px' }}>
                          <span ref={measureRef} className='absolute invisible whitespace-pre text-xs leading-[20px] px-0' style={{ font: 'inherit' }}>
                            {newTagInput || 'Nhập lỗi'}
                          </span>
                          <div className='relative'>
                            <input
                              type='text'
                              value={newTagInput}
                              onChange={e => {
                                const value = e.target.value;
                                setNewTagInput(value);
                                debouncedGetQcErrorDetails({
                                  item_id: product?.item_id ?? product?.id ?? '',
                                  item_variation_id: product?.item_variation_id ?? product?.item_variation_option_value_id ?? '',
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
                          </div>
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
                                      onAddTag(index, code.trim());
                                      setNewTagInput('');
                                      setInputWidth(60);
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
                      </button>
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div className='flex flex-wrap items-center gap-2 pb-3'>
                  {errorImages &&
                    errorImages[index]?.map((image, imgIndex) => (
                      <div key={imgIndex} className='relative w-[80px] h-[55px] rounded overflow-hidden'>
                        <Image src={image?.preview || '/icon/default/default.png'} alt={`Error ${imgIndex + 1}`} width={80} height={80} className='object-cover w-full h-full' />
                        <button type='button' onClick={() => onRemoveImage(index, imgIndex)} className='absolute top-0 right-0 bg-white text-white rounded-full p-1 hover:bg-gray-100'>
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
                        fill-rule='evenodd'
                        clip-rule='evenodd'
                        d='M6.22817 6.36833C6.22796 6.02443 6.29553 5.68385 6.42704 5.36608C6.55854 5.04831 6.7514 4.75958 6.99458 4.5164C7.23776 4.27323 7.52649 4.08037 7.84426 3.94886C8.16203 3.81736 8.5026 3.74978 8.84651 3.75H11.1532C11.4971 3.74978 11.8377 3.81736 12.1554 3.94886C12.4732 4.08037 12.7619 4.27323 13.0051 4.5164C13.2483 4.75958 13.4411 5.04831 13.5726 5.36608C13.7042 5.68385 13.7717 6.02443 13.7715 6.36833C13.7717 6.37428 13.7739 6.37998 13.7779 6.38441C13.7819 6.38884 13.7873 6.39171 13.7932 6.3925L15.6515 6.5425C16.484 6.61083 17.1682 7.22583 17.324 8.04667C17.7197 10.1405 17.749 12.287 17.4107 14.3908L17.3298 14.8942C17.2557 15.3553 17.029 15.7783 16.6861 16.0954C16.3431 16.4125 15.9037 16.6054 15.4382 16.6433L13.819 16.7742C11.2771 16.9807 8.7226 16.9807 6.18067 16.7742L4.56151 16.6433C4.09584 16.6054 3.65636 16.4123 3.3134 16.0951C2.97045 15.7778 2.74384 15.3546 2.66984 14.8933L2.58901 14.3908C2.24984 12.2867 2.27984 10.1408 2.67567 8.04667C2.75136 7.64751 2.956 7.28425 3.25814 7.01266C3.56029 6.74108 3.94324 6.57619 4.34817 6.54333L6.20651 6.3925C6.2124 6.39171 6.21782 6.38884 6.2218 6.38441C6.22577 6.37998 6.22803 6.37428 6.22817 6.36833ZM9.99984 7.70833C9.17104 7.70833 8.37618 8.03757 7.79013 8.62362C7.20408 9.20968 6.87484 10.0045 6.87484 10.8333C6.87484 11.6621 7.20408 12.457 7.79013 13.043C8.37618 13.6291 9.17104 13.9583 9.99984 13.9583C10.8286 13.9583 11.6235 13.6291 12.2095 13.043C12.7956 12.457 13.1248 11.6621 13.1248 10.8333C13.1248 10.0045 12.7956 9.20968 12.2095 8.62362C11.6235 8.03757 10.8286 7.70833 9.99984 7.70833Z'
                        fill='#5D5D5D'
                      />
                    </svg>

                    <input ref={fileInputRef} type='file' accept='image/*' multiple onChange={handleImageUpload} className='hidden' />
                  </button>
                </div>
                {imageError && <p className='text-xs text-red-500 mb-2 -mt-2'>{imageError}</p>}
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
});

ProductRow.displayName = 'ProductRow';

// Popup hiển thị trạng thái/tin nhắn cho lệnh sản xuất (hoàn thành, lỗi truy cập, v.v.)
export const PopupProductionOrderStatus = ({ onClose, className, title, description, icon: IconComponent = CheckIcon, iconClassName = 'text-[#1FC583]', isError = false }) => {
  const displayTitle = title || 'Lệnh sản xuất đã được hoàn thành';
  const displayDescription = description || 'Xin chúc mừng, lệnh sản xuất của bạn đã được hoàn thành đầy đủ!';
  return (
    <div className={`p-9 flex flex-col gap-8 justify-center items-center rounded-3xl w-[610px] bg-neutral-00 ${deca.className} ${className}`}>
      <div className='w-full flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <IconComponent className={twMerge('size-5', iconClassName)} />
          <h3 className={twMerge('text-2xl font-semibold', isError ? 'text-[#E42E23]' : 'text-[#25387A]')}>{displayTitle}</h3>
        </div>
        <motion.div
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9, rotate: -90 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className='size-6 shrink-0 text-neutral-02 cursor-pointer'
          onClick={onClose}
        >
          <CloseXIcon className='size-full' />
        </motion.div>
      </div>
      <div className='flex justify-center'>
        {isError ? (
          <Image src='/bot-ai/userFail.png' alt='Error' width={600} height={600} className='w-[300px] h-[230px]' loading='eager' priority />
        ) : (
          <Image width={267} height={200} src={'/popup/commandCompleted.webp'} alt='commandCompleted' className='object-cover size-full w-[384px]' unoptimized />
        )}
      </div>
      <p className='text-base text-typo-black-4 text-center'>{displayDescription}</p>
    </div>
  );
};

// Hàm normalize text để xử lý unicode tiếng Việt
const normalizeText = text =>
  (text || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
    .replace(/đ/g, 'd') // Chuyển đ thành d
    .replace(/Đ/g, 'd'); // Chuyển Đ thành d (phòng trường hợp có chữ hoa)

const PopupCompleteCommand = ({ onClose }) => {
  const [selectAll, setSelectAll] = useState(false);
  const { isStateProvider } = useContext(StateContext);
  const { data: productCompleted, isLoading } = useProductCompleted(isStateProvider?.productionsOrders.idDetailProductionOrder);
  const warehouses = productCompleted?.data?.warehouses;
  // console.log(productCompleted)
  const [products, setProducts] = useState([]);
  const [searchProducts, setSearchProducts] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showAutoTooltip, setShowAutoTooltip] = useState(false);
  const [autoTooltipText, setAutoTooltipText] = useState('');
  const [errorTags, setErrorTags] = useState({}); // { index: ['tag1', 'tag2'] }
  const [errorImages, setErrorImages] = useState({}); // { index: [{ file, preview }] }
  const { data: QRCode } = useQRCodProductCompleted(isStateProvider?.productionsOrders.idDetailProductionOrder);
  const showToast = useToast();

  const { onSubmit: handleProductCompleted, isLoading: isLoadingSubmit, isSuccess, isError, error, data } = useHandlingProductCompleted();

  const [isRenderErrorNVL, setIsRenderErrorNVL] = useState(false);
  const [errorNVLData, setErrorNVLData] = useState({
    items: [],
    message: '',
  });
  const hasShownTooltipRef = useRef(false);
  const [isWarehouseMissing, setIsWarehouseMissing] = useState(false);

  // Preload hình ảnh commandCompleted.webp khi component mount
  useEffect(() => {
    const img = document.createElement('img');
    img.src = '/popup/commandCompleted.webp';
  }, []);

  useEffect(() => {
    if (productCompleted?.data?.items) {
      const itemsWithDefaults = productCompleted.data.items.map((item, index) => ({
        ...item,
        selected: false,
        originalIndex: index,
        uniqueId: `product-${item.item_id || item.id || index}-${item.item_variation_option_value_id || item.reference_no_detail || index}-${index}`,
        quantity_rest: item.quantity_rest || 0,
        quantity_success: item.quantity_rest || 0,
        error: item.error || 0,
      }));
      setProducts(itemsWithDefaults);
      setSelectAll(false);
      // Reset error tags và images khi data mới được load
      setErrorTags({});
      setErrorImages({});
      // Reset flag khi data mới được load
      hasShownTooltipRef.current = false;
    }
  }, [productCompleted]);

  useEffect(() => {
    setSelectedWarehouse(null);
    setIsWarehouseMissing(false);
  }, [warehouses]);

  useEffect(() => {
    // Chỉ hiển thị tooltip một lần khi data mới được load, không phải mỗi lần products thay đổi
    if (!isLoading && productCompleted?.data?.items && productCompleted.data.items.length > 0 && !hasShownTooltipRef.current) {
      setAutoTooltipText('Chọn thành phẩm để hoàn thành');
      // Trì hoãn 1-2 nhịp để DOM anchor render ổn định rồi mới bật tooltip
      setShowAutoTooltip(false);
      let rafId;
      const openDelay = setTimeout(() => {
        rafId = requestAnimationFrame(() => {
          setShowAutoTooltip(true);
          hasShownTooltipRef.current = true;
        });
      }, 400);
      const autoCloseTimer = setTimeout(() => {
        setShowAutoTooltip(false);
        setAutoTooltipText('');
      }, 4000);
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        clearTimeout(openDelay);
        clearTimeout(autoCloseTimer);
      };
    } else {
      // Nếu đã hiển thị tooltip rồi hoặc không có data, đảm bảo nó không hiển thị
      setShowAutoTooltip(false);
      setAutoTooltipText('');
    }
  }, [isLoading, productCompleted]);

  useEffect(() => {
    if (isSuccess && data) {
      const responseData = data;
      if (responseData.isSuccess === false && responseData.data && responseData.data.errors) {
        setIsRenderErrorNVL(true);
        setErrorNVLData({
          items: responseData.data.errors || [],
          message: responseData.message || 'Số lượng NVL/BTP không đủ để xuất',
        });
        showToast('error', responseData.message || 'Số lượng NVL/BTP không đủ để xuất');
      } else if (responseData.isSuccess === false) {
        setIsRenderErrorNVL(false);
        showToast('error', responseData.message || 'Có lỗi xảy ra khi hoàn thành công đoạn!');
      } else if (responseData.isSuccess === 1) {
        setIsRenderErrorNVL(false);
        setSelectAll(false);
        showToast('success', responseData.message || 'Hoàn thành công đoạn thành công');

        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  }, [isSuccess, data, onClose]);

  const handleConfirm = useCallback(async () => {
    if (isLoadingSubmit) return;
    const selectedProducts = products.filter(product => product.selected);

    if (!selectedWarehouse) {
      setIsWarehouseMissing(true);
      showToast('error', 'Vui lòng chọn kho hàng!');
      return;
    }

    // Điều kiện 1: Phải chọn ít nhất 1 sản phẩm
    if (selectedProducts.length === 0) {
      showToast('error', 'Vui lòng chọn ít nhất một thành phẩm để hoàn thành!');
      return;
    }

    // Điều kiện 2: SL đạt > 0 cho tất cả SP được chọn
    const invalidQtyZero = selectedProducts.find(p => !p.quantity_success || Number(p.quantity_success) <= 0);
    if (invalidQtyZero) {
      showToast('error', 'Vui lòng nhập SL đạt lớn hơn 0 cho sản phẩm được chọn!');
      return;
    }

    try {
      const formatData = selectedProducts.map((product, selectedIndex) => {
        // Tìm index thực tế của product trong mảng products gốc
        const originalIndex = products.findIndex(p => p.uniqueId === product.uniqueId);
        const itemId = uuidv4();
        const imagesForItem = originalIndex !== -1 ? errorImages[originalIndex] || [] : [];

        return {
          ...product,
          id: itemId,
          quantity_success: product.quantity_success || 0,
          quantity_error: product.error || 0,
          error_tags: originalIndex !== -1 ? errorTags[originalIndex] || [] : [],
          error_images: imagesForItem.map(img => img?.file).filter(Boolean),
        };
      });

      const payload = {
        po_id: isStateProvider?.productionsOrders.idDetailProductionOrder,
        warehouse_id: selectedWarehouse?.value,
        items: formatData,
      };

      // Chuẩn bị log dữ liệu với key cho FormData (kèm file ảnh thật)
      const errorImagesFormKeys = {};
      formatData.forEach((item, itemIndex) => {
        item.error_tags?.forEach((tag, tagIndex) => {
          errorImagesFormKeys[`items[${itemIndex}][error_tags][${tagIndex}]`] = tag;
        });
        item.error_images?.forEach((file, imgIndex) => {
          errorImagesFormKeys[`error_images[${item.id}][${imgIndex}]`] = file || null;
        });
      });

      console.log('Payload với errorTags, errorImages (file) và key FormData:', {
        ...payload,
        items: formatData,
        errorImagesFormKeys,
      });

      await handleProductCompleted(payload);
    } catch (error) {
      showToast('error', error?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm hoàn thành!');
    }
  }, [products, handleProductCompleted, isStateProvider?.productionsOrders.idDetailProductionOrder, showToast, isLoadingSubmit, selectedWarehouse, setIsWarehouseMissing]);

  const updateProductQuantity = useCallback(
    (index, value) => {
      if (value === 0) {
        showToast('error', 'SL đạt không được phép bằng 0!');
        return;
      }

      setProducts(prevProducts => {
        const updatedProducts = [...prevProducts];
        updatedProducts[index] = {
          ...updatedProducts[index],
          quantity_success: value,
        };
        return updatedProducts;
      });
    },
    [showToast]
  );

  const updateProductError = useCallback((index, value) => {
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = {
        ...updatedProducts[index],
        error: value,
      };
      return updatedProducts;
    });
  }, []);

  const handleSelectAll = useCallback(checked => {
    setSelectAll(checked);
    setProducts(prevProducts => {
      const now = Date.now();
      const updatedProducts = prevProducts.map((product, index) => {
        const updatedProduct = {
          ...product,
          selected: checked,
        };

        // Nếu check, thêm checkOrder (giữ nguyên thứ tự ban đầu bằng cách dùng originalIndex)
        if (checked) {
          updatedProduct.checkOrder = now - (product.originalIndex || index);
        } else {
          // Nếu uncheck, xóa checkOrder
          delete updatedProduct.checkOrder;
        }

        return updatedProduct;
      });

      // Sắp xếp lại: các phần tử được check lên đầu (theo checkOrder), các phần tử uncheck sắp xếp theo originalIndex
      updatedProducts.sort((a, b) => {
        // Phần tử được check luôn ở đầu
        if (a.selected && !b.selected) return -1;
        if (!a.selected && b.selected) return 1;

        // Nếu cả hai đều được check, sắp xếp theo checkOrder (check gần nhất ở đầu)
        if (a.selected && b.selected) {
          return (b.checkOrder || 0) - (a.checkOrder || 0);
        }

        // Cả hai đều uncheck, sắp xếp theo originalIndex
        return (a.originalIndex || 0) - (b.originalIndex || 0);
      });

      return updatedProducts;
    });
  }, []);

  const handleSelectProduct = useCallback((index, checked) => {
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      const product = updatedProducts[index];

      // Cập nhật trạng thái selected
      const updatedProduct = {
        ...product,
        selected: checked,
      };

      // Nếu được check, chuyển phần tử lên đầu và thêm checkOrder
      if (checked) {
        // Xóa phần tử khỏi vị trí hiện tại
        updatedProducts.splice(index, 1);
        // Thêm checkOrder để giữ thứ tự check
        updatedProduct.checkOrder = Date.now();
        // Chèn vào đầu mảng
        updatedProducts.unshift(updatedProduct);
      } else {
        // Nếu uncheck, xóa checkOrder và cập nhật
        delete updatedProduct.checkOrder;
        updatedProducts[index] = updatedProduct;

        // Sắp xếp lại: các phần tử được check lên đầu (theo checkOrder), các phần tử uncheck sắp xếp theo originalIndex
        updatedProducts.sort((a, b) => {
          // Phần tử được check luôn ở đầu
          if (a.selected && !b.selected) return -1;
          if (!a.selected && b.selected) return 1;

          // Nếu cả hai đều được check, sắp xếp theo checkOrder (check gần nhất ở đầu)
          if (a.selected && b.selected) {
            return (b.checkOrder || 0) - (a.checkOrder || 0);
          }

          // Cả hai đều uncheck, sắp xếp theo originalIndex
          return (a.originalIndex || 0) - (b.originalIndex || 0);
        });
      }

      const allSelected = updatedProducts.every(product => product.selected);
      setSelectAll(allSelected);

      return updatedProducts;
    });
  }, []);

  const handleAddTag = useCallback((index, tag) => {
    setErrorTags(prev => ({
      ...prev,
      [index]: [...(prev[index] || []), tag],
    }));
  }, []);

  const handleRemoveTag = useCallback((index, tagIndex) => {
    setErrorTags(prev => {
      const newTags = { ...prev };
      if (newTags[index]) {
        newTags[index] = newTags[index].filter((_, i) => i !== tagIndex);
        if (newTags[index].length === 0) {
          delete newTags[index];
        }
      }
      return newTags;
    });
  }, []);

  const handleAddImage = useCallback((index, imageObj) => {
    setErrorImages(prev => ({
      ...prev,
      [index]: [...(prev[index] || []), imageObj],
    }));
  }, []);

  const handleRemoveImage = useCallback((index, imageIndex) => {
    setErrorImages(prev => {
      const newImages = { ...prev };
      if (newImages[index]) {
        const [removed] = newImages[index].splice(imageIndex, 1);
        if (removed?.preview) {
          URL.revokeObjectURL(removed.preview);
        }
        if (newImages[index].length === 0) {
          delete newImages[index];
        }
      }
      return newImages;
    });
  }, []);

  const selectedCount = useMemo(() => products.filter(product => product.selected).length, [products]);

  // Filter products dựa trên search (theo tên và mã)
  const filteredProducts = useMemo(() => {
    if (!searchProducts.trim()) {
      return products;
    }
    const normalizedSearch = normalizeText(searchProducts);
    return products.filter(product => {
      const normalizedName = normalizeText(product.item_name || '');
      const normalizedCode = normalizeText(product.item_code || '');
      return normalizedName.includes(normalizedSearch) || normalizedCode.includes(normalizedSearch);
    });
  }, [products, searchProducts]);
  const dataSeting = useSetingServer();

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  const warehouseImportId = productCompleted?.data?.warehouse_import_id;

  const warehouseOptions = useMemo(() => {
    if (!warehouses) return [];
    return warehouses.map(warehouse => ({
      value: warehouse.id,
      label: warehouse.name,
      ...warehouse,
    }));
  }, [warehouses]);

  useEffect(() => {
    if (!warehouseOptions.length) {
      setSelectedWarehouse(null);
      setIsWarehouseMissing(false);
      return;
    }

    const matchedWarehouse = warehouseOptions.find(option => `${option.value}` === `${warehouseImportId}`);

    setSelectedWarehouse(matchedWarehouse || null);
    setIsWarehouseMissing(false);
  }, [warehouseOptions, warehouseImportId]);

  const handleWarehouseChange = useCallback(option => {
    setSelectedWarehouse(option);
    setIsWarehouseMissing(false);
  }, []);

  const isAccessDenied = !isLoading && productCompleted?.isSuccess === false;

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : isAccessDenied ? (
        <PopupProductionOrderStatus
          onClose={onClose}
          title='Thông báo'
          description={productCompleted?.message || 'Truy cập bị từ chối'}
          icon={WarningIcon}
          iconClassName='text-[#EE1E1E]'
          isError={true}
          className='text-center'
        />
      ) : products.length === 0 ? (
        <PopupProductionOrderStatus onClose={onClose} />
      ) : (
        <div className={`p-6 flex flex-col gap-6 rounded-3xl w-[90vw] xl:w-[1085px] max-h-[90vh] bg-neutral-00 ${deca.className}`}>
          <div className='flex gap-2 justify-between items-start'>
            <div className='flex flex-col gap-1'>
              <h2 className='text-2xl font-bold capitalize'>Hoàn thành tổng lệnh</h2>
              <p className='text-base text-blue-fmrp'>{QRCode?.data?.reference_no}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-2 items-center'>
                <SelectComponent
                  options={warehouseOptions}
                  value={selectedWarehouse}
                  onChange={handleWarehouseChange}
                  isClearable={true}
                  icon={<PiWarehouseLight color='#9295A4' className='size-4' />}
                  closeMenuOnSelect={true}
                  hideSelectedOptions={false}
                  placeholder='Chọn kho hàng'
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderRadius: '8px',
                      borderColor: isWarehouseMissing ? '#ef4444' : state.isFocused ? '#0F4F9E' : base.borderColor,
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: isWarehouseMissing ? '#ef4444' : state.isFocused ? '#0F4F9E' : base.borderColor,
                      },
                    }),
                  }}
                  isSearchable={true}
                />
                <Tooltip title='Quét QR để hoàn thành công đoạn trên app FMRP' position='left' arrow={true}>
                  <Image src={QRCode?.data?.qr || '/qrCode/QR.png'} alt='complete-command' width={50} height={50} className='rounded-[4px]' />
                </Tooltip>

                <button onClick={handleConfirm} disabled={isLoadingSubmit} className='flex items-center gap-2 text-sm font-medium rounded-lg py-3 px-4 w-fit text-white bg-blue-fmrp hover:opacity-80'>
                  {isLoadingSubmit ? <span className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white'></span> : <CheckIcon className='size-4' />}
                  {isLoadingSubmit ? 'Đang xử lý...' : `Xác nhận${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
                </button>
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9, rotate: -90 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className='size-6 shrink-0 text-neutral-02 cursor-pointer'
                  onClick={onClose}
                >
                  <CloseXIcon className='size-full' />
                </motion.div>
              </div>
              <div className='pr-7'>
                <div className='flex gap-x-2 items-center w-full rounded-lg border border-[#D0D5DD] px-4 py-2 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500'>
                  <input
                    type='text'
                    placeholder='Tìm kiếm theo tên và mã sản phẩm'
                    className='flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-200'
                    value={searchProducts}
                    onChange={e => setSearchProducts(e.target.value)}
                  />
                  {searchProducts && (
                    <button type='button' className='rounded-full bg-gray-100 hover:bg-gray-200 text-[#3A3E4C] p-1 transition' aria-label='Xóa tìm kiếm' onClick={() => setSearchProducts('')}>
                      <CloseXIcon className='size-3' />
                    </button>
                  )}
                  <button type='button' className='rounded-lg bg-[#1760B9] p-1'>
                    <MagnifyingGlassIcon className='size-4 text-white' />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <Customscrollbar className='max-h-[60vh] pr-2'>
            {isRenderErrorNVL && (
              <div className='py-2 px-3 flex flex-col gap-2 bg-[#FFEEF0] border border-[#991B1B] rounded-lg'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-1'>
                    <WarningIcon className='size-5 text-[#991B1B]' />
                    <h3 className='text-sm font-normal text-neutral-07'>
                      <span className='font-semibold text-[#EE1E1E]'>{errorNVLData.items.length}</span> nguyên vật liệu dưới đây chưa được xuất kho, vui lòng xuất trước khi hoàn thành!
                    </h3>
                  </div>
                  <CloseXIcon className='size-5 cursor-pointer' onClick={() => setIsRenderErrorNVL(false)} />
                </div>
                <div className='flex flex-col gap-1'>
                  {errorNVLData.items.map((item, index) => (
                    <div key={index} className='px-3 py-1 flex items-center justify-between gap-1'>
                      <div className='flex items-center gap-2'>
                        <Image src={'/icon/default/default.png'} alt='default' width={36} height={36} className='object-cover rounded' />
                        <div className='flex flex-col gap-0.5'>
                          <h3 className='text-sm font-semibold text-neutral-07'>{item.item_name}</h3>
                          <p className='text-xs font-normal text-neutral-03'>{item.product_variation}</p>
                        </div>
                      </div>
                      <p className='text-sm font-normal text-neutral-07'>
                        <span className='text-lg font-medium text-[#EE1E1E]'>{formatNumber(item.quantity_missing)}</span>/{item.unit_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <table className='min-w-full border-separate border-spacing-0'>
              <thead className='sticky top-0 bg-white'>
                <tr>
                  <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[62px]'>
                    <Tooltip
                      key={showAutoTooltip ? 'guide-open' : 'guide-closed'}
                      title={autoTooltipText}
                      position='top'
                      arrow={true}
                      trigger='manual'
                      open={showAutoTooltip && !!autoTooltipText}
                      onRequestClose={() => {
                        setShowAutoTooltip(false);
                        setAutoTooltipText('');
                      }}
                    >
                      <span className='inline-flex'>
                        <Tooltip title={'Chọn tất cả'} position='top' arrow={true}>
                          <CheckboxDefault checked={selectAll} onChange={handleSelectAll} />
                        </Tooltip>
                      </span>
                    </Tooltip>
                  </th>
                  <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[62px]'>STT</th>
                  <th className='py-2 px-3 border-b border-gray-200 text-left text-sm font-semibold text-neutral-02'>Thành phẩm</th>
                  <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[200px]'>SL đạt</th>
                  <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[200px]'>SL lỗi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='py-8'>
                      <NoData type='table' titleText='Không tìm thấy sản phẩm' />
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <ProductRow
                      key={product.uniqueId || `product-row-${product.originalIndex !== undefined ? product.originalIndex : index}`}
                      product={product}
                      index={index}
                      updateProductQuantity={updateProductQuantity}
                      updateProductError={updateProductError}
                      handleSelectProduct={handleSelectProduct}
                      errorTags={errorTags}
                      errorImages={errorImages}
                      onAddTag={handleAddTag}
                      onRemoveTag={handleRemoveTag}
                      onAddImage={handleAddImage}
                      onRemoveImage={handleRemoveImage}
                    />
                  ))
                )}
              </tbody>
            </table>
          </Customscrollbar>
        </div>
      )}
    </>
  );
};

export default PopupCompleteCommand;
