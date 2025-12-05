import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { default as formatNumberConfig } from '@/utils/helpers/formatnumber';
import { memo, useCallback, useEffect, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';

const InputNumberCustom = memo(
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
    allowDecimal = true,
    useConfigFormat = true, // Flag để dùng formatNumberConfig với setting hoặc formatNumber thông thường
    exceedMessage = 'Số lượng vượt quá giới hạn',
    underflowMessage = 'Số lượng không được âm',
  }) => {
    const dataSeting = useSetingServer();
    const showToast = useToast();
    const [inputValue, setInputValue] = useState(state || 0);
    const [formattedValue, setFormattedValue] = useState(
      useConfigFormat ? formatNumberConfig(state || 0, dataSeting) : formatNumberConfig(state || 0)
    );

    const formatNumber = useCallback(
      number => {
        return useConfigFormat ? formatNumberConfig(+number, dataSeting) : formatNumberConfig(+number);
      },
      [dataSeting, useConfigFormat]
    );

    const parseNumericValue = useCallback(
      value => {
        const strValue = String(value ?? '');
        const normalizedMin = Math.max(min, 0);
        if (allowDecimal) {
          let cleaned = strValue.replace(/[^\d.]/g, '');
          // Chỉ cho phép 1 dấu chấm
          const parts = cleaned.split('.');
          if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
          }
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? normalizedMin : parsed;
        } else {
          const cleaned = strValue.replace(/\D/g, '');
          const parsed = parseInt(cleaned);
          return isNaN(parsed) ? normalizedMin : parsed;
        }
      },
      [min, allowDecimal]
    );

    const clampValue = useCallback(
      value => {
        const numeric = parseNumericValue(value);
        const normalizedMin = Math.max(min, 0);
        if (numeric > max) return max;
        if (numeric < normalizedMin) return normalizedMin;
        return numeric;
      },
      [max, min, parseNumericValue]
    );

    useEffect(() => {
      const clamped = clampValue(state || 0);
      setInputValue(clamped);
      setFormattedValue(useConfigFormat ? formatNumberConfig(clamped || 0, dataSeting) : formatNumberConfig(clamped || 0));
    }, [state, dataSeting, useConfigFormat, clampValue]);

    const handleInputChange = useCallback(
      e => {
        if (disabled) return;
        const value = e.target.value;

        if (value === '') {
          setInputValue('');
          setFormattedValue('');
          return;
        }

        const numericValue = allowDecimal ? value.replace(/[^\d.]/g, '') : value.replace(/\D/g, '');
        if (numericValue === '') {
          setInputValue('');
          setFormattedValue('');
          return;
        }

        const numValue = parseNumericValue(numericValue);
        const normalizedMin = Math.max(min, 0);
        let clamped = numValue;
        if (numValue > max) {
          clamped = max;
          showToast('error', exceedMessage);
        } else if (numValue < normalizedMin) {
          clamped = normalizedMin;
          showToast('error', underflowMessage);
        }
        setInputValue(clamped);

        if (numericValue.endsWith('.')) {
          setFormattedValue(numericValue);
        } else {
          setFormattedValue(formatNumber(clamped));
        }
      },
      [disabled, allowDecimal, formatNumber, parseNumericValue, max, min, showToast, exceedMessage, underflowMessage]
    );

    const handleBlur = useCallback(() => {
      const normalizedMin = Math.max(min, 0);
      const number = inputValue === '' ? normalizedMin : parseNumericValue(inputValue);
      const finalValue = number < normalizedMin ? normalizedMin : number > max ? max : number;
      setState(finalValue);
      setInputValue(finalValue);
      setFormattedValue(formatNumber(finalValue));
    }, [inputValue, min, max, setState, formatNumber, parseNumericValue]);

    const handleIncrement = useCallback(() => {
      if (disabled) return;
      const current = parseNumericValue(inputValue);
      if (current >= max) {
        showToast('error', exceedMessage);
        return;
      }
      const newValue = Math.min(current + 1, max);
      setState(newValue);
      setInputValue(newValue);
      setFormattedValue(formatNumber(newValue));
    }, [disabled, inputValue, max, setState, formatNumber, parseNumericValue, showToast, exceedMessage]);

    const handleDecrement = useCallback(() => {
      if (disabled) return;
      const current = parseNumericValue(inputValue);
      const normalizedMin = Math.max(min, 0);
      if (current <= normalizedMin) {
        showToast('error', underflowMessage);
        return;
      }
      const newValue = current - 1;
      setState(newValue);
      setInputValue(newValue);
      setFormattedValue(formatNumber(newValue));
    }, [disabled, inputValue, min, setState, formatNumber, parseNumericValue, showToast, underflowMessage]);

    const handleButtonClick = useCallback(
      (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        } else if (document.selection) {
          document.selection.empty();
        }
        type === 'increment' ? handleIncrement() : handleDecrement();
      },
      [handleIncrement, handleDecrement]
    );

    // Xác định className dựa trên useConfigFormat
    const containerClassName = useConfigFormat
      ? 'p-1 flex items-center rounded-full border border-[#E5E7EB] w-fit h-fit overflow-hidden bg-white'
      : 'p-1 flex items-center border rounded-full shadow-sm border-[#D0D5DD] w-fit h-fit overflow-hidden bg-white';

    const buttonSizeClassName = useConfigFormat ? 'size-[34px]' : 'size-9';

    return (
      <div
        className={twMerge(
          containerClassName,
          disabled ? 'opacity-50 cursor-not-allowed' : useConfigFormat ? 'hover:border-[#D0D5DD] transition-all duration-200' : '',
          className
        )}
        onMouseDown={e => e.preventDefault()}
      >
        <div
          onClick={e => handleButtonClick(e, 'decrement')}
          onMouseDown={e => e.preventDefault()}
          className={twMerge(`${buttonSizeClassName} rounded-full cursor-pointer bg-primary-05 flex justify-center items-center flex-row`, classNameButton)}
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
          className={twMerge('w-20 text-center outline-none text-lg font-normal text-[#1B1A18] bg-transparent', isError && inputValue > 0 ? 'text-red-500' : '', classNameInput)}
        />
        <div
          onClick={e => handleButtonClick(e, 'increment')}
          onMouseDown={e => e.preventDefault()}
          className={twMerge(`${buttonSizeClassName} rounded-full cursor-pointer bg-primary-05 flex justify-center items-center flex-row`, classNameButton)}
        >
          <FaPlus className='text-[#25387A] hover:text-green-1' size={10} />
        </div>
      </div>
    );
  }
);

InputNumberCustom.displayName = 'InputNumberCustom';

export default InputNumberCustom;

