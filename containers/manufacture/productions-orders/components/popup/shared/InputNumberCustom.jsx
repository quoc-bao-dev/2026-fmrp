import useSetingServer from '@/hooks/useConfigNumber';
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
  }) => {
    const dataSeting = useSetingServer();
    const [inputValue, setInputValue] = useState(state || 0);
    const [formattedValue, setFormattedValue] = useState(
      useConfigFormat ? formatNumberConfig(state || 0, dataSeting) : formatNumberConfig(state || 0)
    );

    useEffect(() => {
      setInputValue(state || 0);
      setFormattedValue(useConfigFormat ? formatNumberConfig(state || 0, dataSeting) : formatNumberConfig(state || 0));
    }, [state, dataSeting, useConfigFormat]);

    const formatNumber = useCallback(
      number => {
        return useConfigFormat ? formatNumberConfig(+number, dataSeting) : formatNumberConfig(+number);
      },
      [dataSeting, useConfigFormat]
    );

    const parseNumericValue = useCallback(
      value => {
        const strValue = String(value ?? '');
        if (allowDecimal) {
          let cleaned = strValue.replace(/[^\d.]/g, '');
          // Chỉ cho phép 1 dấu chấm
          const parts = cleaned.split('.');
          if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
          }
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? min : parsed;
        } else {
          const cleaned = strValue.replace(/\D/g, '');
          const parsed = parseInt(cleaned);
          return isNaN(parsed) ? min : parsed;
        }
      },
      [min, allowDecimal]
    );

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
        setInputValue(numValue);

        if (numericValue.endsWith('.')) {
          setFormattedValue(numericValue);
        } else {
          setFormattedValue(formatNumber(numValue));
        }
      },
      [disabled, allowDecimal, formatNumber, parseNumericValue]
    );

    const handleBlur = useCallback(() => {
      const number = inputValue === '' ? min : parseNumericValue(inputValue);
      const finalValue = number < min ? min : number;
      setState(finalValue);
      setInputValue(finalValue);
      setFormattedValue(formatNumber(finalValue));
    }, [inputValue, min, setState, formatNumber, parseNumericValue]);

    const handleIncrement = useCallback(() => {
      if (disabled) return;
      const current = parseNumericValue(inputValue);
      const newValue = current + 1;
      setState(newValue);
      setInputValue(newValue);
      setFormattedValue(formatNumber(newValue));
    }, [disabled, inputValue, setState, formatNumber, parseNumericValue]);

    const handleDecrement = useCallback(() => {
      if (disabled) return;
      const current = parseNumericValue(inputValue);
      if (current > min) {
        const newValue = current - 1;
        setState(newValue);
        setInputValue(newValue);
        setFormattedValue(formatNumber(newValue));
      }
    }, [disabled, inputValue, min, setState, formatNumber, parseNumericValue]);

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

