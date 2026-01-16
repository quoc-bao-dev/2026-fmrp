import useSetingServer from '@/hooks/useConfigNumber';
import { NumericFormat } from 'react-number-format';

/**
 * PriceInput
 * - Only accept numbers
 * - Format money using NumericFormat (same logic as inputMoneyFormat)
 * - Has defaultValue prop (default = 0)
 */
const PriceInput = ({ defaultValue = 0, value, onChange, className = '', suffix }) => {
  const dataSeting = useSetingServer();

  const handleValueChange = values => {
    const numValue = values.floatValue ?? (values.value === '' ? defaultValue : 0);
    onChange && onChange(numValue);
  };

  const inputValue = value ?? defaultValue;
  const numericValue = typeof inputValue === 'number' ? inputValue : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <NumericFormat
        value={numericValue}
        onValueChange={handleValueChange}
        thousandSeparator={dataSeting?.thousand_separator}
        decimalSeparator={dataSeting?.decimal_separator}
        // decimalScale={2}
        allowNegative={false}
        className='focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2'
      />
      {suffix && <span className='text-xs mb-2 text-[#52575E]'>{suffix}</span>}
    </div>
  );
};

export default PriceInput;
