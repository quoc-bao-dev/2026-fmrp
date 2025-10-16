import { forwardRef, useState } from 'react';
import { CloseCircle } from 'iconsax-react';

/**
 * Input component with clear functionality
 * @description Reusable input component with forwardRef, error states, and clear button
 * @param {Object} props - Component props
 * @param {string} [props.placeholder] - Input placeholder text
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.hasError] - Whether input has error state
 * @param {string} [props.errorMessage] - Error message to display
 * @param {Function} [props.onClear] - Callback when clear button is clicked
 * @param {boolean} [props.showClear] - Whether to show clear button (default: true)
 * @param {string} [props.type] - Input type (default: 'text')
 * @param {Object} [props.register] - React Hook Form register object
 * @param {Object} [props.error] - React Hook Form error object
 * @returns {JSX.Element} Rendered input component
 * @example
 * // Basic usage
 * <Input placeholder="Enter text" />
 *
 * // With React Hook Form
 * <Input
 *   placeholder="Phone number"
 *   {...register('phone')}
 *   error={errors.phone}
 * />
 *
 * // With custom clear handler
 * <Input
 *   placeholder="Search"
 *   onClear={() => setValue('')}
 * />
 */
const Input = forwardRef(({ placeholder = '', className = '', hasError = false, errorMessage = '', onClear, showClear = true, type = 'text', register, error, value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState('');
    const currentValue = value !== undefined ? value : internalValue;
    const currentError = error || (hasError ? { message: errorMessage } : null);
    const hasValue = currentValue && currentValue.toString().length > 0;

    const handleChange = e => {
        const newValue = e.target.value;
        if (value === undefined) {
            setInternalValue(newValue);
        }
        if (onChange) {
            onChange(e);
        }
    };

    const handleClear = () => {
        if (onClear) {
            onClear();
        } else {
            if (value === undefined) {
                setInternalValue('');
            }
            // Trigger onChange with empty value
            const event = { target: { value: '' } };
            if (onChange) {
                onChange(event);
            }
        }
    };

    const inputProps = {
        type,
        placeholder,
        value: currentValue,
        onChange: handleChange,
        className: `${currentError ? 'border-red-500 border' : 'border-[#cccccc]'} border outline-none focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-3 ${
            showClear && hasValue ? 'pr-12' : ''
        } rounded-md w-full ${className}`,
        ...props,
    };

    // Merge with register if provided
    if (register) {
        Object.assign(inputProps, register);
    }

    return (
        <div className='relative'>
            <input ref={ref} {...inputProps} />
            {showClear && hasValue && (
                <button type='button' onClick={handleClear} className='absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:text-gray-600 transition-colors'>
                    <CloseCircle size={20} />
                </button>
            )}
            {currentError && <span className='text-xs text-red-500 mt-1 inline-block'>{currentError.message}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
