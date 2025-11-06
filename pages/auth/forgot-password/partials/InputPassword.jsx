import { forwardRef, useState } from 'react';
import { Eye as IconEye, EyeSlash as IconEyeSlash, CloseCircle } from 'iconsax-react';

/**
 * InputPassword component with visibility toggle and clear functionality
 * @description Reusable password input component with forwardRef, error states, clear button, and visibility toggle
 * @param {Object} props - Component props
 * @param {string} [props.placeholder] - Input placeholder text
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.hasError] - Whether input has error state
 * @param {string} [props.errorMessage] - Error message to display
 * @param {Function} [props.onClear] - Callback when clear button is clicked
 * @param {boolean} [props.showClear] - Whether to show clear button (default: true)
 * @param {boolean} [props.showToggle] - Whether to show visibility toggle (default: true)
 * @param {Object} [props.register] - React Hook Form register object
 * @param {Object} [props.error] - React Hook Form error object
 * @returns {JSX.Element} Rendered password input component
 * @example
 * // Basic usage
 * <InputPassword placeholder="Enter password" />
 *
 * // With React Hook Form
 * <InputPassword
 *   placeholder="New password"
 *   {...register('newPassword')}
 *   error={errors.newPassword}
 * />
 *
 * // With custom handlers
 * <InputPassword
 *   placeholder="Password"
 *   onClear={() => setValue('')}
 *   showToggle={false}
 * />
 */
const InputPassword = forwardRef(
    ({ placeholder = '', className = '', hasError = false, errorMessage = '', onClear, showClear = true, showToggle = true, register, error, value, onChange, ...props }, ref) => {
        const [internalValue, setInternalValue] = useState('');
        const [showPassword, setShowPassword] = useState(false);
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

        const toggleVisibility = () => {
            setShowPassword(!showPassword);
        };

        // Calculate right padding based on visible buttons
        let rightPadding = 'pr-5';
        if (showToggle && showClear && hasValue) {
            rightPadding = 'pr-20'; // Space for both toggle and clear buttons
        } else if (showToggle || (showClear && hasValue)) {
            rightPadding = 'pr-12'; // Space for one button
        }

        const inputProps = {
            type: showPassword ? 'text' : 'password',
            placeholder,
            value: currentValue,
            onChange: handleChange,
            className: `${
                currentError ? 'border-red-500 border' : 'border-[#cccccc]'
            } border outline-none focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-3 ${rightPadding} rounded-md w-full ${className}`,
            ...props,
        };

        // Merge with register if provided
        if (register) {
            Object.assign(inputProps, register);
        }

        return (
            <div className='relative'>
                <input ref={ref} {...inputProps} />

                {/* Button container */}
                <div className='absolute top-1/2 -translate-y-1/2 right-3 flex items-center space-x-1'>
                    {/* Clear button */}
                    {showClear && hasValue && (
                        <button type='button' onClick={handleClear} className='text-gray-400 hover:text-gray-600 transition-colors'>
                            <CloseCircle size={20} />
                        </button>
                    )}

                    {/* Visibility toggle button */}
                    {showToggle && (
                        <button type='button' onClick={toggleVisibility} className='text-gray-400 hover:text-gray-600 transition-colors'>
                            {showPassword ? <IconEyeSlash size={20} /> : <IconEye size={20} />}
                        </button>
                    )}
                </div>

                {currentError && <span className='text-xs text-red-500 mt-1 inline-block'>{currentError.message}</span>}
            </div>
        );
    }
);

InputPassword.displayName = 'InputPassword';

export default InputPassword;
