import { useEffect, useState, useCallback } from 'react';
import formatNumber from '@/utils/helpers/formatnumber';
import useSetingServer from '@/hooks/useConfigNumber';

/**
 * PriceInput
 * - Only accept numbers
 * - Format money using system formatNumber
 * - Has defaultValue prop (default = 0)
 */
const PriceInput = ({ defaultValue = 0, value, onChange, className = '', suffix }) => {
  const settings = useSetingServer();
  const [rawValue, setRawValue] = useState(typeof (value ?? defaultValue) === 'number' ? value ?? defaultValue : 0);
  const [display, setDisplay] = useState('');

  // Sync external value/defaultValue
  useEffect(() => {
    const initial = typeof (value ?? defaultValue) === 'number' ? value ?? defaultValue : 0;
    setRawValue(initial);
    setDisplay(formatNumber(initial, settings));
  }, [value, defaultValue, settings]);

  const handleChange = useCallback(
    e => {
      const input = e.target.value || '';
      // Keep only digits
      const numeric = input.replace(/\D/g, '');
      const num = numeric === '' ? 0 : parseInt(numeric, 10);

      setRawValue(num);
      setDisplay(numeric === '' ? '' : formatNumber(num, settings));
      onChange && onChange(num);
    },
    [onChange, settings]
  );

  const handleBlur = useCallback(() => {
    // On blur, ensure display is formatted (0 if empty)
    const normalized = typeof rawValue === 'number' ? rawValue : 0;
    setRawValue(normalized);
    setDisplay(formatNumber(normalized, settings));
  }, [rawValue, settings]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type='text'
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        className='focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2'
      />
      {suffix && <span className='text-xs mb-2 text-[#52575E]'>{suffix}</span>}
    </div>
  );
};

export default PriceInput;
